"""
Kubernetes Autoscaler Controller
Implements intelligent scaling logic combining AI predictions with reactive thresholds.
"""

import asyncio
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional

import httpx
from kubernetes import client, config

logger = logging.getLogger(__name__)


class AutoscalerController:
    """
    Intelligent Kubernetes Autoscaler Controller.
    
    Implements hybrid scaling strategy:
    - AI Predictive Scaling: Uses LSTM predictions to proactively scale
    - Reactive Scaling: Falls back to CPU/memory thresholds
    - Cooldown Protection: Prevents flapping with configurable cooldowns
    """
    
    def __init__(
        self,
        prometheus_url: str = "http://prometheus:9090",
        ml_engine_url: str = "http://ml-engine:5000",
        cpu_scale_up: float = 75.0,
        cpu_scale_down: float = 30.0,
        min_replicas: int = 1,
        max_replicas: int = 20,
        cooldown_seconds: int = 300,
        confidence_threshold: float = 0.85,
    ):
        self.prometheus_url = prometheus_url
        self.ml_engine_url = ml_engine_url
        self.cpu_scale_up = cpu_scale_up
        self.cpu_scale_down = cpu_scale_down
        self.min_replicas = min_replicas
        self.max_replicas = max_replicas
        self.cooldown_seconds = cooldown_seconds
        self.confidence_threshold = confidence_threshold
        
        # Tracking state
        self._last_scale_time: Dict[str, float] = {}
        self._scale_history: List[Dict] = []
        self._running = False
        
        # Initialize K8s client
        self._init_kubernetes()
    
    def _init_kubernetes(self):
        """Initialize Kubernetes client."""
        try:
            config.load_incluster_config()
            logger.info("Using in-cluster Kubernetes config")
        except config.ConfigException:
            try:
                config.load_kube_config()
                logger.info("Using local kubeconfig")
            except Exception:
                logger.warning("No Kubernetes config found, running in simulation mode")
        
        self.k8s_apps = client.AppsV1Api()
        self.k8s_core = client.CoreV1Api()
    
    async def start(self):
        """Start the autoscaler controller loop."""
        self._running = True
        logger.info("Autoscaler controller started")
        
        while self._running:
            try:
                await self._evaluate_all_deployments()
                await asyncio.sleep(60)  # Check every minute
            except Exception as e:
                logger.error(f"Autoscaler error: {e}")
                await asyncio.sleep(30)
    
    def stop(self):
        """Stop the autoscaler."""
        self._running = False
        logger.info("Autoscaler controller stopped")
    
    async def _evaluate_all_deployments(self):
        """Evaluate scaling for all deployments."""
        deployments = await self._get_monitored_deployments()
        
        for dep in deployments:
            try:
                await self._evaluate_deployment(dep)
            except Exception as e:
                logger.error(f"Error evaluating {dep['name']}: {e}")
    
    async def _evaluate_deployment(self, deployment: Dict):
        """Evaluate scaling for a single deployment."""
        name = deployment["name"]
        namespace = deployment["namespace"]
        key = f"{namespace}/{name}"
        current_replicas = deployment["replicas"]
        
        # Check cooldown
        if self._is_in_cooldown(key):
            return
        
        # Get current metrics
        current_cpu = await self._get_cpu_usage(name, namespace)
        
        # Get AI prediction
        prediction = await self._get_ai_prediction(name, namespace)
        predicted_cpu = prediction.get("average_predicted", current_cpu)
        confidence = prediction.get("confidence_score", 0) / 100.0
        
        # Decision logic
        action = None
        target_replicas = current_replicas
        reason = ""
        
        if confidence >= self.confidence_threshold:
            # AI-driven scaling
            if predicted_cpu > self.cpu_scale_up and current_replicas < self.max_replicas:
                target_replicas = min(current_replicas + 1, self.max_replicas)
                action = "scale_up"
                reason = f"AI predicts high CPU ({predicted_cpu:.1f}%) with {confidence*100:.0f}% confidence"
            elif predicted_cpu < self.cpu_scale_down and current_replicas > self.min_replicas:
                target_replicas = max(current_replicas - 1, self.min_replicas)
                action = "scale_down"
                reason = f"AI predicts low CPU ({predicted_cpu:.1f}%) with {confidence*100:.0f}% confidence"
        else:
            # Reactive fallback scaling
            if current_cpu > self.cpu_scale_up and current_replicas < self.max_replicas:
                target_replicas = min(current_replicas + 1, self.max_replicas)
                action = "scale_up"
                reason = f"Current CPU ({current_cpu:.1f}%) exceeds threshold"
            elif current_cpu < self.cpu_scale_down and current_replicas > self.min_replicas:
                target_replicas = max(current_replicas - 1, self.min_replicas)
                action = "scale_down"
                reason = f"Current CPU ({current_cpu:.1f}%) below threshold"
        
        # Execute scaling if needed
        if action and target_replicas != current_replicas:
            await self._execute_scale(name, namespace, target_replicas, action, reason, confidence)
            self._last_scale_time[key] = time.time()
    
    async def _execute_scale(
        self,
        name: str,
        namespace: str,
        replicas: int,
        action: str,
        reason: str,
        confidence: float,
    ):
        """Execute scaling operation."""
        try:
            # Patch deployment
            patch = {"spec": {"replicas": replicas}}
            self.k8s_apps.patch_namespaced_deployment_scale(
                name=name,
                namespace=namespace,
                body=patch,
            )
            
            event = {
                "deployment": name,
                "namespace": namespace,
                "from_replicas": replicas - (1 if action == "scale_up" else -1),
                "to_replicas": replicas,
                "action": action,
                "reason": reason,
                "confidence": confidence,
                "timestamp": datetime.utcnow().isoformat(),
                "success": True,
            }
            self._scale_history.append(event)
            logger.info(f"Scaled {name} to {replicas} replicas: {reason}")
            
        except Exception as e:
            logger.error(f"Failed to scale {name}: {e}")
    
    async def _get_ai_prediction(self, name: str, namespace: str) -> Dict:
        """Get AI prediction from ML engine."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.ml_engine_url}/predict",
                    json={"deployment_name": name, "namespace": namespace},
                    timeout=10.0,
                )
                if response.status_code == 200:
                    return response.json()
        except Exception as e:
            logger.debug(f"ML engine unavailable: {e}")
        
        return {"average_predicted": 50.0, "confidence_score": 0}
    
    async def _get_cpu_usage(self, name: str, namespace: str) -> float:
        """Get current CPU usage from Prometheus."""
        try:
            query = f'avg(rate(container_cpu_usage_seconds_total{{namespace="{namespace}",pod=~"{name}-.*"}}[5m])) * 100'
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.prometheus_url}/api/v1/query",
                    params={"query": query},
                    timeout=5.0,
                )
                data = response.json()
                if data["status"] == "success" and data["data"]["result"]:
                    return float(data["data"]["result"][0]["value"][1])
        except Exception as e:
            logger.debug(f"Prometheus query failed: {e}")
        
        return 50.0  # Default fallback
    
    async def _get_monitored_deployments(self) -> List[Dict]:
        """Get list of deployments to monitor."""
        try:
            deps = self.k8s_apps.list_deployment_for_all_namespaces()
            return [
                {
                    "name": d.metadata.name,
                    "namespace": d.metadata.namespace,
                    "replicas": d.spec.replicas or 1,
                }
                for d in deps.items
                if d.metadata.namespace not in ["kube-system", "kubegenius-system"]
            ]
        except Exception:
            # Return mock data if K8s unavailable
            return [
                {"name": "frontend-app", "namespace": "app-frontend", "replicas": 4},
                {"name": "backend-api", "namespace": "app-backend", "replicas": 6},
                {"name": "ml-predictor", "namespace": "app-ml", "replicas": 3},
            ]
    
    def _is_in_cooldown(self, key: str) -> bool:
        """Check if deployment is in cooldown period."""
        if key not in self._last_scale_time:
            return False
        elapsed = time.time() - self._last_scale_time[key]
        return elapsed < self.cooldown_seconds
    
    def get_scaling_history(self, limit: int = 50) -> List[Dict]:
        """Get recent scaling history."""
        return self._scale_history[-limit:]
    
    def get_status(self) -> Dict:
        """Get controller status."""
        return {
            "running": self._running,
            "mode": "hybrid",
            "cpu_scale_up_threshold": self.cpu_scale_up,
            "cpu_scale_down_threshold": self.cpu_scale_down,
            "min_replicas": self.min_replicas,
            "max_replicas": self.max_replicas,
            "cooldown_seconds": self.cooldown_seconds,
            "total_scale_events": len(self._scale_history),
        }

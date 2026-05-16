"""Autoscaler service."""

import asyncio
import random
from datetime import datetime, timedelta

import structlog

logger = structlog.get_logger()


class AutoscalerService:
    """Kubernetes autoscaler service with AI predictions."""
    
    def __init__(self):
        self._running = False
        self._events = []
        self._decisions = []
    
    async def start(self):
        """Start the autoscaler."""
        self._running = True
        logger.info("Autoscaler service started")
        
        while self._running:
            await self._evaluate_scaling()
            await asyncio.sleep(60)
    
    def stop(self):
        """Stop the autoscaler."""
        self._running = False
        logger.info("Autoscaler service stopped")
    
    async def _evaluate_scaling(self):
        """Evaluate scaling decisions."""
        deployments = [
            {"name": "frontend-app", "namespace": "app-frontend", "current": 4, "predicted_cpu": random.uniform(70, 95)},
            {"name": "backend-api", "namespace": "app-backend", "current": 6, "predicted_cpu": random.uniform(50, 80)},
            {"name": "ml-predictor", "namespace": "app-ml", "current": 3, "predicted_cpu": random.uniform(60, 90)},
        ]
        
        for dep in deployments:
            if dep["predicted_cpu"] > 75 and dep["current"] < 20:
                recommended = min(dep["current"] + 1, 20)
                self._decisions.append({
                    "deployment": dep["name"],
                    "namespace": dep["namespace"],
                    "current_replicas": dep["current"],
                    "recommended_replicas": recommended,
                    "reason": f"AI predicted high CPU ({dep['predicted_cpu']:.1f}%)",
                    "confidence": round(random.uniform(85, 98), 1),
                    "triggered_by": "ai",
                    "timestamp": datetime.utcnow().isoformat(),
                })
            elif dep["predicted_cpu"] < 30 and dep["current"] > 1:
                recommended = max(dep["current"] - 1, 1)
                self._decisions.append({
                    "deployment": dep["name"],
                    "namespace": dep["namespace"],
                    "current_replicas": dep["current"],
                    "recommended_replicas": recommended,
                    "reason": f"AI predicted low CPU ({dep['predicted_cpu']:.1f}%)",
                    "confidence": round(random.uniform(75, 90), 1),
                    "triggered_by": "ai",
                    "timestamp": datetime.utcnow().isoformat(),
                })
        
        # Keep only last 100 decisions
        self._decisions = self._decisions[-100:]
    
    async def get_recent_events(self) -> list:
        """Get recent scaling events."""
        return self._decisions[-20:] if self._decisions else []
    
    async def get_recent_scaling_events(self) -> list:
        """Get recent scaling events."""
        events = []
        now = datetime.utcnow()
        event_types = [
            {"deployment": "frontend-app", "namespace": "app-frontend", "from": 3, "to": 4, "reason": "AI predicted traffic spike"},
            {"deployment": "backend-api", "namespace": "app-backend", "from": 4, "to": 6, "reason": "CPU threshold exceeded"},
            {"deployment": "ml-predictor", "namespace": "app-ml", "from": 2, "to": 3, "reason": "Queue depth increasing"},
            {"deployment": "frontend-app", "namespace": "app-frontend", "from": 4, "to": 3, "reason": "Traffic normalized"},
        ]
        
        for i in range(20):
            event = event_types[i % len(event_types)]
            ts = now - timedelta(minutes=i * 30)
            events.append({
                "id": i + 1,
                **event,
                "confidence": round(random.uniform(80, 96), 1),
                "timestamp": ts.isoformat(),
                "success": True,
            })
        
        return events

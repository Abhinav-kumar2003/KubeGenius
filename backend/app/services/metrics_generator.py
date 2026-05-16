"""Metrics generator service."""

import asyncio
import random
from datetime import datetime

import structlog

logger = structlog.get_logger()


class MetricsGenerator:
    """Generate real-time cluster metrics."""
    
    def __init__(self):
        self._running = False
        self._latest_metrics = {}
        self._task = None
    
    async def start(self):
        """Start metrics generation."""
        self._running = True
        logger.info("Metrics generator started")
        
        while self._running:
            self._latest_metrics = self._generate_metrics()
            await asyncio.sleep(5)
    
    def stop(self):
        """Stop metrics generation."""
        self._running = False
        logger.info("Metrics generator stopped")
    
    async def get_latest_metrics(self) -> dict:
        """Get latest generated metrics."""
        return self._latest_metrics
    
    def _generate_metrics(self) -> dict:
        """Generate mock cluster metrics."""
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "cluster": {
                "cpu_percent": round(random.uniform(55, 85), 1),
                "memory_percent": round(random.uniform(60, 90), 1),
                "disk_percent": round(random.uniform(30, 65), 1),
                "pod_count": random.randint(45, 65),
                "node_count": 6,
            },
            "deployments": [
                {
                    "name": "frontend-app",
                    "namespace": "app-frontend",
                    "cpu": round(random.uniform(50, 80), 1),
                    "memory": round(random.uniform(40, 70), 1),
                    "replicas": 4,
                    "ready": 4,
                },
                {
                    "name": "backend-api",
                    "namespace": "app-backend",
                    "cpu": round(random.uniform(60, 90), 1),
                    "memory": round(random.uniform(55, 85), 1),
                    "replicas": 6,
                    "ready": 6,
                },
                {
                    "name": "ml-predictor",
                    "namespace": "app-ml",
                    "cpu": round(random.uniform(70, 95), 1),
                    "memory": round(random.uniform(65, 95), 1),
                    "replicas": 3,
                    "ready": 3,
                },
            ],
            "nodes": [
                {
                    "name": f"ip-10-0-1-{45+i}",
                    "cpu": round(random.uniform(40, 95), 1),
                    "memory": round(random.uniform(45, 90), 1),
                    "pods": random.randint(8, 22),
                    "status": "Ready",
                }
                for i in range(5)
            ],
        }

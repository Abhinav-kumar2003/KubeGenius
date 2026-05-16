"""Autoscaler endpoints."""

import random
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Query
from pydantic import BaseModel

router = APIRouter()


class ScaleRequest(BaseModel):
    deployment_name: str
    namespace: str = "default"
    target_replicas: int
    reason: Optional[str] = None


class AutoscalerConfig(BaseModel):
    enabled: bool = True
    cpu_scale_up_threshold: float = 75.0
    cpu_scale_down_threshold: float = 30.0
    min_replicas: int = 1
    max_replicas: int = 20
    cooldown_seconds: int = 300
    ai_mode: str = "hybrid"  # ai_only, reactive_only, hybrid


# State
_config = AutoscalerConfig()
_scaling_history = []


@router.get("/config")
async def get_autoscaler_config():
    """Get autoscaler configuration."""
    return _config.dict()


@router.put("/config")
async def update_autoscaler_config(config: AutoscalerConfig):
    """Update autoscaler configuration."""
    global _config
    _config = config
    return _config.dict()


@router.get("/status")
async def get_autoscaler_status():
    """Get autoscaler status."""
    return {
        "enabled": _config.enabled,
        "mode": _config.ai_mode,
        "current_decisions": [
            {
                "deployment": "frontend-app",
                "namespace": "app-frontend",
                "current_replicas": 4,
                "recommended_replicas": 5,
                "reason": "AI predicted traffic spike (94% confidence)",
                "confidence": 94.0,
                "triggered_by": "ai",
                "timestamp": datetime.utcnow().isoformat(),
            },
            {
                "deployment": "backend-api",
                "namespace": "app-backend",
                "current_replicas": 6,
                "recommended_replicas": 6,
                "reason": "Current capacity sufficient",
                "confidence": 87.0,
                "triggered_by": "hpa",
                "timestamp": datetime.utcnow().isoformat(),
            },
            {
                "deployment": "ml-predictor",
                "namespace": "app-ml",
                "current_replicas": 3,
                "recommended_replicas": 3,
                "reason": "CPU below threshold",
                "confidence": 91.0,
                "triggered_by": "ai",
                "timestamp": datetime.utcnow().isoformat(),
            },
        ],
        "last_scale_event": datetime.utcnow().isoformat(),
        "total_scales_today": random.randint(10, 50),
    }


@router.get("/history")
async def get_scaling_history(limit: int = Query(50)):
    """Get scaling history."""
    if not _scaling_history:
        # Generate mock data
        history = []
        now = datetime.utcnow()
        events = [
            {"deployment": "frontend-app", "namespace": "app-frontend", "from": 3, "to": 4, "reason": "AI predicted traffic spike", "triggered_by": "ai", "confidence": 94},
            {"deployment": "backend-api", "namespace": "app-backend", "from": 4, "to": 6, "reason": "CPU threshold exceeded", "triggered_by": "hpa", "confidence": 87},
            {"deployment": "ml-predictor", "namespace": "app-ml", "from": 2, "to": 3, "reason": "Queue depth increasing", "triggered_by": "ai", "confidence": 91},
            {"deployment": "frontend-app", "namespace": "app-frontend", "from": 4, "to": 3, "reason": "Traffic normalized", "triggered_by": "ai", "confidence": 89},
            {"deployment": "nginx-ingress", "namespace": "ingress-nginx", "from": 1, "to": 2, "reason": "High ingress traffic", "triggered_by": "reactive", "confidence": 82},
        ]
        
        for i in range(limit):
            event = events[i % len(events)]
            ts = now - timedelta(minutes=i * 30)
            history.append({
                "id": i + 1,
                **event,
                "timestamp": ts.isoformat(),
                "success": True,
            })
        return {"total": len(history), "data": history}
    
    return {"total": len(_scaling_history), "data": _scaling_history[:limit]}


@router.post("/scale")
async def manual_scale(request: ScaleRequest):
    """Manually trigger scaling."""
    event = {
        "id": len(_scaling_history) + 1,
        "deployment": request.deployment_name,
        "namespace": request.namespace,
        "from_replicas": request.target_replicas - 1,
        "to_replicas": request.target_replicas,
        "reason": request.reason or "Manual scaling",
        "triggered_by": "manual",
        "confidence": 100.0,
        "timestamp": datetime.utcnow().isoformat(),
        "success": True,
    }
    _scaling_history.append(event)
    return event


@router.get("/recommendations")
async def get_recommendations():
    """Get AI scaling recommendations."""
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "recommendations": [
            {
                "deployment": "frontend-app",
                "namespace": "app-frontend",
                "current_replicas": 4,
                "recommended_replicas": 5,
                "urgency": 85,
                "confidence": 94.0,
                "predicted_cpu": 82.5,
                "time_to_peak": "15 minutes",
                "estimated_cost_impact": "+$2.40/hour",
            },
            {
                "deployment": "backend-api",
                "namespace": "app-backend",
                "current_replicas": 6,
                "recommended_replicas": 6,
                "urgency": 15,
                "confidence": 87.0,
                "predicted_cpu": 58.2,
                "time_to_peak": "N/A",
                "estimated_cost_impact": "$0",
            },
            {
                "deployment": "redis-cache",
                "namespace": "app-backend",
                "current_replicas": 2,
                "recommended_replicas": 1,
                "urgency": 45,
                "confidence": 78.0,
                "predicted_cpu": 12.4,
                "time_to_peak": "N/A",
                "estimated_cost_impact": "-$1.20/hour",
            },
        ]
    }


from datetime import timedelta

"""Analytics endpoints."""

import random
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/cost")
async def get_cost_analytics(
    days: int = Query(7),
    cluster_id: Optional[str] = Query(None),
):
    """Get cost analytics."""
    data = []
    for i in range(days):
        date = datetime.utcnow() - timedelta(days=days - 1 - i)
        data.append({
            "date": date.strftime("%Y-%m-%d"),
            "compute": round(random.uniform(100, 220), 2),
            "storage": round(random.uniform(30, 40), 2),
            "network": round(random.uniform(10, 35), 2),
            "ml": round(random.uniform(40, 85), 2),
        })
    
    total = sum(d["compute"] + d["storage"] + d["network"] + d["ml"] for d in data)
    
    return {
        "period": f"Last {days} days",
        "total_cost": round(total, 2),
        "daily_average": round(total / days, 2),
        "breakdown": {
            "compute": round(sum(d["compute"] for d in data), 2),
            "storage": round(sum(d["storage"] for d in data), 2),
            "network": round(sum(d["network"] for d in data), 2),
            "ml": round(sum(d["ml"] for d in data), 2),
        },
        "data": data,
        "idle_resources": [
            {"name": "dev-gke", "type": "Cluster", "monthly_waste": 342, "recommendation": "Scale to 2 nodes on weekends"},
            {"name": "staging-eks", "type": "Cluster", "monthly_waste": 189, "recommendation": "Use scheduled scaling"},
            {"name": "postgres-db", "type": "Pod", "monthly_waste": 67, "recommendation": "Right-size to 512Mi memory"},
            {"name": "redis-cache", "type": "Pod", "monthly_waste": 45, "recommendation": "Reduce to 1 replica during off-peak"},
        ],
    }


@router.get("/efficiency")
async def get_efficiency_metrics():
    """Get resource efficiency metrics."""
    return {
        "cpu_efficiency": round(random.uniform(60, 85), 1),
        "memory_efficiency": round(random.uniform(65, 90), 1),
        "storage_efficiency": round(random.uniform(70, 95), 1),
        "cost_per_request": round(random.uniform(0.001, 0.005), 4),
        "pod_density": round(random.uniform(8, 15), 1),
        "resource_utilization": {
            "cpu": round(random.uniform(60, 85), 1),
            "memory": round(random.uniform(65, 90), 1),
            "disk": round(random.uniform(40, 70), 1),
        },
        "trends": {
            "cpu_efficiency_7d": round(random.uniform(-5, 10), 1),
            "memory_efficiency_7d": round(random.uniform(-3, 8), 1),
            "cost_reduction_7d": round(random.uniform(5, 20), 1),
        },
    }


@router.get("/usage-report")
async def get_usage_report(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
):
    """Get detailed usage report."""
    now = datetime.utcnow()
    
    return {
        "period": {
            "start": start_date or (now - timedelta(days=7)).strftime("%Y-%m-%d"),
            "end": end_date or now.strftime("%Y-%m-%d"),
        },
        "summary": {
            "total_requests": random.randint(500000, 2000000),
            "avg_latency_ms": round(random.uniform(30, 80), 1),
            "error_rate": round(random.uniform(0.1, 2.0), 2),
            "uptime_percent": round(random.uniform(99.5, 99.99), 2),
        },
        "top_deployments": [
            {"name": "frontend-app", "requests": random.randint(200000, 800000), "avg_latency": round(random.uniform(20, 50), 1)},
            {"name": "backend-api", "requests": random.randint(150000, 600000), "avg_latency": round(random.uniform(40, 100), 1)},
            {"name": "ml-predictor", "requests": random.randint(50000, 200000), "avg_latency": round(random.uniform(100, 300), 1)},
            {"name": "nginx-ingress", "requests": random.randint(300000, 1200000), "avg_latency": round(random.uniform(5, 20), 1)},
        ],
    }

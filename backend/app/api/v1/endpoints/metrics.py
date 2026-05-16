"""Metrics endpoints."""

import random
import time
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Query

router = APIRouter()


def generate_time_series(points: int, base: float, variance: float, trend: float = 0):
    """Generate mock time series data."""
    data = []
    now = datetime.utcnow()
    for i in range(points, -1, -1):
        ts = now - timedelta(minutes=i)
        value = base + (points - i) * trend + random.uniform(-variance, variance)
        data.append({
            "timestamp": ts.isoformat(),
            "time": ts.strftime("%H:%M"),
            "value": round(max(0, min(100, value)), 1)
        })
    return data


@router.get("/cpu")
async def get_cpu_metrics(
    namespace: Optional[str] = Query(None),
    deployment: Optional[str] = Query(None),
    minutes: int = Query(60),
):
    """Get CPU metrics."""
    return {
        "metric": "cpu_usage",
        "unit": "percentage",
        "data": generate_time_series(minutes, 65, 10, 0.02),
        "current": round(65 + random.uniform(-5, 5), 1),
        "average": round(65 + random.uniform(-3, 3), 1),
        "peak": round(80 + random.uniform(-5, 5), 1),
    }


@router.get("/memory")
async def get_memory_metrics(
    namespace: Optional[str] = Query(None),
    deployment: Optional[str] = Query(None),
    minutes: int = Query(60),
):
    """Get memory metrics."""
    return {
        "metric": "memory_usage",
        "unit": "percentage",
        "data": generate_time_series(minutes, 70, 8, 0.01),
        "current": round(70 + random.uniform(-5, 5), 1),
        "average": round(70 + random.uniform(-3, 3), 1),
        "peak": round(85 + random.uniform(-5, 5), 1),
    }


@router.get("/requests")
async def get_request_metrics(
    namespace: Optional[str] = Query(None),
    minutes: int = Query(60),
):
    """Get request rate metrics."""
    data = generate_time_series(minutes, 2500, 500, 5)
    for d in data:
        d["value"] = round(d["value"], 0)
    return {
        "metric": "request_rate",
        "unit": "requests/minute",
        "data": data,
        "current": round(2500 + random.uniform(-200, 200), 0),
        "average": round(2500 + random.uniform(-100, 100), 0),
        "peak": round(3500 + random.uniform(-200, 200), 0),
    }


@router.get("/latency")
async def get_latency_metrics(
    namespace: Optional[str] = Query(None),
    minutes: int = Query(60),
):
    """Get latency metrics."""
    data = generate_time_series(minutes, 45, 15, -0.01)
    for d in data:
        d["value"] = round(d["value"] * 1, 1)
    return {
        "metric": "response_latency",
        "unit": "milliseconds (p95)",
        "data": data,
        "current": round(45 + random.uniform(-10, 10), 1),
        "average": round(45 + random.uniform(-5, 5), 1),
        "peak": round(120 + random.uniform(-20, 20), 1),
    }


@router.get("/cluster")
async def get_cluster_metrics():
    """Get cluster-wide metrics."""
    return {
        "nodes": {
            "total": 6,
            "ready": 6,
            "cpu_avg": round(68 + random.uniform(-5, 5), 1),
            "memory_avg": round(72 + random.uniform(-5, 5), 1),
        },
        "pods": {
            "total": 55,
            "running": 55,
            "pending": 0,
            "failed": 0,
        },
        "deployments": {
            "total": 8,
            "healthy": 8,
            "unhealthy": 0,
        },
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/node/{node_name}")
async def get_node_metrics(node_name: str):
    """Get specific node metrics."""
    return {
        "node": node_name,
        "cpu": round(random.uniform(40, 95), 1),
        "memory": round(random.uniform(45, 90), 1),
        "disk": round(random.uniform(20, 65), 1),
        "network_in": round(random.uniform(100, 1000), 1),
        "network_out": round(random.uniform(100, 1000), 1),
        "pod_count": random.randint(5, 25),
        "timestamp": datetime.utcnow().isoformat(),
    }

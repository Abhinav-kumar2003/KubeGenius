"""Monitoring endpoints."""

import random
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/prometheus/query")
async def query_prometheus(
    query: str = Query(..., description="PromQL query"),
    time: Optional[str] = Query(None),
):
    """Query Prometheus."""
    return {
        "status": "success",
        "data": {
            "resultType": "vector",
            "result": [
                {
                    "metric": {"__name__": query, "pod": "frontend-app-7d9f4b8c5-x2v9m"},
                    "value": [datetime.utcnow().timestamp(), str(random.uniform(0.4, 0.9))],
                }
            ],
        },
    }


@router.get("/prometheus/range")
async def query_prometheus_range(
    query: str = Query(...),
    start: str = Query(...),
    end: str = Query(...),
    step: str = Query("60s"),
):
    """Query Prometheus range."""
    now = datetime.utcnow()
    values = []
    for i in range(60):
        ts = now - timedelta(minutes=60 - i)
        values.append([ts.timestamp(), str(random.uniform(0.3, 0.9))])
    
    return {
        "status": "success",
        "data": {
            "resultType": "matrix",
            "result": [
                {
                    "metric": {"__name__": query, "pod": "frontend-app"},
                    "values": values,
                }
            ],
        },
    }


@router.get("/dashboards")
async def list_dashboards():
    """List Grafana dashboards."""
    return {
        "dashboards": [
            {"id": 1, "title": "Cluster Overview", "url": "/grafana/d/cluster-overview", "tags": ["k8s"], "starred": True},
            {"id": 2, "title": "AI Predictions", "url": "/grafana/d/ai-predictions", "tags": ["ml", "ai"], "starred": True},
            {"id": 3, "title": "Pod Metrics", "url": "/grafana/d/pod-metrics", "tags": ["k8s", "pods"], "starred": False},
            {"id": 4, "title": "Scaling History", "url": "/grafana/d/scaling-history", "tags": ["autoscaler"], "starred": True},
            {"id": 5, "title": "Cost Analytics", "url": "/grafana/d/cost-analytics", "tags": ["cost"], "starred": False},
            {"id": 6, "title": "Node Exporter", "url": "/grafana/d/node-exporter", "tags": ["nodes"], "starred": False},
        ]
    }


@router.get("/silences")
async def list_silences():
    """List AlertManager silences."""
    return {
        "silences": [
            {"id": 1, "matchers": [{"name": "severity", "value": "info"}], "startsAt": "2024-01-15T00:00:00Z", "endsAt": "2024-01-16T00:00:00Z", "createdBy": "admin", "comment": "Maintenance window"},
        ]
    }


@router.get("/targets")
async def list_prometheus_targets():
    """List Prometheus targets."""
    return {
        "targets": [
            {"job": "kubernetes-apiservers", "endpoint": "https://10.0.0.1:6443/metrics", "state": "up", "labels": {"instance": "master"}},
            {"job": "kubernetes-nodes", "endpoint": "http://10.0.1.45:10250/metrics", "state": "up", "labels": {"node": "ip-10-0-1-45"}},
            {"job": "kubernetes-pods", "endpoint": "http://10.0.1.45:8080/metrics", "state": "up", "labels": {"pod": "frontend-app"}},
            {"job": "kube-state-metrics", "endpoint": "http://10.0.0.10:8080/metrics", "state": "up", "labels": {}},
            {"job": "node-exporter", "endpoint": "http://10.0.1.45:9100/metrics", "state": "up", "labels": {"node": "ip-10-0-1-45"}},
        ]
    }

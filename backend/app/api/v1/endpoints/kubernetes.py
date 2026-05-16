"""Kubernetes management endpoints."""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

router = APIRouter()


class PodInfo(BaseModel):
    name: str
    namespace: str
    status: str
    restarts: int
    cpu: str
    memory: str
    node: str
    age: str


class DeploymentInfo(BaseModel):
    name: str
    namespace: str
    replicas: int
    ready: int
    cpu: float
    memory: float
    status: str
    age: str
    image: str


class NodeInfo(BaseModel):
    name: str
    role: str
    status: str
    cpu: int
    memory: int
    pods: int
    disk: int
    os: str
    kernel: str
    container_runtime: str


class ServiceInfo(BaseModel):
    name: str
    namespace: str
    type: str
    cluster_ip: str
    external_ip: Optional[str]
    ports: str
    selector: str
    age: str


# Mock data
MOCK_DEPLOYMENTS = [
    {"name": "frontend-app", "namespace": "app-frontend", "replicas": 4, "ready": 4, "cpu": 62, "memory": 48, "status": "Running", "age": "14d", "image": "frontend:v2.3.1"},
    {"name": "backend-api", "namespace": "app-backend", "replicas": 6, "ready": 6, "cpu": 78, "memory": 65, "status": "Running", "age": "7d", "image": "backend:v1.8.2"},
    {"name": "ml-predictor", "namespace": "app-ml", "replicas": 3, "ready": 3, "cpu": 91, "memory": 82, "status": "Running", "age": "3d", "image": "ml-engine:v3.1.0"},
    {"name": "nginx-ingress", "namespace": "ingress-nginx", "replicas": 2, "ready": 2, "cpu": 34, "memory": 28, "status": "Running", "age": "21d", "image": "nginx-ingress:v1.9.4"},
    {"name": "prometheus", "namespace": "monitoring", "replicas": 1, "ready": 1, "cpu": 45, "memory": 72, "status": "Running", "age": "30d", "image": "prometheus:v2.47.0"},
    {"name": "grafana", "namespace": "monitoring", "replicas": 1, "ready": 1, "cpu": 22, "memory": 56, "status": "Running", "age": "30d", "image": "grafana:v10.1.0"},
    {"name": "redis-cache", "namespace": "app-backend", "replicas": 2, "ready": 2, "cpu": 15, "memory": 88, "status": "Running", "age": "45d", "image": "redis:7.2"},
    {"name": "postgres-db", "namespace": "app-backend", "replicas": 1, "ready": 1, "cpu": 38, "memory": 64, "status": "Running", "age": "45d", "image": "postgres:15.4"},
]

MOCK_PODS = [
    {"name": "frontend-app-7d9f4b8c5-x2v9m", "namespace": "app-frontend", "status": "Running", "restarts": 0, "cpu": "145m", "memory": "256Mi", "node": "ip-10-0-1-45", "age": "4h"},
    {"name": "frontend-app-7d9f4b8c5-kp3n2", "namespace": "app-frontend", "status": "Running", "restarts": 0, "cpu": "132m", "memory": "241Mi", "node": "ip-10-0-1-46", "age": "4h"},
    {"name": "backend-api-5c8a2d1e4-9x4vq", "namespace": "app-backend", "status": "Running", "restarts": 1, "cpu": "412m", "memory": "512Mi", "node": "ip-10-0-1-47", "age": "2h"},
    {"name": "ml-predictor-3b7e9f2a1-m8k5p", "namespace": "app-ml", "status": "Running", "restarts": 0, "cpu": "823m", "memory": "1.8Gi", "node": "ip-10-0-1-48", "age": "1h"},
    {"name": "redis-cache-9d2c4b7e1-r6t3y", "namespace": "app-backend", "status": "Running", "restarts": 0, "cpu": "67m", "memory": "892Mi", "node": "ip-10-0-1-45", "age": "8h"},
    {"name": "postgres-db-4a8f1c3b9-n5w7q", "namespace": "app-backend", "status": "Running", "restarts": 0, "cpu": "234m", "memory": "1.2Gi", "node": "ip-10-0-1-49", "age": "8h"},
]

MOCK_NODES = [
    {"name": "ip-10-0-1-45", "role": "worker", "status": "Ready", "cpu": 72, "memory": 68, "pods": 18, "disk": 45, "os": "Ubuntu 22.04", "kernel": "5.15.0", "container_runtime": "containerd://1.7.8"},
    {"name": "ip-10-0-1-46", "role": "worker", "status": "Ready", "cpu": 65, "memory": 71, "pods": 16, "disk": 38, "os": "Ubuntu 22.04", "kernel": "5.15.0", "container_runtime": "containerd://1.7.8"},
    {"name": "ip-10-0-1-47", "role": "worker", "status": "Ready", "cpu": 81, "memory": 74, "pods": 20, "disk": 52, "os": "Ubuntu 22.04", "kernel": "5.15.0", "container_runtime": "containerd://1.7.8"},
    {"name": "ip-10-0-1-48", "role": "worker-gpu", "status": "Ready", "cpu": 94, "memory": 88, "pods": 12, "disk": 61, "os": "Ubuntu 22.04", "kernel": "5.15.0", "container_runtime": "containerd://1.7.8"},
    {"name": "ip-10-0-1-49", "role": "worker", "status": "Ready", "cpu": 58, "memory": 62, "pods": 15, "disk": 33, "os": "Ubuntu 22.04", "kernel": "5.15.0", "container_runtime": "containerd://1.7.8"},
    {"name": "ip-10-0-1-10", "role": "control-plane", "status": "Ready", "cpu": 34, "memory": 45, "pods": 11, "disk": 28, "os": "Ubuntu 22.04", "kernel": "5.15.0", "container_runtime": "containerd://1.7.8"},
]

MOCK_SERVICES = [
    {"name": "frontend-svc", "namespace": "app-frontend", "type": "ClusterIP", "cluster_ip": "10.100.12.45", "external_ip": None, "ports": "80:8080/TCP", "selector": "app=frontend", "age": "14d"},
    {"name": "backend-svc", "namespace": "app-backend", "type": "ClusterIP", "cluster_ip": "10.100.12.67", "external_ip": None, "ports": "8080:8080/TCP", "selector": "app=backend", "age": "7d"},
    {"name": "ml-svc", "namespace": "app-ml", "type": "ClusterIP", "cluster_ip": "10.100.12.89", "external_ip": None, "ports": "5000:5000/TCP", "selector": "app=ml-predictor", "age": "3d"},
    {"name": "nginx-ingress", "namespace": "ingress-nginx", "type": "LoadBalancer", "cluster_ip": "10.100.12.12", "external_ip": "a1b2c3d4-nginx.elb.amazonaws.com", "ports": "80:80/TCP,443:443/TCP", "selector": "app=nginx-ingress", "age": "21d"},
    {"name": "redis-svc", "namespace": "app-backend", "type": "ClusterIP", "cluster_ip": "10.100.12.34", "external_ip": None, "ports": "6379:6379/TCP", "selector": "app=redis", "age": "45d"},
]


@router.get("/deployments", response_model=List[dict])
async def list_deployments(namespace: Optional[str] = Query(None)):
    """List all deployments."""
    if namespace:
        return [d for d in MOCK_DEPLOYMENTS if d["namespace"] == namespace]
    return MOCK_DEPLOYMENTS


@router.get("/pods", response_model=List[dict])
async def list_pods(namespace: Optional[str] = Query(None)):
    """List all pods."""
    if namespace:
        return [p for p in MOCK_PODS if p["namespace"] == namespace]
    return MOCK_PODS


@router.get("/nodes", response_model=List[dict])
async def list_nodes():
    """List all nodes."""
    return MOCK_NODES


@router.get("/services", response_model=List[dict])
async def list_services(namespace: Optional[str] = Query(None)):
    """List all services."""
    if namespace:
        return [s for s in MOCK_SERVICES if s["namespace"] == namespace]
    return MOCK_SERVICES


@router.post("/scale")
async def scale_deployment(name: str, namespace: str, replicas: int):
    """Scale a deployment."""
    for dep in MOCK_DEPLOYMENTS:
        if dep["name"] == name and dep["namespace"] == namespace:
            dep["replicas"] = replicas
            dep["ready"] = replicas
            return {"success": True, "deployment": name, "namespace": namespace, "replicas": replicas}
    raise HTTPException(status_code=404, detail="Deployment not found")


@router.post("/restart")
async def restart_deployment(name: str, namespace: str):
    """Restart a deployment."""
    return {"success": True, "deployment": name, "namespace": namespace, "message": "Rolling restart initiated"}


@router.get("/namespaces")
async def list_namespaces():
    """List all namespaces."""
    return [
        {"name": "kube-system", "status": "Active"},
        {"name": "default", "status": "Active"},
        {"name": "app-frontend", "status": "Active"},
        {"name": "app-backend", "status": "Active"},
        {"name": "app-ml", "status": "Active"},
        {"name": "monitoring", "status": "Active"},
        {"name": "ingress-nginx", "status": "Active"},
    ]


@router.get("/logs/{pod_name}")
async def get_pod_logs(pod_name: str, namespace: str = "default", tail: int = 100):
    """Get pod logs."""
    return {
        "pod": pod_name,
        "namespace": namespace,
        "logs": [
            f"[2024-01-15T09:32:10Z] INFO  Server started on port 8080",
            f"[2024-01-15T09:32:11Z] INFO  Connected to database",
            f"[2024-01-15T09:32:15Z] INFO  Health check passed",
            f"[2024-01-15T09:33:00Z] WARN  High latency detected: 245ms",
            f"[2024-01-15T09:33:30Z] INFO  Request processed: GET /api/v1/predictions",
            f"[2024-01-15T09:34:00Z] INFO  Auto-scaling triggered: 3 -> 4 replicas",
        ]
    }

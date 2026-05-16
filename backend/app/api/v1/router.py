"""API router."""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, kubernetes, metrics, ml, autoscaler, alerts, monitoring, analytics

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(kubernetes.router, prefix="/k8s", tags=["Kubernetes"])
api_router.include_router(metrics.router, prefix="/metrics", tags=["Metrics"])
api_router.include_router(ml.router, prefix="/ml", tags=["ML Engine"])
api_router.include_router(autoscaler.router, prefix="/autoscaler", tags=["Autoscaler"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])
api_router.include_router(monitoring.router, prefix="/monitoring", tags=["Monitoring"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])

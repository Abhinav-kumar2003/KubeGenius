"""
KubeGenius - AI-Powered Kubernetes Predictive Autoscaler Platform
FastAPI Backend Application
"""

import asyncio
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional

import structlog
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.router import api_router
from app.core.websocket import ConnectionManager
from app.services.metrics_generator import MetricsGenerator
from app.services.autoscaler import AutoscalerService

logger = structlog.get_logger()

# WebSocket connection manager
ws_manager = ConnectionManager()
metrics_generator = MetricsGenerator()
autoscaler_service = AutoscalerService()

security = HTTPBearer()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    logger.info("Starting KubeGenius Backend", version="3.1.0")
    
    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Start background tasks
    metrics_task = asyncio.create_task(metrics_generator.start())
    autoscaler_task = asyncio.create_task(autoscaler_service.start())
    
    logger.info("All services started successfully")
    
    yield
    
    # Cleanup
    metrics_task.cancel()
    autoscaler_task.cancel()
    logger.info("Shutting down KubeGenius Backend")


app = FastAPI(
    title="KubeGenius API",
    description="AI-Powered Kubernetes Predictive Autoscaler Platform",
    version="3.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": "3.1.0",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "api": "ok",
            "ml_engine": "ok",
            "autoscaler": "ok",
        }
    }


@app.get("/ready")
async def readiness_check():
    """Readiness probe for Kubernetes."""
    return {"status": "ready"}


@app.websocket("/ws/metrics")
async def metrics_websocket(websocket: WebSocket):
    """Real-time metrics WebSocket endpoint."""
    await ws_manager.connect(websocket, "metrics")
    try:
        while True:
            metrics = await metrics_generator.get_latest_metrics()
            await ws_manager.broadcast_to_group("metrics", {
                "type": "metrics_update",
                "timestamp": datetime.utcnow().isoformat(),
                "data": metrics
            })
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, "metrics")
    except Exception as e:
        logger.error("WebSocket error", error=str(e))
        ws_manager.disconnect(websocket, "metrics")


@app.websocket("/ws/events")
async def events_websocket(websocket: WebSocket):
    """Real-time Kubernetes events WebSocket endpoint."""
    await ws_manager.connect(websocket, "events")
    try:
        while True:
            events = await autoscaler_service.get_recent_events()
            await ws_manager.broadcast_to_group("events", {
                "type": "events_update",
                "timestamp": datetime.utcnow().isoformat(),
                "data": events
            })
            await asyncio.sleep(10)
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, "events")
    except Exception as e:
        logger.error("WebSocket error", error=str(e))
        ws_manager.disconnect(websocket, "events")


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler."""
    logger.error("Unhandled exception", error=str(exc), path=request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "timestamp": datetime.utcnow().isoformat()}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

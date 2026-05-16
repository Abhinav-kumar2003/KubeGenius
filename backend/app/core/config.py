"""Application configuration."""

import os
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""
    
    # Application
    APP_NAME: str = "KubeGenius"
    APP_VERSION: str = "3.1.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    ALGORITHM: str = "HS256"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
    ]
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres:postgres@localhost:5432/kubegenius"
    )
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # Kubernetes
    KUBECONFIG_PATH: str = os.getenv("KUBECONFIG_PATH", "")
    IN_CLUSTER: bool = os.getenv("IN_CLUSTER", "false").lower() == "true"
    
    # ML Engine
    ML_MODEL_PATH: str = os.getenv("ML_MODEL_PATH", "/app/models")
    PREDICTION_WINDOW: int = int(os.getenv("PREDICTION_WINDOW", "30"))
    RETRAIN_INTERVAL_HOURS: int = int(os.getenv("RETRAIN_INTERVAL_HOURS", "6"))
    CONFIDENCE_THRESHOLD: float = float(os.getenv("CONFIDENCE_THRESHOLD", "0.85"))
    
    # Autoscaler
    AUTOSCALER_ENABLED: bool = os.getenv("AUTOSCALER_ENABLED", "true").lower() == "true"
    CPU_SCALE_UP_THRESHOLD: float = float(os.getenv("CPU_SCALE_UP_THRESHOLD", "75.0"))
    CPU_SCALE_DOWN_THRESHOLD: float = float(os.getenv("CPU_SCALE_DOWN_THRESHOLD", "30.0"))
    MIN_REPLICAS: int = int(os.getenv("MIN_REPLICAS", "1"))
    MAX_REPLICAS: int = int(os.getenv("MAX_REPLICAS", "20"))
    SCALE_COOLDOWN_SECONDS: int = int(os.getenv("SCALE_COOLDOWN_SECONDS", "300"))
    
    # Prometheus
    PROMETHEUS_URL: str = os.getenv("PROMETHEUS_URL", "http://prometheus:9090")
    
    # Alerting
    SLACK_WEBHOOK_URL: str = os.getenv("SLACK_WEBHOOK_URL", "")
    ALERT_EMAIL: str = os.getenv("ALERT_EMAIL", "")
    
    class Config:
        env_file = ".env"


settings = Settings()

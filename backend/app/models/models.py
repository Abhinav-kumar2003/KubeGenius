"""Database models."""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey, BigInteger
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(200))
    role = Column(String(50), default="user")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Cluster(Base):
    __tablename__ = "clusters"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    provider = Column(String(50))
    region = Column(String(100))
    version = Column(String(50))
    kubeconfig = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class DeploymentConfig(Base):
    __tablename__ = "deployment_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    cluster_id = Column(Integer, ForeignKey("clusters.id"))
    namespace = Column(String(100), nullable=False)
    deployment_name = Column(String(200), nullable=False)
    min_replicas = Column(Integer, default=1)
    max_replicas = Column(Integer, default=20)
    target_cpu = Column(Float, default=75.0)
    target_memory = Column(Float, default=80.0)
    ai_scaling_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Prediction(Base):
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    cluster_id = Column(Integer, ForeignKey("clusters.id"))
    deployment_name = Column(String(200), nullable=False)
    namespace = Column(String(100), nullable=False)
    predicted_cpu = Column(Float, nullable=False)
    predicted_memory = Column(Float)
    predicted_requests = Column(Float)
    confidence_score = Column(Float, nullable=False)
    recommended_replicas = Column(Integer)
    features = Column(JSON)
    model_version = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)


class ScalingEvent(Base):
    __tablename__ = "scaling_events"
    
    id = Column(Integer, primary_key=True, index=True)
    cluster_id = Column(Integer, ForeignKey("clusters.id"))
    deployment_name = Column(String(200), nullable=False)
    namespace = Column(String(100), nullable=False)
    from_replicas = Column(Integer, nullable=False)
    to_replicas = Column(Integer, nullable=False)
    reason = Column(String(500))
    triggered_by = Column(String(50), default="ai")  # ai, hpa, manual
    confidence = Column(Float)
    success = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AlertRule(Base):
    __tablename__ = "alert_rules"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    condition = Column(String(500), nullable=False)
    threshold = Column(Float, nullable=False)
    duration = Column(String(50))
    severity = Column(String(20), default="warning")
    channel = Column(String(100), default="slack")
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class MetricSnapshot(Base):
    __tablename__ = "metric_snapshots"
    
    id = Column(Integer, primary_key=True, index=True)
    cluster_id = Column(Integer, ForeignKey("clusters.id"))
    deployment_name = Column(String(200))
    namespace = Column(String(100))
    cpu_usage = Column(Float)
    memory_usage = Column(Float)
    request_rate = Column(Float)
    response_latency = Column(Float)
    pod_count = Column(Integer)
    node_count = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow)


class CostReport(Base):
    __tablename__ = "cost_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    cluster_id = Column(Integer, ForeignKey("clusters.id"))
    compute_cost = Column(Float, default=0.0)
    storage_cost = Column(Float, default=0.0)
    network_cost = Column(Float, default=0.0)
    ml_cost = Column(Float, default=0.0)
    idle_resource_cost = Column(Float, default=0.0)
    report_date = Column(DateTime, default=datetime.utcnow)
    recommendations = Column(JSON)

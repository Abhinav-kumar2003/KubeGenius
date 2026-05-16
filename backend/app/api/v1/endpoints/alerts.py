"""Alerts endpoints."""

from datetime import datetime, timedelta
from typing import Optional, List

from fastapi import APIRouter, Query
from pydantic import BaseModel

router = APIRouter()


class AlertRule(BaseModel):
    name: str
    condition: str
    threshold: str
    duration: str = "5m"
    severity: str = "warning"
    channel: str = "slack"
    enabled: bool = True


class AlertHistory(BaseModel):
    id: str
    severity: str
    title: str
    message: str
    source: str
    namespace: str
    pod: Optional[str]
    timestamp: str
    status: str
    resolved_at: Optional[str]


_mock_alerts = [
    {"id": "1", "severity": "critical", "title": "High CPU Usage", "message": "ml-predictor pod CPU usage exceeded 90%", "source": "prometheus", "namespace": "app-ml", "pod": "ml-predictor-3b7e9f2a1-m8k5p", "timestamp": "2024-01-15T09:23:00Z", "status": "firing", "resolved_at": None},
    {"id": "2", "severity": "warning", "title": "Memory Pressure", "message": "Node ip-10-0-1-48 memory usage at 88%", "source": "prometheus", "namespace": "kube-system", "pod": "", "timestamp": "2024-01-15T09:15:00Z", "status": "firing", "resolved_at": None},
    {"id": "3", "severity": "info", "title": "Pod Restart", "message": "backend-api pod restarted 1 time", "source": "kubernetes", "namespace": "app-backend", "pod": "backend-api-5c8a2d1e4-9x4vq", "timestamp": "2024-01-15T08:45:00Z", "status": "resolved", "resolved_at": "2024-01-15T08:50:00Z"},
    {"id": "4", "severity": "warning", "title": "AI Prediction", "message": "Traffic spike predicted in 15 minutes", "source": "ai-engine", "namespace": "app-frontend", "pod": "", "timestamp": "2024-01-15T09:30:00Z", "status": "firing", "resolved_at": None},
    {"id": "5", "severity": "critical", "title": "Disk Pressure", "message": "Node ip-10-0-1-48 disk usage at 61%", "source": "prometheus", "namespace": "kube-system", "pod": "", "timestamp": "2024-01-15T07:12:00Z", "status": "firing", "resolved_at": None},
    {"id": "6", "severity": "info", "title": "Scaling Event", "message": "frontend-app scaled from 3 to 4 replicas", "source": "autoscaler", "namespace": "app-frontend", "pod": "", "timestamp": "2024-01-15T06:30:00Z", "status": "resolved", "resolved_at": "2024-01-15T07:00:00Z"},
]

_mock_rules = [
    {"id": "1", "name": "High CPU Usage", "condition": "cpu_usage > 80%", "threshold": "80%", "duration": "5m", "severity": "critical", "channel": "Slack", "enabled": True},
    {"id": "2", "name": "Memory Pressure", "condition": "memory_usage > 85%", "threshold": "85%", "duration": "5m", "severity": "warning", "channel": "Email", "enabled": True},
    {"id": "3", "name": "Pod Crash Loop", "condition": "restart_count > 3", "threshold": "3", "duration": "10m", "severity": "critical", "channel": "Slack + Email", "enabled": True},
    {"id": "4", "name": "AI Prediction Alert", "condition": "predicted_cpu > 75%", "threshold": "75%", "duration": "2m", "severity": "warning", "channel": "Slack", "enabled": True},
    {"id": "5", "name": "Disk Pressure", "condition": "disk_usage > 70%", "threshold": "70%", "duration": "15m", "severity": "warning", "channel": "Email", "enabled": False},
]


@router.get("/")
async def get_alerts(
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    namespace: Optional[str] = Query(None),
):
    """Get active alerts."""
    alerts = _mock_alerts
    if severity:
        alerts = [a for a in alerts if a["severity"] == severity]
    if status:
        alerts = [a for a in alerts if a["status"] == status]
    if namespace:
        alerts = [a for a in alerts if a["namespace"] == namespace]
    return {"total": len(alerts), "data": alerts}


@router.get("/rules")
async def get_alert_rules():
    """Get alert rules."""
    return {"total": len(_mock_rules), "data": _mock_rules}


@router.post("/rules")
async def create_alert_rule(rule: AlertRule):
    """Create a new alert rule."""
    new_rule = {
        "id": str(len(_mock_rules) + 1),
        **rule.dict(),
    }
    _mock_rules.append(new_rule)
    return new_rule


@router.put("/rules/{rule_id}")
async def update_alert_rule(rule_id: str, rule: AlertRule):
    """Update an alert rule."""
    for r in _mock_rules:
        if r["id"] == rule_id:
            r.update(rule.dict())
            return r
    return {"error": "Rule not found"}


@router.delete("/rules/{rule_id}")
async def delete_alert_rule(rule_id: str):
    """Delete an alert rule."""
    global _mock_rules
    _mock_rules = [r for r in _mock_rules if r["id"] != rule_id]
    return {"success": True}


@router.get("/history")
async def get_alert_history(limit: int = Query(50)):
    """Get alert history."""
    return {"total": len(_mock_alerts), "data": _mock_alerts[:limit]}


@router.post("/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str):
    """Acknowledge an alert."""
    for a in _mock_alerts:
        if a["id"] == alert_id:
            a["status"] = "acknowledged"
            return a
    return {"error": "Alert not found"}


@router.post("/{alert_id}/resolve")
async def resolve_alert(alert_id: str):
    """Resolve an alert."""
    for a in _mock_alerts:
        if a["id"] == alert_id:
            a["status"] = "resolved"
            a["resolved_at"] = datetime.utcnow().isoformat()
            return a
    return {"error": "Alert not found"}


@router.get("/channels")
async def get_alert_channels():
    """Get configured alert channels."""
    return {
        "channels": [
            {"name": "Slack", "type": "webhook", "configured": True, "webhook_url": "https://hooks.slack.com/services/xxx"},
            {"name": "Email", "type": "smtp", "configured": True, "recipients": ["admin@kubegenius.ai", "sre@kubegenius.ai"]},
            {"name": "PagerDuty", "type": "webhook", "configured": False},
            {"name": "Telegram", "type": "bot", "configured": False},
        ]
    }

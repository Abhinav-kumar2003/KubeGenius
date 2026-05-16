"""WebSocket connection manager."""

from typing import Dict, List
from fastapi import WebSocket


class ConnectionManager:
    """Manage WebSocket connections."""
    
    def __init__(self):
        self._connections: Dict[str, List[WebSocket]] = {
            "metrics": [],
            "events": [],
            "predictions": [],
        }
    
    async def connect(self, websocket: WebSocket, group: str = "metrics"):
        """Accept and store a WebSocket connection."""
        await websocket.accept()
        if group not in self._connections:
            self._connections[group] = []
        self._connections[group].append(websocket)
    
    def disconnect(self, websocket: WebSocket, group: str = "metrics"):
        """Remove a WebSocket connection."""
        if group in self._connections and websocket in self._connections[group]:
            self._connections[group].remove(websocket)
    
    async def broadcast_to_group(self, group: str, message: dict):
        """Send a message to all connections in a group."""
        if group not in self._connections:
            return
        
        disconnected = []
        for ws in self._connections[group]:
            try:
                await ws.send_json(message)
            except Exception:
                disconnected.append(ws)
        
        for ws in disconnected:
            self._connections[group].remove(ws)
    
    async def send_personal_message(self, websocket: WebSocket, message: dict):
        """Send a message to a specific connection."""
        try:
            await websocket.send_json(message)
        except Exception:
            pass

# backend/app/mcp_server/server.py
import asyncio
from typing import Dict, Any
import json
from fastapi import FastAPI, WebSocket, BackgroundTasks
from fastapi.responses import JSONResponse

from .tools_registry import ToolRegistry 
from ..tools.filesystem_tool import FilesystemTool  
from ..tools.camera_tool import CameraTool
from ..tools.screenshot_tool import ScreenshotTool
from ..tools.notification_tool import NotificationTool
from ..tools.report_generator_tool import ReportGeneratorTool


class MCPWebSocketServer:
    """MCP Server for handling WebSockets between agents and tools"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.tool_registry = ToolRegistry()
        
        # Register built-in tools
        self.tool_registry.register_tool("filesystem", FilesystemTool())
        self.tool_registry.register_tool("camera", CameraTool())  
        self.tool_registry.register_tool("screenshot", ScreenshotTool())
        self.tool_registry.register_tool("notification", NotificationTool())
        self.tool_registry.register_tool("report_generator", ReportGeneratorTool())

    async def handle_message(self, websocket: WebSocket, data: dict):
        """Process incoming message from an agent."""
        action = data.get('action')
        
        if not action:
            await websocket.send_text(json.dumps({"error": "No 'action' specified"}))
            return
            
        try:
            # Handle actions based on tool name and method
            match action:
                case "tool_call":
                    response = await self.process_tool_call(data)
                    await websocket.send_text(json.dumps(response))
                    
                case _:
                    await websocket.send_text(
                        json.dumps({"error": f"Unknown action: {action}"})
                    )
        except Exception as e:
            error_msg = {"error": str(e)}
            await websocket.send_text(json.dumps(error_msg))

    async def process_tool_call(self, data: dict) -> Dict[str, Any]:
        """Process tool invocation requests."""
        tool_name = data.get("tool")
        method = data.get("method")  
        args = data.get("args", {})

        if not self.tool_registry.exists(tool_name):
            raise ValueError(f"Tool '{tool_name}' does not exist.")

        tool_instance = self.tool_registry.get_tool(tool_name)
        
        # Call the requested method with arguments
        result = getattr(tool_instance, method)(**args)  
        return {"result": result}

    async def connect(self, websocket: WebSocket):
        """Add new connection."""
        conn_id = str(id(websocket))
        self.active_connections[conn_id] = websocket
        print(f"🔌 New MCP client connected: {conn_id}")

    async def disconnect(self, conn_id: str):
        """Remove disconnected client.""" 
        if conn_id in self.active_connections:
            del self.active_connections[conn_id]
            print(f"👋 MCP client disconnected: {conn_id}")
    
    def get_tool_names(self) -> list:
        """Return available tool names."""
        return list(self.tool_registry.get_all_tools().keys())


# Global instance of the server
mcp_server = MCPWebSocketServer()


async def handle_mcp_websocket(websocket: WebSocket, path: str):
    """Handle incoming WebSocket connections for MCP communication.""" 
    await mcp_server.connect(websocket)
    
    try:
        while True:
            message_text = await websocket.receive_text()
            data = json.loads(message_text)
            await mcp_server.handle_message(websocket, data)
            
    except Exception as e:
        print(f"WebSocket error: {e}")
        
    finally:
        conn_id = str(id(websocket))
        await mcp_server.disconnect(conn_id)


# FastAPI route to expose MCP tools info
@app.get("/mcp/tools")
async def get_available_tools():
    """Return list of available tools registered in MCP."""
    return JSONResponse(content={"tools": mcp_server.get_tool_names()})

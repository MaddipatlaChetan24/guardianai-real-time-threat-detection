# File: GuardianAI/mcp/server.py
"""
MCP (Multi-Component Protocol) server for GuardianAI system.
This acts as the central communication hub between agents and tools.
"""

import asyncio
import json
from typing import Dict, Any, Callable
from fastapi import FastAPI, WebSocket, HTTPException
from pydantic import BaseModel
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import tool functions
from tools.filesystem_tool import filesystem_tool
from tools.camera_tool import camera_tool
from tools.screenshot_tool import screenshot_tool
from tools.notification_tool import notification_tool
from tools.report_generator_tool import report_generator_tool

class MCPRequest(BaseModel):
    """Data model for MCP requests"""
    agent_id: str
    tool_name: str
    params: Dict[str, Any]
    timestamp: datetime = None
    
    class Config:
        arbitrary_types_allowed = True
        
class MCPResponse(BaseModel):
    """Data model for MCP responses"""
    success: bool
    result: Dict[str, Any] = {}
    error: str = None
    timestamp: datetime = None

# Global tool registry (in production would be loaded from config)
TOOL_REGISTRY = {
    "filesystem": filesystem_tool,
    "camera": camera_tool,
    "screenshot": screenshot_tool,
    "notification": notification_tool,
    "report_generator": report_generator_tool
}

class MCPManager:
    """Manages communication between agents and tools"""
    
    def __init__(self):
        self.active_connections = {}
        self.logger = logging.getLogger(__name__)
        
    async def register_agent(self, agent_id: str, websocket) -> None:
        """Register an agent with the MCP server"""
        self.active_connections[agent_id] = websocket
        self.logger.info(f"Agent {agent_id} registered")
        
    async def unregister_agent(self, agent_id: str) -> None:
        """Unregister an agent from the MCP server"""
        if agent_id in self.active_connections:
            del self.active_connections[agent_id]
            self.logger.info(f"Agent {agent_id} unregistered")
            
    async def execute_tool(self, tool_name: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a registered tool with given parameters"""
        
        if tool_name not in TOOL_REGISTRY:
            return {
                "success": False,
                "error": f"Tool {tool_name} not found",
                "type": "ToolNotFound"
            }
            
        try:
            # Get the tool function
            tool_function = TOOL_REGISTRY[tool_name]
            
            # Execute asynchronously (if supported)
            if asyncio.iscoroutinefunction(tool_function):
                result = await tool_function(params)
            else:
                # For synchronous tools, run in thread pool to avoid blocking
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(None, lambda: tool_function(params))
                
            return result
            
        except Exception as e:
            self.logger.error(f"Error executing tool {tool_name}: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "type": type(e).__name__
            }
    
    async def handle_message(self, agent_id: str, message_data: Dict[str, Any]) -> MCPResponse:
        """Handle incoming messages from agents"""
        
        try:
            # Parse the request
            request = MCPRequest(**message_data)
            
            # Execute requested tool
            result = await self.execute_tool(request.tool_name, request.params)
            
            return MCPResponse(
                success=result.get("success", False),
                result=result.get("result", {}),
                error=result.get("error"),
                timestamp=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Error handling message from {agent_id}: {str(e)}")
            return MCPResponse(
                success=False,
                error=str(e),
                timestamp=datetime.now()
            )

# Create MCP manager instance
mcp_manager = MCPManager()

# FastAPI app for the MCP server
app = FastAPI(title="GuardianAI Multi-Agent Control Protocol Server",
              description="Central communication hub for GuardianAI agents and tools")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "GuardianAI MCP Server is running"}

@app.websocket("/ws/{agent_id}")
async def websocket_endpoint(websocket: WebSocket, agent_id: str):
    """WebSocket endpoint for agent communication"""
    
    # Accept connection
    await websocket.accept()
    
    try:
        # Register the agent
        await mcp_manager.register_agent(agent_id, websocket)
        
        while True:
            # Receive message from agent
            data = await websocket.receive_text()
            
            try:
                message_data = json.loads(data)
                
                # Process the message through MCP manager
                response = await mcp_manager.handle_message(agent_id, message_data)
                
                # Send response back to agent
                await websocket.send_text(response.json())
                
            except Exception as e:
                error_response = MCPResponse(
                    success=False,
                    error=f"Error processing request: {str(e)}",
                    timestamp=datetime.now()
                )
                await websocket.send_text(error_response.json())
                
    except Exception as e:
        logger.error(f"WebSocket error with agent {agent_id}: {str(e)}")
    finally:
        # Unregister the agent when connection closes
        await mcp_manager.unregister_agent(agent_id)
        await websocket.close()

@app.post("/tool/{tool_name}")
async def execute_tool(tool_name: str, params: Dict[str, Any]):
    """Direct tool execution endpoint"""
    
    result = await mcp_manager.execute_tool(tool_name, params)
    
    return {
        "success": result.get("success", False),
        "result": result.get("result", {}),
        "error": result.get("error")
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

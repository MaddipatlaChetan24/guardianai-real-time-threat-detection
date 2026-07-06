# File: GuardianAI/mcp/tools_registry.py
"""
Registry for managing available tools in the MCP system.
This file maintains a centralized list of all available tools.
"""

from typing import Dict, Callable, Any
import logging

logger = logging.getLogger(__name__)

class ToolsRegistry:
    """Central registry for all MCP-compatible tools"""
    
    def __init__(self):
        self._tools: Dict[str, Callable] = {}
        
    def register_tool(self, name: str, tool_function: Callable) -> None:
        """Register a new tool in the system"""
        if not callable(tool_function):
            raise ValueError(f"Tool {name} must be callable")
            
        # Validate function signature (should accept params dict)
        import inspect
        sig = inspect.signature(tool_function)
        if len(sig.parameters) != 1 or 'params' not in sig.parameters:
            logger.warning(f"Tool {name} may not follow expected signature: def tool_name(params)")
            
        self._tools[name] = tool_function
        logger.info(f"Registered tool: {name}")
        
    def get_tool(self, name: str) -> Callable:
        """Retrieve a registered tool by name"""
        if name not in self._tools:
            raise KeyError(f"Tool '{name}' is not registered")
            
        return self._tools[name]
        
    def list_tools(self) -> Dict[str, str]:
        """List all available tools with brief descriptions"""
        # In production, this would include more metadata
        return {
            name: tool.__doc__ or "No description" 
            for name, tool in self._tools.items()
        }
        
    def unregister_tool(self, name: str) -> bool:
        """Remove a tool from the registry"""
        if name in self._tools:
            del self._tools[name]
            logger.info(f"Unregistered tool: {name}")
            return True
        return False

# Global instance of the tools registry
tools_registry = ToolsRegistry()

# Register all available tools
def initialize_tools():
    """Initialize and register all system tools"""
    
    # Import all required tools here (in production would be done via configuration)
    try:
        from tools.filesystem_tool import filesystem_tool
        from tools.camera_tool import camera_tool
        from tools.screenshot_tool import screenshot_tool
        from tools.notification_tool import notification_tool
        from tools.report_generator_tool import report_generator_tool
        
        # Register all tools
        tools_registry.register_tool("filesystem", filesystem_tool)
        tools_registry.register_tool("camera", camera_tool)
        tools_registry.register_tool("screenshot", screenshot_tool)
        tools_registry.register_tool("notification", notification_tool)
        tools_registry.register_tool("report_generator", report_generator_tool)
        
        logger.info("All MCP tools registered successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize tools: {str(e)}")
        raise

# Initialize the registry on import
initialize_tools()

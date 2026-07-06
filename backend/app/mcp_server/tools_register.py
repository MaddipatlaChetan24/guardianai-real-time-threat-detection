# backend/app/mcp_server/tools_registry.py

from typing import Dict, TypeVar, Generic, Optional
from abc import ABC, abstractmethod


T = TypeVar('T')


class ToolInterface(ABC):
    """Base interface for all MCP Tools."""
    
    @abstractmethod 
    def execute(self, **kwargs) -> any:
        pass
    
    @property
    @abstractmethod
    def name(self) -> str:
        pass

        
class ToolRegistry(Generic[T]):
    """
    Registry to store and retrieve tools used by agents.
    
    Tools must implement `ToolInterface`.
    """
    
    def __init__(self):
        self._tools: Dict[str, T] = {}
    
    def register_tool(self, name: str, tool_instance: T) -> None:
        """Register a new tool with given name."""
        if not isinstance(tool_instance, ToolInterface):
            raise TypeError("Tool must implement ToolInterface")
            
        self._tools[name] = tool_instance
    
    def get_tool(self, name: str) -> Optional[T]:
        """Retrieve tool by its registered name.""" 
        return self._tools.get(name)
    
    def exists(self, name: str) -> bool:
        """Check if a tool with the given name is registered."""
        return name in self._tools
    
    def get_all_tools(self) -> Dict[str, T]:
        """Return dictionary of all registered tools."""
        return dict(self._tools)

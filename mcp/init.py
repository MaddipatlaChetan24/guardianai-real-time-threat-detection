# File: GuardianAI/mcp/__init__.py
"""
MCP (Multi-Component Protocol) package initialization.
This module sets up the core functionality for agent-tool communication.
"""

from .server import app, mcp_manager
from .tools_registry import tools_registry, initialize_tools
from .config import mcp_config

# Initialize on import
initialize_tools()

__all__ = [
    'app',
    'mcp_manager', 
    'tools_registry',
    'mcp_config'
]

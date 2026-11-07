# File: GuardianAI/mcp/config.py
"""
Configuration settings for MCP server and tool execution.
This file manages environment-specific configurations.
"""

import os
from typing import Optional, Dict, Any
from pydantic_settings import BaseSettings
from pydantic import Field
import logging

logger = logging.getLogger(__name__)

class MCPConfig(BaseSettings):
    """Configuration class for MCP Server"""
    
    # Server settings
    server_host: str = Field(default="0.0.0.0", env="MCP_HOST")
    server_port: int = Field(default=8001, env="MCP_PORT")
    debug: bool = Field(default=False, env="MCP_DEBUG")
    
    # Security settings
    allowed_agents: list = Field(default_factory=list, env="ALLOWED_AGENTS")
    max_connections: int = Field(default=100, env="MAX_MCP_CONNECTIONS")
    
    # Tool execution settings
    tool_timeout_seconds: int = Field(default=30, env="TOOL_TIMEOUT_SECONDS")
    max_tool_retries: int = Field(default=3, env="MAX_TOOL_RETRIES")
    
    # Database connection (if needed)
    db_url: Optional[str] = Field(default=None, env="MCP_DB_URL")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Create a global config instance
mcp_config = MCPConfig()

def get_mcp_settings() -> Dict[str, Any]:
    """Get all MCP settings as dictionary"""
    return {
        key: value for key, value in mcp_config.dict().items()
        if not key.startswith('_')
    }

def validate_tool_access(agent_id: str) -> bool:
    """Validate if agent is allowed to access tools"""
    
    # If no specific agents are defined, allow all (development mode)
    if not mcp_config.allowed_agents or len(mcp_config.allowed_agents) == 0:
        return True
        
    return agent_id in mcp_config.allowed_agents

def get_tool_timeout() -> int:
    """Get timeout value for tool execution"""
    return getattr(mcp_config, 'tool_timeout_seconds', 30)

def get_max_retries() -> int:
    """Get maximum retries for failed tools"""
    return getattr(mcp_config, 'max_tool_retries', 3)

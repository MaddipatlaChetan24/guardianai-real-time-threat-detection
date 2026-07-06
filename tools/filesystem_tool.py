# File: GuardianAI/tools/filesystem_tool.py
"""
File system tool for GuardianAI MCP server.
Provides access to file operations within the security environment.
"""

import os
import json
from typing import Dict, Any, List
from pathlib import Path

async def filesystem_tool(params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Filesystem tool implementation.
    
    Parameters:
        operation (str): Type of filesystem operation ('list_dir', 'read_file', 'write_file')
        path (str): Target file or directory path
        content (optional): Content to write when writing a file
    
    Returns:
        Dict with result and status information
    """
    
    try:
        operation = params.get("operation")
        path = params.get("path")
        
        if not path:
            raise ValueError("Path parameter is required")
            
        # Normalize the path for security
        normalized_path = os.path.normpath(path)
        
        # Validate that path doesn't escape application directory
        base_dir = Path(__file__).parent.parent.parent  # GuardianAI root
        full_path = (base_dir / normalized_path).resolve()
        
        if not str(full_path).startswith(str(base_dir.resolve())):
            raise PermissionError("Path access denied - security violation")
            
        result = {}
        
        if operation == "list_dir":
            # List directory contents
            items: List[Dict[str, Any]] = []
            try:
                for item in os.listdir(str(full_path)):
                    item_path = full_path / item
                    stat_info = item_path.stat()
                    items.append({
                        "name": item,
                        "is_directory": item_path.is_dir(),
                        "size": stat_info.st_size if not item_path.is_dir() else 0,
                        "modified_at": stat_info.st_mtime
                    })
                result["items"] = items
            except Exception as e:
                raise IOError(f"Error listing directory: {str(e)}")
                
        elif operation == "read_file":
            # Read file content
            try:
                if full_path.is_dir():
                    raise IsADirectoryError("Cannot read a directory")
                    
                with open(str(full_path), 'r') as f:
                    content = f.read()
                    result["content"] = content
            except Exception as e:
                raise IOError(f"Error reading file: {str(e)}")
                
        elif operation == "write_file":
            # Write to file
            content = params.get("content", "")
            try:
                with open(str(full_path), 'w') as f:
                    f.write(content)
                result["status"] = "success"
            except Exception as e:
                raise IOError(f"Error writing file: {str(e)}")
                
        else:
            raise ValueError(f"Unsupported operation '{operation}'")
            
        return {"success": True, "result": result}
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "type": type(e).__name__
        }

# Export tool function for registry
__all__ = ["filesystem_tool"]

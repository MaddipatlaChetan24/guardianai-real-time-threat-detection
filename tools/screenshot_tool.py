# File: GuardianAI/tools/screenshot_tool.py
"""
Screenshot tool implementation for GuardianAI MCP server.
Takes screenshots of video feeds or UI elements.
"""

import cv2
from PIL import Image
import numpy as np
from typing import Dict, Any
import os

async def screenshot_tool(params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Screenshot tool implementation to capture frames from video sources.
    
    Parameters:
        source (str): Video source identifier (e.g., 'camera_1', 'dashboard')
        format (str): Output image format ('png', 'jpg') 
        save_path (optional): Path to save screenshot
    
    Returns:
        Dict with result and status information
    """
    
    try:
        source = params.get("source")
        img_format = params.get("format", "png").lower()
        
        if not source:
            raise ValueError("Source parameter is required")
            
        # In a real implementation, this would capture from actual video stream
        # Here we simulate by creating an image with some security-related data
        
        # Create a sample image (in real system, this comes from camera feed)
        width, height = 640, 480
        img_array = np.random.randint(0, 255, (height, width, 3), dtype=np.uint8)
        
        # Add some security-themed overlay
        cv2.putText(img_array, f"Security Feed: {source}", 
                   (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        cv2.putText(img_array, "GuardianAI System", 
                   (width - 200, height - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 1)
        
        # Convert to PIL Image for saving
        img_pil = Image.fromarray(cv2.cvtColor(img_array, cv2.COLOR_BGR2RGB))
        
        result = {}
        
        if params.get("save_path"):
            save_path = params["save_path"]
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            
            img_pil.save(save_path, format=img_format.upper())
            result["saved_to"] = save_path
            
        # Return image data as base64 (in real system could return binary or file path)
        import io
        buffer = io.BytesIO()
        img_pil.save(buffer, format=img_format.upper())
        img_data = buffer.getvalue()
        
        result["image_size"] = f"{width}x{height}"
        result["format"] = img_format
        
        # In a complete implementation, we'd return the image data appropriately
        # For now, just indicate that capture was successful
        return {"success": True, "result": result}
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "type": type(e).__name__
        }

# Export tool function for registry
__all__ = ["screenshot_tool"]

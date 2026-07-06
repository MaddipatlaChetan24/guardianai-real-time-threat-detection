# File: GuardianAI/tools/report_generator_tool.py
"""
Report generator tool implementation for GuardianAI MCP server.
Creates detailed incident reports with analysis and recommendations.
"""

import os
from datetime import datetime
from typing import Dict, Any
from jinja2 import Template
import json

async def report_generator_tool(params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Report generator tool implementation to create incident documentation.
    
    Parameters:
        incident_id (int): Unique identifier for the security incident
        format (str): Output format ('pdf', 'html', 'txt')
        include_images (bool, optional): Whether to attach screenshots
        
    Returns:
        Dict with result and status information
    """
    
    try:
        incident_id = params.get("incident_id")
        report_format = params.get("format", "pdf").lower()
        
        if not incident_id:
            raise ValueError("Incident ID is required")
            
        # Validate format
        valid_formats = ["pdf", "html", "txt"]
        if report_format not in valid_formats:
            raise ValueError(f"Unsupported report format: {report_format}")
            
        result = {
            "incident_id": incident_id,
            "generated_at": datetime.now().isoformat(),
            "output_format": report_format
        }
        
        # In a real system, this would fetch incident data from database
        # For demo purposes, we'll create sample incident data
        
        incident_data = generate_sample_incident_data(incident_id)
        
        # Generate the report based on format
        if report_format == "pdf":
            # Simulate PDF generation (would use libraries like ReportLab or WeasyPrint)
            result["output_path"] = f"reports/incident_{incident_id}.pdf"
            
        elif report_format == "html":
            html_content = generate_html_report(incident_data)
            output_path = f"reports/incident_{incident_id}.html"
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            with open(output_path, 'w') as f:
                f.write(html_content)
            result["output_path"] = output_path
            
        elif report_format == "txt":
            txt_content = generate_text_report(incident_data)
            output_path = f"reports/incident_{incident_id}.txt"
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            with open(output_path, 'w') as f:
                f.write(txt_content)
            result["output_path"] = output_path
            
        return {"success": True, "result": result}
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "type": type(e).__name__
        }

def generate_sample_incident_data(incident_id: int) -> Dict[str, Any]:
    """Generate sample incident data for demonstration"""
    
    # Sample incidents based on different threat types
    threats = [
        {"type": "violence", "level": 5, "description": "Physical altercation detected"},
        {"type": "intrusion", "level": 4, "description": "Unauthorized entry in restricted area"},
        {"type": "fire_smoke", "level": 9, "description": "Fire and smoke detected"},
        {"type": "loitering", "level": 3, "description": "Suspicious person loitering"}
    ]
    
    threat = threats[incident_id % len(threats)]
    
    return {
        "id": incident_id,
        "timestamp": datetime.now().isoformat(),
        "threat_type": threat["type"],
        "severity_level": threat["level"],
        "description": threat["description"],
        "location": f"Camera {incident_id % 10}",
        "detected_objects": ["person", "bag", "vehicle"] if incident_id > 2 else ["person", "weapon"],
        "suggested_action": "Immediate response required",
        "confidence_score": round(0.95 - (incident_id * 0.01), 2),
        "images_attached": incident_id % 3 != 0,
        "reporting_agent": "Threat Detection Agent"
    }

def generate_html_report(data: Dict[str, Any]) -> str:
    """Generate HTML report template"""
    
    html_template = """
<!DOCTYPE html>
<html>
<head>
    <title>Incident Report - ID {{ incident_id }}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #1a1a1a; color: #f0f0f0; }
        .header { border-bottom: 1px solid #444; padding-bottom: 15px; }
        .section { margin-top: 20px; }
        .key-value { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #333; }
        .severity-{{ severity_level }} { color: {{ severity_color }}; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>GuardianAI Security Incident Report</h1>
        <p><strong>ID:</strong> {{ incident_id }}</p>
        <p><strong>Date:</strong> {{ timestamp }}</p>
    </div>
    
    <div class="section">
        <h2>Incident Summary</h2>
        <div class="key-value"><span>Type:</span><span>{{ threat_type }}</span></div>
        <div class="key-value"><span>Severity Level:</span><span class="severity-{{ severity_level }}">{{ severity_level }}/10</span></div>
        <div class="key-value"><span>Description:</span><span>{{ description }}</span></div>
        <div class="key-value"><span>Location:</span><span>{{ location }}</span></div>
    </div>
    
    <div class="section">
        <h2>Detection Details</h2>
        <p><strong>Detected Objects:</strong> {{ detected_objects|join(', ') }}</p>
        <p><strong>Confidence Score:</strong> {{ confidence_score }}%</p>
    </div>
    
    <div class="section">
        <h2>Action Required</h2>
        <p>{{ suggested_action }}</p>
    </div>
    
    <div class="section">
        <h2>Generated By</h2>
        <p><strong>Agent:</strong> {{ reporting_agent }}</p>
    </div>
</body>
</html>
"""
    
    template = Template(html_template)
    
    # Map severity levels to colors
    severity_colors = {
        1: "#00ff00",   # Green
        2: "#33cc33",
        3: "#669900",
        4: "#ffcc00",   # Yellow
        5: "#ff9900",
        6: "#ff6600",
        7: "#ff3300",   # Orange-red
        8: "#ff1a1a",
        9: "#ff0000",   # Red
        10: "#cc0000"
    }
    
    color = severity_colors.get(data["severity_level"], "#ffffff")
    
    return template.render(
        incident_id=data["id"],
        timestamp=data["timestamp"],
        threat_type=data["threat_type"],
        severity_level=data["severity_level"],
        severity_color=color,
        description=data["description"],
        location=data["location"],
        detected_objects=data["detected_objects"],
        confidence_score=data["confidence_score"] * 100,
        suggested_action=data["suggested_action"],
        reporting_agent=data["reporting_agent"]
    )

def generate_text_report(data: Dict[str, Any]) -> str:
    """Generate plain text report"""
    
    content = f"""GUARDIANAI SECURITY INCIDENT REPORT
==================================

ID: {data['id']}
Date: {data['timestamp']}

INCIDENT SUMMARY
-----------------
Type: {data['threat_type']}
Severity Level: {data['severity_level']}/10
Description: {data['description']}
Location: {data['location']}

DETECTION DETAILS
------------------
Detected Objects: {', '.join(data['detected_objects'])}
Confidence Score: {data['confidence_score']:.2%}

ACTION REQUIRED
---------------
{data['suggested_action']}

GENERATED BY
------------
Agent: {data['reporting_agent']}
"""
    
    return content

# Export tool function for registry
__all__ = ["report_generator_tool"]

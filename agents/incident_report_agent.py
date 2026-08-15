"""
GuardianAI - Incident Report Agent
Handles automatic generation of security incident reports with full details.
"""

import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict
import uuid
import os
from pathlib import Path

# External libraries (to be installed)
import pdfkit
from jinja2 import Template
from PIL import Image
import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as ReportLabImage
from reportlab.lib.styles import getSampleStyleSheet

# Google ADK imports
from google_adk.agent import Agent
from google_adk.memory import Memory
from google_adk.reasoning_engine import ReasoningEngine
from google_adk.tool_call import ToolCall, ToolResult


@dataclass
class DetectedObject:
    """Represents a detected object in an incident."""
    class_name: str
    confidence: float
    bounding_box: Dict[str, int]
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class IncidentReport:
    """Complete structure of a security incident report."""
    id: str
    timestamp: datetime
    threat_level: str  # Low/Medium/High/Critical
    detected_objects: List[DetectedObject]
    summary: str
    suggested_action: str
    screenshot_path: Optional[str]
    camera_id: str
    location: str
    severity_score: float
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat(),
            "threat_level": self.threat_level,
            "detected_objects": [obj.to_dict() for obj in self.detected_objects],
            "summary": self.summary,
            "suggested_action": self.suggested_action,
            "screenshot_path": self.screenshot_path,
            "camera_id": self.camera_id,
            "location": self.location,
            "severity_score": self.severity_score
        }


class IncidentReportAgent(Agent):
    """Handles generation and management of incident reports."""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        super().__init__(
            name="IncidentReportAgent",
            description="Generates detailed security incident reports including PDFs.",
            tools=[],
            memory=Memory(),
            reasoning_engine=ReasoningEngine()
        )
        
        # Logging setup
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)
        
        # Configuration settings
        self.config = config or {}
        self.report_dir = Path(self.config.get("report_directory", "reports"))
        self.template_path = Path(self.config.get("template_path", "templates/report_template.html"))
        self.screenshot_dir = Path(self.config.get("screenshot_directory", "screenshots"))
        
        # Create directories if they don't exist
        self.report_dir.mkdir(exist_ok=True)
        self.screenshot_dir.mkdir(exist_ok=True)
        
        # Initialize report templates (if needed for HTML generation)
        self._init_templates()
        
    def _init_templates(self):
        """Initialize report templates."""
        # Placeholder - in a real implementation, this would load actual templates
        pass
        
    async def generate_incident_report(
        self,
        incident_data: Dict[str, Any],
        screenshot_bytes: Optional[bytes] = None
    ) -> IncidentReport:
        """
        Generate a complete security incident report.
        
        Args:
            incident_data (Dict): Raw incident data from other agents
            screenshot_bytes (Optional[bytes]): Bytes of the screenshot to include
            
        Returns:
            IncidentReport: Generated incident report object
        """
        try:
            # Extract core incident information
            timestamp = datetime.fromisoformat(incident_data.get("timestamp")) if isinstance(incident_data.get("timestamp"), str) else incident_data.get("timestamp")
            
            # Create unique ID for this report
            report_id = f"report_{uuid.uuid4().hex[:8]}"
            
            # Generate summary based on detected objects and threat level
            summary = self._generate_summary(incident_data)
            
            # Determine suggested action based on severity
            suggested_action = self._determine_suggested_action(incident_data.get("threat_level", "Medium"))
            
            # Handle screenshot - save to disk if provided
            screenshot_path = None
            if screenshot_bytes:
                screenshot_path = await self._save_screenshot(report_id, screenshot_bytes)
                
            # Create the report object
            incident_report = IncidentReport(
                id=report_id,
                timestamp=timestamp,
                threat_level=incident_data.get("threat_level", "Medium"),
                detected_objects=[
                    DetectedObject(**obj) for obj in incident_data.get("detected_objects", [])
                ],
                summary=summary,
                suggested_action=suggested_action,
                screenshot_path=screenshot_path,
                camera_id=incident_data.get("camera_id", "Unknown"),
                location=incident_data.get("location", "Unknown"),
                severity_score=incident_data.get("severity_score", 0.5)
            )
            
            # Store report in memory
            self.memory.store_item(f"report_{report_id}", incident_report.to_dict())
            
            return incident_report
            
        except Exception as e:
            self.logger.error(f"Error generating incident report: {e}")
            raise

    async def _save_screenshot(self, report_id: str, screenshot_bytes: bytes) -> str:
        """Save screenshot to disk and return path."""
        try:
            # Create filename with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"screenshot_{report_id}_{timestamp}.png"
            
            # Full path for the saved image
            full_path = self.screenshot_dir / filename
            
            # Open and save using PIL to ensure compatibility
            image = Image.open(io.BytesIO(screenshot_bytes))
            image.save(full_path, "PNG")
            
            return str(full_path)
        except Exception as e:
            self.logger.error(f"Error saving screenshot: {e}")
            raise

    def _generate_summary(self, incident_data: Dict[str, Any]) -> str:
        """Generate a human-readable summary of the incident."""
        threat_level = incident_data.get("threat_level", "Medium")
        detected_objects = incident_data.get("detected_objects", [])
        
        # Build initial summary based on threats
        if not detected_objects:
            return f"Security incident detected with {threat_level} severity - no specific objects identified."
            
        object_names = [obj["class_name"] for obj in detected_objects[:3]]  # Top 3 objects
        
        # Determine threat description
        if "weapon" in [obj["class_name"].lower() for obj in detected_objects]:
            return f"Potential weapon threat detected ({threat_level} severity). Objects: {', '.join(object_names)}."
        elif any("person" in obj["class_name"].lower() for obj in detected_objects):
            # Check if person is involved
            return f"Person-related security incident detected ({threat_level} severity). Objects: {', '.join(object_names)}."
        else:
            return f"Security event detected ({threat_level} severity) with objects: {', '.join(object_names)}."

    def _determine_suggested_action(self, threat_level: str) -> str:
        """Determine suggested action based on threat level."""
        actions = {
            "Low": "Monitor the situation. No immediate action required.",
            "Medium": "Review footage and consider notifying security personnel.",
            "High": "Alert security team immediately. Investigate further.",
            "Critical": "Activate emergency protocols. Notify authorities."
        }
        
        return actions.get(threat_level, actions["Medium"])

    async def generate_pdf_report(self, incident_report: IncidentReport) -> str:
        """
        Generate a PDF version of the incident report.
        
        Args:
            incident_report (IncidentReport): The report to convert
            
        Returns:
            str: Path to saved PDF file
        """
        try:
            # Create filename with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            pdf_filename = f"incident_report_{incident_report.id}_{timestamp}.pdf"
            
            # Full path for the PDF
            pdf_path = self.report_dir / pdf_filename
            
            # Create PDF document using ReportLab
            doc = SimpleDocTemplate(str(pdf_path), pagesize=letter)
            styles = getSampleStyleSheet()
            story = []
            
            # Title
            title = Paragraph("Security Incident Report", styles['Title'])
            story.append(title)
            story.append(Spacer(1, 12))
            
            # Header details
            header_data = [
                f"Report ID: {incident_report.id}",
                f"Timestamp: {incident_report.timestamp.strftime('%Y-%m-%d %H:%M:%S')}",
                f"Threat Level: {incident_report.threat_level}",
                f"Severity Score: {incident_report.severity_score:.2f}",
            ]
            
            for detail in header_data:
                story.append(Paragraph(detail, styles['Normal']))
                story.append(Spacer(1, 6))
                
            # Summary section
            story.append(Paragraph("Summary", styles['Heading2']))
            story.append(Paragraph(incident_report.summary, styles['Normal']))
            story.append(Spacer(1, 12))
            
            # Suggested Action
            story.append(Paragraph("Suggested Action", styles['Heading2']))
            story.append(Paragraph(incident_report.suggested_action, styles['Normal']))
            story.append(Spacer(1, 12))
            
            # Detected Objects
            story.append(Paragraph("Detected Objects", styles['Heading2']))
            for obj in incident_report.detected_objects:
                obj_text = f"<b>{obj.class_name}</b> (Confidence: {obj.confidence:.2f})"
                story.append(Paragraph(obj_text, styles['Normal']))
                
            # Camera Information
            story.append(Spacer(1, 12))
            camera_info = [
                f"Camera ID: {incident_report.camera_id}",
                f"Location: {incident_report.location}"
            ]
            
            for info in camera_info:
                story.append(Paragraph(info, styles['Normal']))
                
            # Add screenshot if available
            if incident_report.screenshot_path and os.path.exists(incident_report.screenshot_path):
                try:
                    story.append(Spacer(1, 12))
                    story.append(Paragraph("Incident Screenshot", styles['Heading2']))
                    
                    # ReportLab doesn't handle PIL images directly,
                    # so we'll add a placeholder for now
                    img = ReportLabImage(str(incident_report.screenshot_path), width=400, height=300)
                    story.append(img)
                except Exception as e:
                    self.logger.warning(f"Could not include screenshot in PDF: {e}")
            
            # Build document
            doc.build(story)
            
            return str(pdf_path)
        except Exception as e:
            self.logger.error(f"Error generating PDF report: {e}")
            raise

    async def get_incident_report(self, report_id: str) -> Optional[IncidentReport]:
        """Retrieve a previously generated incident report."""
        try:
            stored_data = self.memory.get_item(f"report_{report_id}")
            if not stored_data:
                return None
                
            # Convert to IncidentReport object
            return IncidentReport(
                id=stored_data["id"],
                timestamp=datetime.fromisoformat(stored_data["timestamp"]),
                threat_level=stored_data["threat_level"],
                detected_objects=[DetectedObject(**obj) for obj in stored_data["detected_objects"]],
                summary=stored_data["summary"],
                suggested_action=stored_data["suggested_action"],
                screenshot_path=stored_data.get("screenshot_path"),
                camera_id=stored_data["camera_id"],
                location=stored_data["location"],
                severity_score=stored_data["severity_score"]
            )
        except Exception as e:
            self.logger.error(f"Error retrieving incident report: {e}")
            return None

    async def handle_tool_call(self, tool_call: ToolCall) -> ToolResult:
        """
        Handle tool calls from other agents or MCP.
        
        Args:
            tool_call (ToolCall): Tool call request
            
        Returns:
            ToolResult: Result of the tool execution
        """
        try:
            # Route to appropriate handler based on function name
            if tool_call.function == "generate_incident_report":
                return await self._handle_generate_report(tool_call.arguments)
            elif tool_call.function == "generate_pdf_report":
                return await self._handle_generate_pdf(tool_call.arguments)
            elif tool_call.function == "get_incident_report":
                return await self._handle_get_report(tool_call.arguments)
            else:
                raise ValueError(f"Unknown tool function: {tool_call.function}")
                
        except Exception as e:
            self.logger.error(f"Error handling tool call: {e}")
            return ToolResult(
                success=False,
                result=f"Tool execution failed: {str(e)}"
            )

    async def _handle_generate_report(self, args: Dict[str, Any]) -> ToolResult:
        """Handle generating an incident report."""
        try:
            # Extract parameters from arguments
            incident_data = args.get("incident_data", {})
            screenshot_bytes = args.get("screenshot_bytes")
            
            # Generate the report
            report = await self.generate_incident_report(incident_data, screenshot_bytes)
            
            return ToolResult(
                success=True,
                result={
                    "report_id": report.id,
                    "timestamp": report.timestamp.isoformat(),
                    "threat_level": report.threat_level,
                    "summary": report.summary
                }
            )
        except Exception as e:
            self.logger.error(f"Error in _handle_generate_report: {e}")
            return ToolResult(
                success=False,
                result=f"Report generation failed: {str(e)}"
            )

    async def _handle_generate_pdf(self, args: Dict[str, Any]) -> ToolResult:
        """Handle generating a PDF version of an incident report."""
        try:
            # Extract parameters
            report_id = args.get("report_id")
            
            # Retrieve the report from memory
            incident_report = await self.get_incident_report(report_id)
            if not incident_report:
                raise ValueError(f"Report with ID {report_id} not found")
                
            # Generate PDF
            pdf_path = await self.generate_pdf_report(incident_report)
            
            return ToolResult(
                success=True,
                result={
                    "pdf_file": pdf_path,
                    "report_id": report_id,
                    "generated_at": datetime.now().isoformat()
                }
            )
        except Exception as e:
            self.logger.error(f"Error in _handle_generate_pdf: {e}")
            return ToolResult(
                success=False,
                result=f"PDF generation failed: {str(e)}"
            )

    async def _handle_get_report(self, args: Dict[str, Any]) -> ToolResult:
        """Handle retrieving a specific incident report."""
        try:
            # Extract parameters
            report_id = args.get("report_id")
            
            # Retrieve the report
            incident_report = await self.get_incident_report(report_id)
            
            if not incident_report:
                return ToolResult(
                    success=False,
                    result="Report not found"
                )
                
            return ToolResult(
                success=True,
                result=incident_report.to_dict()
            )
        except Exception as e:
            self.logger.error(f"Error in _handle_get_report: {e}")
            return ToolResult(
                success=False,
                result=f"Report retrieval failed: {str(e)}"
            )

    def get_agent_state(self) -> Dict[str, Any]:
        """Return current agent state."""
        return {
            "reports_generated": len([k for k in self.memory.get_all_keys() if k.startswith('report_')]),
            "screenshot_directory": str(self.screenshot_dir),
            "report_directory": str(self.report_dir),
            "status": "active",
            "memory_size": len(self.memory.get_all_items())
        }
        
    async def cleanup_old_reports(self, days_to_keep: int = 30) -> int:
        """Remove old reports that are beyond the retention period."""
        try:
            cutoff_date = datetime.now().replace(tzinfo=None) - timedelta(days=days_to_keep)
            
            # This is a simplified version; in practice, you'd want to check
            # timestamps stored with each report
            deleted_count = 0
            
            self.logger.info(f"Cleanup would remove reports older than {days_to_keep} days")
            
            return deleted_count
        except Exception as e:
            self.logger.error(f"Error during cleanup: {e}")
            raise


# Import needed for datetime.timedelta in cleanup function
from datetime import timedelta

# For production use, we also need to export the class properly
__all__ = ["IncidentReportAgent", "IncidentReport", "DetectedObject"]

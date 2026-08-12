"""
Threat Detection Agent
Analyzes video streams for potential security threats including violence, weapons,
intrusion, running, loitering, fire/smoke, accidents, and suspicious activities.
"""

import asyncio
import cv2
import numpy as np
from typing import Dict, List, Tuple, Any, Optional
from dataclasses import dataclass
from enum import Enum
import logging

# Import Google ADK components
from google.adk.agent import Agent, ToolCall, ToolResult
from google.adk.memory import Memory
from google.adk.planning import Plan, Task
from google.adk.reasoning import ReasoningEngine

# Local imports
from tools.gemini_tool import GeminiTool
from tools.video_analysis_tool import VideoAnalysisTool


class ThreatType(Enum):
    """Types of threats that can be detected"""
    VIOLENCE = "violence"
    WEAPON = "weapon"
    INTRUSION = "intrusion"
    RUNNING = "running"
    LOITERING = "loitering"
    FIRE_SMOKE = "fire_smoke"
    ACCIDENT = "accident"
    SUSPICIOUS_ACTIVITY = "suspicious_activity"


@dataclass
class ThreatDetection:
    """Data class representing a detected threat"""
    threat_type: ThreatType
    confidence: float  # 0.0 to 1.0
    timestamp: float
    location: Tuple[int, int]  # (x, y) coordinates
    description: str
    frame_data: np.ndarray = None


@dataclass
class ThreatAssessment:
    """Data class representing overall threat assessment"""
    threat_level: int  # 1-5 scale where 5 is highest risk
    confidence: float  # Overall confidence in assessment (0.0 to 1.0)
    detected_threats: List[ThreatDetection]
    summary: str


class ThreatDetectionAgent(Agent):
    """
    Multi-agent component that analyzes video frames for security threats.
    
    Responsibilities:
    - Detect violence, weapons, intrusion
    - Identify running and loitering behaviors
    - Spot fire/smoke incidents
    - Recognize accidents and suspicious activities
    
    Uses:
    - Computer Vision models
    - Gemini for reasoning capabilities
    - Temporal reasoning to detect behavioral patterns
    """
    
    def __init__(self):
        super().__init__(
            name="ThreatDetectionAgent",
            description="Analyzes video streams for potential security threats.",
            tools=[GeminiTool(), VideoAnalysisTool()],
            memory=Memory(),
            reasoning_engine=ReasoningEngine()
        )
        
        # Logging setup
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)
        
        # Threat detection configuration
        self.thresholds = {
            'violence': 0.7,
            'weapon': 0.75,
            'intrusion': 0.65,
            'running': 0.6,
            'loitering': 0.6,
            'fire_smoke': 0.8,
            'accident': 0.7,
            'suspicious_activity': 0.65
        }
        
        # Track previous frames for temporal analysis
        self.previous_frame_data = None
        self.tracked_objects = {}
        self.frame_count = 0

    async def analyze_frame(self, frame: np.ndarray, 
                          detections: List[Detection]) -> ThreatAssessment:
        """
        Analyze a single video frame for threats.
        
        Args:
            frame (np.ndarray): Input video frame
            detections (List[Detection]): Object detections from VideoAnalysisAgent
            
        Returns:
            ThreatAssessment: Assessment of threats in the frame
        """
        try:
            self.frame_count += 1
            
            # Perform threat analysis on current frame and detections
            detected_threats = []
            
            # Analyze each detection for potential threat indicators
            for detection in detections:
                threat = await self._analyze_detection(frame, detection)
                if threat:
                    detected_threats.append(threat)
                    
            # Apply temporal reasoning to detect behaviors like loitering or running
            temporal_threats = await self._temporal_analysis(frame, detections)
            detected_threats.extend(temporal_threats)
            
            # Generate overall assessment
            assessment = self._generate_assessment(detected_threats)
            
            return assessment
            
        except Exception as e:
            self.logger.error(f"Error in threat analysis: {e}")
            raise

    async def _analyze_detection(self, frame: np.ndarray, 
                               detection: Detection) -> Optional[ThreatDetection]:
        """
        Analyze a single detected object for potential threats.
        
        Args:
            frame (np.ndarray): Current video frame
            detection (Detection): Detected object information
            
        Returns:
            ThreatDetection or None: If threat is found, return the detection info
        """
        try:
            # Get bounding box coordinates
            x1, y1, x2, y2 = detection.bbox
            center_x = (x1 + x2) // 2
            center_y = (y1 + y2) // 2
            
            # Convert to relative coordinates for consistency
            height, width = frame.shape[:2]
            rel_center = (center_x / width, center_y / height)
            
            # Check specific threat types based on object class and characteristics
            if 'weapon' in detection.label.lower():
                return ThreatDetection(
                    threat_type=ThreatType.WEAPON,
                    confidence=detection.confidence * 0.9,  # Adjust for higher certainty
                    timestamp=self.get_timestamp(),
                    location=(center_x, center_y),
                    description=f"Weapon detected: {detection.label}",
                    frame_data=frame[y1:y2, x1:x2] if y1 < y2 and x1 < x2 else None
                )
            
            # Additional checks for other threat types would be implemented here
            # This is a simplified implementation
            
            return None
            
        except Exception as e:
            self.logger.error(f"Error analyzing detection: {e}")
            return None

    async def _temporal_analysis(self, frame: np.ndarray,
                               detections: List[Detection]) -> List[ThreatDetection]:
        """
        Perform temporal analysis to detect behavioral patterns.
        
        Args:
            frame (np.ndarray): Current video frame
            detections (List[Detection]): Object detections from current frame
            
        Returns:
            List[ThreatDetection]: Detected temporal threats
        """
        detected_threats = []
        
        # Simple loitering detection - track if objects stay in same position for too long
        if self.previous_frame_data is not None and len(detections) > 0:
            current_objects = {det.track_id: det for det in detections}
            
            # Check for objects that have been stationary for several frames (loitering)
            loitering_objects = self._detect_loitering(current_objects)
            detected_threats.extend(loitering_objects)
            
            # Track if objects are moving too fast (running) 
            running_objects = self._detect_running(current_objects, detections)
            detected_threats.extend(running_objects)
        
        # Update previous frame data
        self.previous_frame_data = {
            'frame': frame,
            'detections': detections.copy(),
            'timestamp': self.get_timestamp()
        }
        
        return detected_threats

    def _detect_loitering(self, current_objects: Dict[int, Detection]) -> List[ThreatDetection]:
        """Detect loitering behavior - objects remaining in same location for too long."""
        loitering_threats = []
        
        # Simplified implementation
        if len(current_objects) > 0:
            # In a real system, we'd track positions and time spent at locations
            # For now just return a sample threat to show the concept
            for obj_id, detection in current_objects.items():
                # Randomly simulate loitering with low probability
                if np.random.rand() < 0.1:  # 10% chance of detection
                    x1, y1, x2, y2 = detection.bbox
                    center_x = (x1 + x2) // 2
                    center_y = (y1 + y2) // 2
                    
                    loitering_threats.append(ThreatDetection(
                        threat_type=ThreatType.LOITERING,
                        confidence=0.65,
                        timestamp=self.get_timestamp(),
                        location=(center_x, center_y),
                        description="Potential loitering behavior detected"
                    ))
                    
        return loitering_threats

    def _detect_running(self, prev_objects: Dict[int, Detection], 
                       current_detections: List[Detection]) -> List[ThreatDetection]:
        """Detect running behavior - objects moving at high speed."""
        running_threats = []
        
        # Simplified implementation
        for detection in current_detections:
            if np.random.rand() < 0.05:  # 5% chance of being detected as running
                x1, y1, x2, y2 = detection.bbox
                center_x = (x1 + x2) // 2
                center_y = (y1 + y2) // 2
                
                running_threats.append(ThreatDetection(
                    threat_type=ThreatType.RUNNING,
                    confidence=0.7,
                    timestamp=self.get_timestamp(),
                    location=(center_x, center_y),
                    description="Potential fast movement detected"
                ))
                
        return running_threats

    def _generate_assessment(self, threats: List[ThreatDetection]) -> ThreatAssessment:
        """
        Generate overall threat assessment based on individual threats.
        
        Args:
            threats (List[ThreatDetection]): Detected threats
            
        Returns:
            ThreatAssessment: Overall assessment of threat level
        """
        if not threats:
            return ThreatAssessment(
                threat_level=1,  # Low risk when no threats found
                confidence=0.95,
                detected_threats=[],
                summary="No significant threats detected"
            )
            
        # Calculate overall threat level (weighted average of confidences)
        total_confidence = sum(t.confidence for t in threats)
        avg_confidence = total_confidence / len(threats) if threats else 0
        
        # Calculate threat level based on highest confidence and threat type
        max_confidence = max(t.confidence for t in threats)
        threat_level = int(min(5, max_confidence * 10))  # Scale to 1-5
        
        # Generate summary description
        if threat_level >= 4:
            severity_desc = "HIGH"
        elif threat_level == 3:
            severity_desc = "MEDIUM"
        else:
            severity_desc = "LOW"
            
        summary = f"{severity_desc} threat level detected. Found {len(threats)} potential issues."
        
        return ThreatAssessment(
            threat_level=threat_level,
            confidence=avg_confidence,
            detected_threats=threats,
            summary=summary
        )

    def get_timestamp(self) -> float:
        """Get current timestamp."""
        import time
        return time.time()

    async def handle_tool_call(self, tool_call: ToolCall) -> ToolResult:
        """
        Handle tool calls from other agents or MCP.
        
        Args:
            tool_call (ToolCall): Tool call request
            
        Returns:
            ToolResult: Result of the tool execution
        """
        try:
            # Route to appropriate tool handler based on function name
            if tool_call.function == "analyze_threats":
                return await self._handle_analyze_threats(tool_call.arguments)
            elif tool_call.function == "get_assessment":
                return await self._handle_get_assessment(tool_call.arguments)
            else:
                raise ValueError(f"Unknown tool function: {tool_call.function}")
                
        except Exception as e:
            self.logger.error(f"Error handling tool call: {e}")
            return ToolResult(
                success=False,
                result=f"Tool execution failed: {str(e)}"
            )

    async def _handle_analyze_threats(self, args: Dict[str, Any]) -> ToolResult:
        """Handle analysis of video frame for threats."""
        try:
            # This would be called with a frame and detections
            frame = args.get("frame")
            detections = args.get("detections", [])
            
            if not isinstance(frame, np.ndarray):
                raise ValueError("Frame must be provided as numpy array")
                
            assessment = await self.analyze_frame(frame, detections)
            
            return ToolResult(
                success=True,
                result={
                    "assessment": {
                        "threat_level": assessment.threat_level,
                        "confidence": assessment.confidence,
                        "summary": assessment.summary,
                        "detected_threats": [
                            {
                                "type": t.threat_type.value,
                                "confidence": t.confidence,
                                "timestamp": t.timestamp,
                                "location": t.location,
                                "description": t.description
                            } for t in assessment.detected_threats
                        ]
                    }
                }
            )
            
        except Exception as e:
            self.logger.error(f"Error in _handle_analyze_threats: {e}")
            return ToolResult(
                success=False,
                result=f"Analysis failed: {str(e)}"
            )

    async def _handle_get_assessment(self, args: Dict[str, Any]) -> ToolResult:
        """Handle getting current threat assessment."""
        try:
            # In a real implementation this would return stored assessments
            # For now we'll simulate returning the last processed data
            
            result = {
                "frame_count": self.frame_count,
                "last_assessment": {
                    "threat_level": 1,  # Default low risk
                    "confidence": 0.95,
                    "summary": "System initialized"
                }
            }
            
            return ToolResult(
                success=True,
                result=result
            )
        except Exception as e:
            self.logger.error(f"Error in _handle_get_assessment: {e}")
            return ToolResult(
                success=False,
                result=f"Assessment failed: {str(e)}"
            )

    async def get_agent_state(self) -> Dict[str, Any]:
        """Return current agent state."""
        return {
            "frame_count": self.frame_count,
            "status": "active",
            "threats_detected": len(self.tracked_objects),
            "memory_size": len(self.memory.get_all_items())
        }

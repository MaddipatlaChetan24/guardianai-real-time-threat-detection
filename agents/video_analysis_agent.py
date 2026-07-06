"""
Video Analysis Agent
Responsible for reading CCTV streams, capturing frames,
preprocessing, object detection, and tracking.
"""

import asyncio
import cv2
import numpy as np
from typing import Dict, List, Tuple, Any, Optional
from dataclasses import dataclass
import logging

# Import Google ADK components
from google.adk.agent import Agent, ToolCall, ToolResult
from google.adk.memory import Memory
from google.adk.planning import Plan, Task
from google.adk.reasoning import ReasoningEngine

# Local imports
from tools.camera_tool import CameraTool
from tools.filesystem_tool import FilesystemTool


@dataclass
class Detection:
    """Data class representing a detected object"""
    label: str
    confidence: float
    bbox: Tuple[int, int, int, int]  # (x1, y1, x2, y2)
    track_id: Optional[int] = None


@dataclass
class FrameAnalysisResult:
    """Data class representing frame analysis results"""
    timestamp: float
    detections: List[Detection]
    crowd_count: int
    frame_data: np.ndarray  # Raw image data for screenshots or reports


class VideoAnalysisAgent(Agent):
    """
    Multi-agent component that handles video input processing,
    object detection, and tracking using YOLOv11 and DeepSORT.
    
    Responsibilities:
    - Read CCTV stream (live camera or video file)
    - Capture frames from streams
    - Preprocess frames for computer vision models
    - Run object detection on each frame
    - Perform object tracking across frames
    - Generate crowd counts and metadata per frame
    
    Uses OpenCV, YOLOv11, DeepSORT
    """
    
    def __init__(self):
        super().__init__(
            name="VideoAnalysisAgent",
            description="Analyzes video streams for objects, tracks movement, and provides analytics.",
            tools=[CameraTool(), FilesystemTool()],
            memory=Memory(),
            reasoning_engine=ReasoningEngine()
        )
        
        # Initialize YOLOv11 model (placeholder - actual implementation requires loading weights)
        self.yolo_model = None
        self.tracker = None
        
        # Track frame processing state
        self.frame_number = 0
        self.last_frame_time = 0
        
        # Logging setup
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)

    async def process_video_stream(self, stream_url: str) -> List[FrameAnalysisResult]:
        """
        Process a live video stream from camera or URL.
        
        Args:
            stream_url (str): URL or device index for video source
            
        Returns:
            List[FrameAnalysisResult]: Analysis results per frame
        """
        self.logger.info(f"Starting video stream processing from {stream_url}")
        
        cap = cv2.VideoCapture(stream_url)
        if not cap.isOpened():
            raise ValueError(f"Cannot open video stream at {stream_url}")

        results: List[FrameAnalysisResult] = []
        
        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    self.logger.info("Video stream ended or error occurred")
                    break
                
                # Process frame
                result = await self.process_frame(frame)
                if result is not None:
                    results.append(result)
                
                self.frame_number += 1
                
                # Optional: limit processing speed (e.g., max FPS) 
                # time.sleep(0.03)  # ~30 fps limit
                    
        finally:
            cap.release()
            
        return results

    async def process_video_file(self, video_path: str) -> List[FrameAnalysisResult]:
        """
        Process a stored video file from local storage.
        
        Args:
            video_path (str): Local path to video file
            
        Returns:
            List[FrameAnalysisResult]: Analysis results per frame
        """
        self.logger.info(f"Processing video file {video_path}")
        
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Cannot open video file at {video_path}")

        results: List[FrameAnalysisResult] = []
        
        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    self.logger.info("Video file processing completed")
                    break
                
                # Process frame
                result = await self.process_frame(frame)
                if result is not None:
                    results.append(result)
                
                self.frame_number += 1
                    
        finally:
            cap.release()
            
        return results

    async def process_frame(self, frame: np.ndarray) -> FrameAnalysisResult:
        """
        Process a single video frame for object detection and tracking.
        
        Args:
            frame (np.ndarray): Input frame from video stream
            
        Returns:
            FrameAnalysisResult: Analysis result with detections
        """
        try:
            # Preprocess frame if needed
            processed_frame = self.preprocess_frame(frame)
            
            # Perform object detection
            detections = await self.detect_objects(processed_frame)
            
            # Apply tracking to detected objects
            tracked_detections = self.track_objects(detections, processed_frame)
            
            # Count crowd in frame
            crowd_count = self.count_crowd(tracked_detections)
            
            return FrameAnalysisResult(
                timestamp=self.get_timestamp(),
                detections=tracked_detections,
                crowd_count=crowd_count,
                frame_data=frame.copy()  # Return original frame for reference
            )
        except Exception as e:
            self.logger.error(f"Error processing frame: {e}")
            raise

    def preprocess_frame(self, frame: np.ndarray) -> np.ndarray:
        """
        Preprocess video frames before detection.
        
        Args:
            frame (np.ndarray): Input frame
            
        Returns:
            np.ndarray: Processed frame
        """
        # Basic preprocessing - can be expanded
        # Resize for performance if needed
        height, width = frame.shape[:2]
        
        # Keep original aspect ratio while resizing
        max_dimension = 640  # Adjust as needed
        scale = min(max_dimension / width, max_dimension / height)
        
        new_width = int(width * scale)
        new_height = int(height * scale)
        
        if new_width != width or new_height != height:
            frame = cv2.resize(frame, (new_width, new_height))
            
        # Convert BGR to RGB for consistency
        return cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    async def detect_objects(self, frame: np.ndarray) -> List[Detection]:
        """
        Detect objects in processed frame using computer vision models.
        
        Args:
            frame (np.ndarray): Preprocessed input frame
            
        Returns:
            List[Detection]: Detected objects
        """
        # Placeholder for actual YOLOv11 implementation
        detections = []
        
        # Example detection logic - would be replaced with real model inference
        sample_labels = ["person", "car", "truck", "dog", "cat"]
        
        # Simulate finding some objects in frame (replace with actual model output)
        num_objects = np.random.randint(1, 6)  # Random between 1-5
        
        for i in range(num_objects):
            label = np.random.choice(sample_labels)
            confidence = float(np.random.uniform(0.6, 0.99))
            
            height, width = frame.shape[:2]
            x1 = int(np.random.uniform(10, width - 50)) 
            y1 = int(np.random.uniform(10, height - 50))
            # Ensure bbox is valid
            if x1 + 30 > width:
                x1 = max(0, width - 30)
            if y1 + 30 > height:
                y1 = max(0, height - 30)
                
            w = int(np.random.uniform(20, 80))
            h = int(np.random.uniform(20, 80))
            
            # Ensure bounding box stays within frame
            x2 = min(width - 1, x1 + w)
            y2 = min(height - 1, y1 + h)
            
            bbox = (x1, y1, x2, y2)
            
            detections.append(Detection(
                label=label,
                confidence=confidence,
                bbox=bbox
            ))
        
        return detections

    def track_objects(self, detections: List[Detection], frame: np.ndarray) -> List[Detection]:
        """
        Apply object tracking to detected objects across frames.
        
        Args:
            detections (List[Detection]): New detections from current frame
            
        Returns:
            List[Detection]: Detections with assigned IDs
        """
        # Placeholder for actual DeepSORT implementation
        
        # Simple approach: assign ID based on detection order (would be replaced)
        tracked_detections = []
        for i, det in enumerate(detections):
            updated_det = Detection(
                label=det.label,
                confidence=det.confidence,
                bbox=det.bbox,
                track_id=i + 1000  # Simple ID assignment
            )
            tracked_detections.append(updated_det)
            
        return tracked_detections

    def count_crowd(self, detections: List[Detection]) -> int:
        """
        Count people in frame for crowd analytics.
        
        Args:
            detections (List[Detection]): Detected objects
            
        Returns:
            int: Number of detected persons
        """
        person_count = 0
        
        # In real implementation, check label field or use segmentation model
        for det in detections:
            if "person" in det.label.lower():
                person_count += 1
                
        return person_count

    def get_timestamp(self) -> float:
        """Get current timestamp."""
        import time
        return time.time()

    async def handle_tool_call(self, tool_call: ToolCall) -> ToolResult:
        """
        Handle tool calls from other agents or MCP server.
        
        Args:
            tool_call (ToolCall): Tool call request
            
        Returns:
            ToolResult: Result of the tool execution
        """
        try:
            # Route to appropriate tool handler based on function name
            if tool_call.function == "capture_frame":
                return await self._handle_capture_frame(tool_call.arguments)
            elif tool_call.function == "save_to_filesystem":
                return await self._handle_save_to_filesystem(tool_call.arguments)
            else:
                raise ValueError(f"Unknown tool: {tool_call.function}")
                
        except Exception as e:
            self.logger.error(f"Error handling tool call: {e}")
            return ToolResult(
                success=False,
                result=f"Failed to execute {tool_call.function}: {str(e)}"
            )

    async def _handle_capture_frame(self, args: Dict[str, Any]) -> ToolResult:
        """Handle camera capture requests."""
        try:
            stream_url = args.get("stream_url", 0)
            cap = cv2.VideoCapture(stream_url)
            
            ret, frame = cap.read()
            cap.release()
            
            if not ret:
                raise Exception("Failed to capture image from stream")
                
            # Convert to base64 for return
            _, buffer = cv2.imencode('.jpg', frame)
            encoded_image = buffer.tobytes()
            
            result_data = {
                "image_bytes": encoded_image,
                "timestamp": self.get_timestamp(),
                "frame_shape": frame.shape
            }
            
            return ToolResult(
                success=True,
                result=result_data
            )
            
        except Exception as e:
            return ToolResult(
                success=False,
                result=f"Error capturing frame: {str(e)}"
            )

    async def _handle_save_to_filesystem(self, args: Dict[str, Any]) -> ToolResult:
        """Handle saving frames to filesystem."""
        try:
            image_bytes = args.get("image_bytes")
            filename = args.get("filename", f"frame_{self.frame_number}.jpg")
            
            # Save logic would go here
            import os
            
            if not os.path.exists("screenshots"):
                os.makedirs("screenshots")
                
            full_path = os.path.join("screenshots", filename)
            
            with open(full_path, 'wb') as f:
                f.write(image_bytes)
                
            return ToolResult(
                success=True,
                result={"saved_path": full_path}
            )
        except Exception as e:
            return ToolResult(
                success=False,
                result=f"Error saving frame: {str(e)}"
            )

    async def get_agent_state(self) -> Dict[str, Any]:
        """Return current agent state."""
        return {
            "frame_number": self.frame_number,
            "last_frame_time": self.last_frame_time,
            "status": "running" if self.yolo_model is not None else "idle"
        }

    async def run_analysis_cycle(self, stream_url: str = None) -> Dict[str, Any]:
        """
        Run a complete analysis cycle on either camera input or video file.
        
        Args:
            stream_url (str): Camera URL or path to local video
            
        Returns:
            Dict[str, Any]: Summary of processing results
        """
        try:
            if not stream_url:
                raise ValueError("Stream URL must be provided")
                
            if stream_url.startswith(("http://", "https://")):
                # Process live feed
                results = await self.process_video_stream(stream_url)
            else:
                # Process video file
                results = await self.process_video_file(stream_url)
                
            return {
                "success": True,
                "total_frames_processed": len(results),
                "summary": {
                    "detection_count": sum(len(r.detections) for r in results),
                    "avg_crowd_count": np.mean([r.crowd_count for r in results]) if results else 0
                }
            }
            
        except Exception as e:
            self.logger.error(f"Analysis cycle failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }


# Example usage (can be integrated into main.py or agent manager):
if __name__ == "__main__":
    # Create an instance
    agent = VideoAnalysisAgent()
    
    print("Video Analysis Agent initialized")
    print(f"Agent name: {agent.name}")
    print(f"Description: {agent.description}")

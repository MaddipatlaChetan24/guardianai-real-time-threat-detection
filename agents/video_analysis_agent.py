"""
Video Analysis Agent
Responsible for reading CCTV streams, capturing frames,
preprocessing, object detection, and tracking.
"""

import asyncio
import os
import time
import logging
from dataclasses import dataclass, field
from typing import Dict, List, Tuple, Any, Optional

import cv2
import numpy as np

# Real detection / tracking backends
from ultralytics import YOLO
from deep_sort_realtime.deepsort_tracker import DeepSort

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

    # Labels counted toward "crowd" analytics
    PERSON_LABELS = {"person"}

    def __init__(
        self,
        model_path: str = "yolo11n.pt",
        device: str = "cpu",
        conf_threshold: float = 0.4,
        iou_threshold: float = 0.45,
        max_dimension: int = 640,
    ):
        super().__init__(
            name="VideoAnalysisAgent",
            description="Analyzes video streams for objects, tracks movement, and provides analytics.",
            tools=[CameraTool(), FilesystemTool()],
            memory=Memory(),
            reasoning_engine=ReasoningEngine(),
        )

        self.device = device
        self.conf_threshold = conf_threshold
        self.iou_threshold = iou_threshold
        self.max_dimension = max_dimension

        # Logging setup
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)

        # Load YOLOv11 model
        try:
            self.yolo_model = YOLO(model_path)
            self.yolo_model.to(self.device)
            self.class_names = self.yolo_model.names  # {id: label}
            self.logger.info(f"Loaded YOLO model '{model_path}' on {self.device}")
        except Exception as e:
            self.logger.error(f"Failed to load YOLO model '{model_path}': {e}")
            self.yolo_model = None
            self.class_names = {}

        # Initialize DeepSORT tracker
        try:
            self.tracker = DeepSort(
                max_age=30,
                n_init=3,
                nms_max_overlap=1.0,
                embedder="mobilenet",
                half=True,
                bgr=True,
            )
        except Exception as e:
            self.logger.error(f"Failed to initialize DeepSORT tracker: {e}")
            self.tracker = None

        # Track frame processing state
        self.frame_number = 0
        self.last_frame_time = 0.0

        # Keep the scale factor used in preprocessing so bboxes can be
        # mapped back to original-frame coordinates when needed.
        self._last_scale: float = 1.0

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

                result = await self.process_frame(frame)
                if result is not None:
                    results.append(result)

                self.frame_number += 1

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
            processed_frame = self.preprocess_frame(frame)

            detections = await self.detect_objects(processed_frame)

            tracked_detections = self.track_objects(detections, processed_frame)

            crowd_count = self.count_crowd(tracked_detections)

            self.last_frame_time = self.get_timestamp()

            return FrameAnalysisResult(
                timestamp=self.last_frame_time,
                detections=tracked_detections,
                crowd_count=crowd_count,
                frame_data=frame.copy(),
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
            np.ndarray: Processed frame (resized, RGB)
        """
        height, width = frame.shape[:2]

        scale = min(self.max_dimension / width, self.max_dimension / height, 1.0)
        self._last_scale = scale

        new_width = int(width * scale)
        new_height = int(height * scale)

        if new_width != width or new_height != height:
            frame = cv2.resize(frame, (new_width, new_height))

        return cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    async def detect_objects(self, frame: np.ndarray) -> List[Detection]:
        """
        Detect objects in processed frame using YOLOv11.

        Args:
            frame (np.ndarray): Preprocessed input frame (RGB)

        Returns:
            List[Detection]: Detected objects
        """
        if self.yolo_model is None:
            self.logger.warning("YOLO model not loaded; returning no detections")
            return []

        loop = asyncio.get_event_loop()

        def _run_inference():
            return self.yolo_model.predict(
                source=frame,
                conf=self.conf_threshold,
                iou=self.iou_threshold,
                device=self.device,
                verbose=False,
            )

        # Run blocking inference in a thread so we don't stall the event loop
        results = await loop.run_in_executor(None, _run_inference)

        detections: List[Detection] = []
        if not results:
            return detections

        boxes = results[0].boxes
        if boxes is None or len(boxes) == 0:
            return detections

        xyxy = boxes.xyxy.cpu().numpy()
        confs = boxes.conf.cpu().numpy()
        cls_ids = boxes.cls.cpu().numpy().astype(int)

        for (x1, y1, x2, y2), conf, cls_id in zip(xyxy, confs, cls_ids):
            label = self.class_names.get(int(cls_id), str(cls_id))
            detections.append(
                Detection(
                    label=label,
                    confidence=float(conf),
                    bbox=(int(x1), int(y1), int(x2), int(y2)),
                )
            )

        return detections

    def track_objects(self, detections: List[Detection], frame: np.ndarray) -> List[Detection]:
        """
        Apply DeepSORT tracking to detected objects across frames.

        Args:
            detections (List[Detection]): New detections from current frame
            frame (np.ndarray): Current frame (RGB), used for appearance embedding

        Returns:
            List[Detection]: Detections with assigned track IDs
        """
        if self.tracker is None or not detections:
            return detections

        # deep-sort-realtime expects detections as:
        # ([left, top, w, h], confidence, class_name)
        ds_input = []
        for det in detections:
            x1, y1, x2, y2 = det.bbox
            w, h = x2 - x1, y2 - y1
            ds_input.append(([x1, y1, w, h], det.confidence, det.label))

        # DeepSort expects BGR frames internally for its embedder
        bgr_frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        tracks = self.tracker.update_tracks(ds_input, frame=bgr_frame)

        tracked_detections: List[Detection] = []
        for track in tracks:
            if not track.is_confirmed():
                continue

            l, t, r, b = track.to_ltrb()
            tracked_detections.append(
                Detection(
                    label=track.get_det_class() or "unknown",
                    confidence=float(track.get_det_conf() or 0.0),
                    bbox=(int(l), int(t), int(r), int(b)),
                    track_id=int(track.track_id) if str(track.track_id).isdigit() else hash(track.track_id) & 0xFFFF,
                )
            )

        return tracked_detections

    def count_crowd(self, detections: List[Detection]) -> int:
        """
        Count people in frame for crowd analytics.

        Args:
            detections (List[Detection]): Detected objects

        Returns:
            int: Number of detected persons
        """
        return sum(1 for det in detections if det.label.lower() in self.PERSON_LABELS)

    def get_timestamp(self) -> float:
        """Get current timestamp."""
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
                result=f"Failed to execute {tool_call.function}: {str(e)}",
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

            _, buffer = cv2.imencode(".jpg", frame)
            encoded_image = buffer.tobytes()

            result_data = {
                "image_bytes": encoded_image,
                "timestamp": self.get_timestamp(),
                "frame_shape": frame.shape,
            }

            return ToolResult(success=True, result=result_data)

        except Exception as e:
            return ToolResult(success=False, result=f"Error capturing frame: {str(e)}")

    async def _handle_save_to_filesystem(self, args: Dict[str, Any]) -> ToolResult:
        """Handle saving frames to filesystem."""
        try:
            image_bytes = args.get("image_bytes")
            filename = args.get("filename", f"frame_{self.frame_number}.jpg")

            if not os.path.exists("screenshots"):
                os.makedirs("screenshots")

            full_path = os.path.join("screenshots", filename)

            with open(full_path, "wb") as f:
                f.write(image_bytes)

            return ToolResult(success=True, result={"saved_path": full_path})
        except Exception as e:
            return ToolResult(success=False, result=f"Error saving frame: {str(e)}")

    async def get_agent_state(self) -> Dict[str, Any]:
        """Return current agent state."""
        return {
            "frame_number": self.frame_number,
            "last_frame_time": self.last_frame_time,
            "status": "running" if self.yolo_model is not None else "idle",
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
                results = await self.process_video_stream(stream_url)
            else:
                results = await self.process_video_file(stream_url)

            return {
                "success": True,
                "total_frames_processed": len(results),
                "summary": {
                    "detection_count": sum(len(r.detections) for r in results),
                    "avg_crowd_count": float(np.mean([r.crowd_count for r in results])) if results else 0.0,
                },
            }

        except Exception as e:
            self.logger.error(f"Analysis cycle failed: {e}")
            return {"success": False, "error": str(e)}


# Example usage (can be integrated into main.py or agent manager):
if __name__ == "__main__":
    agent = VideoAnalysisAgent()

    print("Video Analysis Agent initialized")
    print(f"Agent name: {agent.name}")
    print(f"Description: {agent.description}")

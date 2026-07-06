# tests/test_tools.py
import pytest
from unittest.mock import Mock, patch

# Import your tool classes here  
from tools.filesystem_tool import FilesystemTool
from tools.camera_tool import CameraTool  
from tools.screenshot_tool import ScreenshotTool
from tools.notification_tool import NotificationTool
from tools.report_generator_tool import ReportGeneratorTool

def test_filesystem_tool_initialization():
    """Test filesystem tool initialization"""
    tool = FilesystemTool()
    
    assert hasattr(tool, 'read')
    assert hasattr(tool, 'write') 
    assert tool.name == "Filesystem Tool"

def test_camera_tool_initialization():
    """Test camera tool initialization"""
    tool = CameraTool() 
    
    assert hasattr(tool, 'capture_frame')
    assert hasattr(tool, 'start_streaming')
    assert tool.name == "Camera Tool"

def test_screenshot_tool_initialization():
    """Test screenshot tool initialization"""
    tool = ScreenshotTool()
    
    assert hasattr(tool, 'take_screenshot') 
    assert tool.name == "Screenshot Tool"

def test_notification_tool_initialization():
    """Test notification tool initialization"""
    tool = NotificationTool()
    
    assert hasattr(tool, 'send_email')
    assert hasattr(tool, 'send_sms')
    assert tool.name == "Notification Tool"

def test_report_generator_tool_initialization():
    """Test report generator tool initialization""" 
    tool = ReportGeneratorTool()
    
    assert hasattr(tool, 'generate_pdf')
    assert hasattr(tool, 'create_summary')
    assert tool.name == "Report Generator Tool"

@patch('tools.filesystem_tool.os.path.exists')
def test_filesystem_read(mock_exists):
    """Test filesystem read operation"""
    mock_exists.return_value = True
    
    tool = FilesystemTool()
    result = tool.read("/test/file.txt")
    
    assert isinstance(result, str)

def test_camera_capture_frame():
    """Test camera frame capture (mocked)"""
    tool = CameraTool() 
    
    with patch.object(tool, '_capture_from_source') as mock_capture:
        mock_capture.return_value = b"fake_image_data"
        
        result = tool.capture_frame("camera_url")
        assert isinstance(result, bytes)

@patch('tools.screenshot_tool.pyautogui')
def test_screenshot_take(mock_pyauto):
    """Test screenshot taking"""
    mock_pyauto.screenshot.return_value = Mock()
    
    tool = ScreenshotTool() 
    result = tool.take_screenshot("/output/path.png")
    
    assert isinstance(result, str)

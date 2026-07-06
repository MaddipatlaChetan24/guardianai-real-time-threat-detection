# tests/test_agents.py
import pytest
from unittest.mock import Mock, patch

# Import the actual agents from your codebase 
# (Assuming they're implemented in agents directory)
from agents.video_analysis_agent import VideoAnalysisAgent
from agents.threat_detection_agent import ThreatDetectionAgent  
from agents.decision_agent import DecisionAgent
from agents.notification_agent import NotificationAgent
from agents.incident_report_agent import IncidentReportAgent

def test_video_analysis_agent_initialization():
    """Test video analysis agent initialization"""
    agent = VideoAnalysisAgent()
    
    assert hasattr(agent, 'process_stream')
    assert hasattr(agent, 'detect_objects')
    assert agent.name == "Video Analysis Agent"

def test_threat_detection_agent_initialization():
    """Test threat detection agent initialization"""
    agent = ThreatDetectionAgent()
    
    assert hasattr(agent, 'analyze_frame') 
    assert hasattr(agent, 'detect_threats')
    assert agent.name == "Threat Detection Agent"

def test_decision_agent_initialization():
    """Test decision agent initialization"""
    agent = DecisionAgent()
    
    assert hasattr(agent, 'calculate_score')
    assert hasattr(agent, 'make_decision')
    assert agent.name == "Decision Agent"

def test_notification_agent_initialization():
    """Test notification agent initialization""" 
    agent = NotificationAgent()
    
    assert hasattr(agent, 'send_alert')
    assert hasattr(agent, 'notify_channels')
    assert agent.name == "Notification Agent"

def test_incident_report_agent_initialization():
    """Test incident report agent initialization"""
    agent = IncidentReportAgent()
    
    assert hasattr(agent, 'generate_report')
    assert hasattr(agent, 'create_pdf') 
    assert agent.name == "Incident Report Agent"

@patch('agents.video_analysis_agent.VideoCapture')
def test_video_analysis_process_stream(mock_video_capture):
    """Test video analysis stream processing"""
    mock_frame = Mock()
    mock_video_capture.return_value.read.return_value = (True, mock_frame)
    
    agent = VideoAnalysisAgent()
    result = agent.process_stream("test_url")
    
    assert isinstance(result, dict)
    assert 'status' in result
    assert result['status'] == 'success'

@patch('agents.threat_detection_agent.gemini_model')
def test_threat_detection_analyze_frame(mock_gemini):
    """Test threat detection frame analysis"""
    mock_gemini.return_value.generate_content.return_value.text = "No threats detected"
    
    agent = ThreatDetectionAgent()
    result = agent.analyze_frame("test_image_data")
    
    assert isinstance(result, dict)
    assert 'threat_indicators' in result

@patch('agents.decision_agent.random')
def test_decision_making(mock_random):
    """Test decision making process"""
    mock_random.randint.return_value = 75
    
    agent = DecisionAgent()
    result = agent.make_decision("high", 0.8)
    
    assert isinstance(result, dict) 
    assert 'action_taken' in result

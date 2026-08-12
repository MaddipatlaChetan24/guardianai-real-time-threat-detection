import asyncio
import json
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum
import logging

# Import Google ADK components
from google.adk.agent import Agent, ToolCall, ToolResult
from google.adk.memory import Memory
from google.adk.planning import Plan, Task
from google.adk.reasoning import ReasoningEngine

# Local imports
from agents.threat_detection_agent import ThreatAssessment, ThreatDetection
from tools.notification_tool import NotificationTool


class DecisionType(Enum):
    """Types of decisions that can be made"""
    IGNORE = "ignore"
    MONITOR = "monitor"
    WARN = "warn"
    EMERGENCY = "emergency"


@dataclass
class ExecutionPlan:
    """Data class representing a plan for action execution"""
    decision: DecisionType
    priority: int  # 1-5 scale where 5 is highest priority
    confidence: float  # 0.0 to 1.0
    actions: List[str]
    timestamp: datetime
    affected_agents: List[str]


@dataclass
class IncidentReport:
    """Data class representing a generated incident report"""
    threat_assessment: ThreatAssessment
    decision_plan: ExecutionPlan
    timestamp: datetime
    report_id: str
    summary: str


class DecisionAgent(Agent):
    """
    Multi-agent component that makes decisions based on inputs from all other agents.
    
    Responsibilities:
    - Receives outputs from all agents (video analysis, threat detection, etc.)
    - Calculates threat scores and confidence levels
    - Makes decisions about how to respond (ignore, monitor, warn, emergency)
    - Creates execution plans for actions to be taken
    - Coordinates multi-agent workflows
    
    Uses:
    - Decision matrix based on threat level and confidence
    - Prioritization algorithms
    - Risk scoring models
    """
    
    def __init__(self):
        super().__init__(
            name="DecisionAgent",
            description="Makes decisions about security incidents and coordinates agent responses.",
            tools=[NotificationTool()],
            memory=Memory(),
            reasoning_engine=ReasoningEngine()
        )
        
        # Logging setup
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)
        
        # Decision configuration
        self.decision_matrix = {
            "low": {"threshold": 2, "decision": DecisionType.MONITOR, "priority": 1},
            "medium": {"threshold": 3, "decision": DecisionType.WARN, "priority": 2}, 
            "high": {"threshold": 4, "decision": DecisionType.EMERGENCY, "priority": 4},
            "critical": {"threshold": 5, "decision": DecisionType.EMERGENCY, "priority": 5}
        }
        
        # Tracking for decision history
        self.decision_history = []
        self.active_incidents = {}

    async def process_threat_assessment(self, 
                                      assessment: ThreatAssessment,
                                      source_agent: str) -> ExecutionPlan:
        """
        Process threat assessment and generate appropriate response plan.
        
        Args:
            assessment (ThreatAssessment): Assessment from threat detection agent
            source_agent (str): Agent that provided the assessment
            
        Returns:
            ExecutionPlan: Plan of actions to execute based on decision
        """
        try:
            # Calculate overall risk score
            risk_score = self._calculate_risk_score(assessment)
            
            # Determine decision type and priority
            decision_type, priority_level = await self._make_decision(
                assessment.threat_level, 
                assessment.confidence,
                risk_score
            )
            
            # Generate action plan based on decision
            actions = await self._generate_actions(decision_type, assessment)
            
            # Create execution plan
            plan = ExecutionPlan(
                decision=decision_type,
                priority=priority_level,
                confidence=assessment.confidence,
                actions=actions,
                timestamp=datetime.now(),
                affected_agents=[source_agent]
            )
            
            # Store in history for audit trail
            self.decision_history.append({
                "timestamp": plan.timestamp.isoformat(),
                "threat_assessment": {
                    "level": assessment.threat_level,
                    "confidence": assessment.confidence,
                    "summary": assessment.summary,
                    "detected_threats": len(assessment.detected_threats)
                },
                "decision": decision_type.value,
                "priority": priority_level
            })
            
            return plan
            
        except Exception as e:
            self.logger.error(f"Error processing threat assessment: {e}")
            raise

    def _calculate_risk_score(self, assessment: ThreatAssessment) -> float:
        """
        Calculate overall risk score based on multiple factors.
        
        Args:
            assessment (ThreatAssessment): Input threat assessment
            
        Returns:
            float: Risk score between 0 and 1
        """
        # Weighted calculation combining threat level, confidence, and number of threats
        threat_level_weight = 0.4
        confidence_weight = 0.3
        num_threats_weight = 0.3
        
        # Normalize threat level to 0-1 scale (assuming max level is 5)
        normalized_level = assessment.threat_level / 5.0
        
        # Combine factors with weights
        risk_score = (
            (normalized_level * threat_level_weight) +
            (assessment.confidence * confidence_weight) +
            (len(assessment.detected_threats) * num_threats_weight)
        )
        
        # Ensure score is between 0 and 1
        return max(0.0, min(1.0, risk_score))

    async def _make_decision(self, threat_level: int, confidence: float, 
                           risk_score: float) -> tuple[DecisionType, int]:
        """
        Make decision based on threat level, confidence, and risk score.
        
        Args:
            threat_level (int): Threat level from 1-5
            confidence (float): Overall confidence in assessment (0.0-1.0)
            risk_score (float): Calculated risk score (0.0-1.0)
            
        Returns:
            tuple[DecisionType, int]: Decision type and priority level
        """
        # Simple decision logic based on thresholds
        if threat_level >= 5 or risk_score >= 0.9:
            return DecisionType.EMERGENCY, 5
        elif threat_level >= 4 or (risk_score >= 0.7 and confidence >= 0.8):
            return DecisionType.EMERGENCY, 4
        elif threat_level >= 3 or (risk_score >= 0.5 and confidence >= 0.6):
            return DecisionType.WARN, 3
        elif threat_level >= 2 or risk_score >= 0.3:
            return DecisionType.MONITOR, 2
        else:
            return DecisionType.IGNORE, 1

    async def _generate_actions(self, decision: DecisionType, 
                              assessment: ThreatAssessment) -> List[str]:
        """
        Generate specific actions to be taken based on decision.
        
        Args:
            decision (DecisionType): Type of decision made
            assessment (ThreatAssessment): Threat assessment
            
        Returns:
            List[str]: List of action strings to execute
        """
        actions = []
        
        # Base actions that are always taken
        actions.append(f"Log incident with threat level {assessment.threat_level}")
        actions.append("Update dashboard status")
        
        # Decision-specific additional actions
        if decision == DecisionType.IGNORE:
            actions.append("No action required - monitor for changes")
            
        elif decision == DecisionType.MONITOR:
            actions.extend([
                "Increase monitoring frequency",
                "Send alert to security personnel",
                "Record event for future review"
            ])
            
        elif decision == DecisionType.WARN:
            actions.extend([
                "Generate warning notification",
                "Notify security team via SMS/Email",
                "Start recording additional footage",
                "Prepare emergency response plan"
            ])
            
        elif decision == DecisionType.EMERGENCY:
            actions.extend([
                "Trigger emergency alert system",
                "Send immediate notification to all relevant parties",
                "Activate security protocols",
                "Initiate emergency response procedures",
                "Notify authorities if required",
                "Generate detailed incident report"
            ])
            
        return actions

    async def execute_plan(self, plan: ExecutionPlan) -> bool:
        """
        Execute the action plan generated by this agent.
        
        Args:
            plan (ExecutionPlan): Plan to execute
            
        Returns:
            bool: True if execution successful
        """
        try:
            # Log the execution
            self.logger.info(f"Executing decision plan - {plan.decision.value} (Priority: {plan.priority})")
            
            # Execute each action in the plan
            for i, action in enumerate(plan.actions):
                await self._execute_action(action)
                
            return True
            
        except Exception as e:
            self.logger.error(f"Error executing plan: {e}")
            return False

    async def _execute_action(self, action: str) -> bool:
        """
        Execute a single action from the execution plan.
        
        Args:
            action (str): Action to execute
            
        Returns:
            bool: True if successful
        """
        try:
            # Example of how actions could be executed
            self.logger.info(f"Executing action: {action}")
            
            # In a real implementation, this would call specific tools or agents
            # For example:
            # - Send notification via NotificationTool
            # - Update database records  
            # - Trigger external APIs
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error executing action '{action}': {e}")
            return False

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
            if tool_call.function == "make_decision":
                return await self._handle_make_decision(tool_call.arguments)
            elif tool_call.function == "execute_plan":
                return await self._handle_execute_plan(tool_call.arguments)
            elif tool_call.function == "get_decision_history":
                return await self._handle_get_decision_history(tool_call.arguments)
            else:
                raise ValueError(f"Unknown tool function: {tool_call.function}")
                
        except Exception as e:
            self.logger.error(f"Error handling tool call: {e}")
            return ToolResult(
                success=False,
                result=f"Tool execution failed: {str(e)}"
            )

    async def _handle_make_decision(self, args: Dict[str, Any]) -> ToolResult:
        """Handle making a decision based on threat assessment."""
        try:
            # Extract inputs from arguments
            assessment_data = args.get("assessment", {})
            source_agent = args.get("source_agent", "unknown")
            
            # Convert dict back to ThreatAssessment (simplified for example)
            assessment = ThreatAssessment(
                threat_level=assessment_data.get("threat_level", 1),
                confidence=assessment_data.get("confidence", 0.5),
                detected_threats=[],
                summary=assessment_data.get("summary", "No description provided")
            )
            
            # Process the assessment
            plan = await self.process_threat_assessment(assessment, source_agent)
            
            return ToolResult(
                success=True,
                result={
                    "decision": {
                        "type": plan.decision.value,
                        "priority": plan.priority,
                        "confidence": plan.confidence,
                        "actions": plan.actions
                    }
                }
            )
        except Exception as e:
            self.logger.error(f"Error in _handle_make_decision: {e}")
            return ToolResult(
                success=False,
                result=f"Decision making failed: {str(e)}"
            )

    async def _handle_execute_plan(self, args: Dict[str, Any]) -> ToolResult:
        """Handle executing a decision plan."""
        try:
            # In a real system this would process an ExecutionPlan object
            # For now we simulate execution
            
            success = True  # Simulated execution result
            
            return ToolResult(
                success=success,
                result={
                    "status": "executed" if success else "failed",
                    "timestamp": datetime.now().isoformat()
                }
            )
        except Exception as e:
            self.logger.error(f"Error in _handle_execute_plan: {e}")
            return ToolResult(
                success=False,
                result=f"Plan execution failed: {str(e)}"
            )

    async def _handle_get_decision_history(self, args: Dict[str, Any]) -> ToolResult:
        """Handle getting decision history."""
        try:
            # Return recent decisions with optional filtering
            limit = int(args.get("limit", 10))
            
            return ToolResult(
                success=True,
                result={
                    "history": self.decision_history[-limit:] if len(self.decision_history) > limit 
                              else self.decision_history.copy()
                }
            )
        except Exception as e:
            self.logger.error(f"Error in _handle_get_decision_history: {e}")
            return ToolResult(
                success=False,
                result=f"History retrieval failed: {str(e)}"
            )

    async def get_agent_state(self) -> Dict[str, Any]:
        """Return current agent state."""
        return {
            "decision_count": len(self.decision_history),
            "active_incidents": len(self.active_incidents),
            "status": "active",
            "memory_size": len(self.memory.get_all_items()),
            "last_decision_timestamp": self.decision_history[-1]["timestamp"] if self.decision_history else None
        }

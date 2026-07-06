import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Import Google ADK components
from google.adk.agent import Agent, ToolCall, ToolResult
from google.adk.memory import Memory
from google.adk.planning import Plan, Task
from google.adk.reasoning import ReasoningEngine

# Third-party libraries for notifications
import requests
from twilio.rest import Client as TwilioClient  # For SMS alerts
import telegram  # For Telegram notifications


class NotificationChannel(Enum):
    """Supported notification channels"""
    EMAIL = "email"
    SMS = "sms" 
    TELEGRAM = "telegram"
    WEBHOOK = "webhook"
    DASHBOARD = "dashboard"
    EMERGENCY = "emergency"


@dataclass
class Notification:
    """Data class representing a notification to be sent"""
    channel: NotificationChannel
    recipient: str
    subject: str
    message: str
    priority: int  # 1-5 scale where 5 is highest
    timestamp: datetime
    metadata: Dict[str, Any] = None


@dataclass
class AlertConfiguration:
    """Configuration for different alert types"""
    channel: NotificationChannel
    enabled: bool
    recipients: List[str]
    template: str
    priority: int  # 1-5 scale where 5 is highest
    conditions: Dict[str, Any] = None


class NotificationAgent(Agent):
    """
    Multi-agent component that handles sending alerts and notifications.
    
    Responsibilities:
    - Sends email notifications for incidents
    - Sends SMS alerts to security personnel  
    - Sends Telegram messages for urgent situations
    - Posts dashboard notifications in real-time
    - Triggers webhooks for external integrations
    - Handles emergency alert protocols
    
    Uses:
    - Twilio API for SMS messaging
    - SMTP for email delivery
    - Telegram Bot API
    - Webhook endpoints for integration
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        super().__init__(
            name="NotificationAgent",
            description="Handles sending alerts and notifications across multiple channels.",
            tools=[],
            memory=Memory(),
            reasoning_engine=ReasoningEngine()
        )
        
        # Logging setup
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)
        
        # Configuration settings
        self.config = config or {}
        self.alert_configs = self._load_alert_configurations()
        
        # Initialize notification services
        self.email_client = None
        self.sms_client = None  
        self.telegram_bot = None
        
        # Notification history tracking
        self.notification_history = []
        self.active_alerts = {}

    def _load_alert_configurations(self) -> Dict[NotificationChannel, AlertConfiguration]:
        """Load alert configurations from config or defaults."""
        return {
            NotificationChannel.EMAIL: AlertConfiguration(
                channel=NotificationChannel.EMAIL,
                enabled=self.config.get("email_enabled", True),
                recipients=self.config.get("email_recipients", []),
                template="Email notification about security incident",
                priority=3
            ),
            NotificationChannel.SMS: AlertConfiguration(
                channel=NotificationChannel.SMS,
                enabled=self.config.get("sms_enabled", False),
                recipients=self.config.get("sms_recipients", []),
                template="SMS alert - Security incident detected!",
                priority=4
            ),
            NotificationChannel.TELEGRAM: AlertConfiguration(
                channel=NotificationChannel.TELEGRAM,
                enabled=self.config.get("telegram_enabled", False),
                recipients=self.config.get("telegram_chat_ids", []),
                template="Telegram alert - Urgent security issue",
                priority=5
            ),
            NotificationChannel.WEBHOOK: AlertConfiguration(
                channel=NotificationChannel.WEBHOOK,
                enabled=self.config.get("webhook_enabled", False),
                recipients=[self.config.get("webhook_url", "")],
                template="Webhook notification for incident",
                priority=2
            ),
            NotificationChannel.DASHBOARD: AlertConfiguration(
                channel=NotificationChannel.DASHBOARD,
                enabled=True,  # Always enabled for dashboard alerts
                recipients=[],
                template="Dashboard alert - Incident detected",
                priority=3
            )
        }

    async def send_notification(self, notification: Notification) -> bool:
        """
        Send a single notification via specified channel.
        
        Args:
            notification (Notification): Notification to send
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            self.logger.info(f"Sending {notification.channel.value} notification to {notification.recipient}")
            
            # Route based on notification type
            success = await self._send_via_channel(notification)
            
            # Record in history regardless of outcome
            record = {
                "timestamp": datetime.now().isoformat(),
                "channel": notification.channel.value,
                "recipient": notification.recipient,
                "subject": notification.subject,
                "priority": notification.priority,
                "success": success
            }
            self.notification_history.append(record)
            
            return success
            
        except Exception as e:
            self.logger.error(f"Error sending notification: {e}")
            # Even if failed, still record in history for audit purposes
            record = {
                "timestamp": datetime.now().isoformat(),
                "channel": notification.channel.value,
                "recipient": notification.recipient,
                "subject": notification.subject,
                "priority": notification.priority,
                "success": False,
                "error": str(e)
            }
            self.notification_history.append(record)
            return False

    async def _send_via_channel(self, notification: Notification) -> bool:
        """Send notification via specific channel."""
        if notification.channel == NotificationChannel.EMAIL:
            return await self._send_email(notification)
        elif notification.channel == NotificationChannel.SMS:
            return await self._send_sms(notification)
        elif notification.channel == NotificationChannel.TELEGRAM:
            return await self._send_telegram(notification)
        elif notification.channel == NotificationChannel.WEBHOOK:
            return await self._send_webhook(notification)
        elif notification.channel == NotificationChannel.DASHBOARD:
            return await self._send_dashboard_alert(notification)
        else:
            self.logger.warning(f"Unsupported channel: {notification.channel}")
            return False

    async def _send_email(self, notification: Notification) -> bool:
        """Send email via SMTP."""
        try:
            # Initialize SMTP client if not already done
            if not self.email_client:
                smtp_host = self.config.get("smtp_host", "smtp.gmail.com")
                smtp_port = int(self.config.get("smtp_port", 587))
                username = self.config.get("email_username")
                password = self.config.get("email_password")
                
                # Create SMTP session
                self.email_client = smtplib.SMTP(smtp_host, smtp_port)
                self.email_client.starttls()
                self.email_client.login(username, password)
            
            # Prepare email message
            msg = MIMEMultipart()
            msg['From'] = self.config.get("email_username")
            msg['To'] = notification.recipient
            msg['Subject'] = notification.subject
            
            msg.attach(MIMEText(notification.message, 'html'))
            
            # Send email
            text = msg.as_string()
            self.email_client.sendmail(self.config.get("email_username"), 
                                     notification.recipient, text)
            
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to send email: {e}")
            return False

    async def _send_sms(self, notification: Notification) -> bool:
        """Send SMS via Twilio."""
        try:
            # Initialize Twilio client if not already done
            if not self.sms_client:
                account_sid = self.config.get("twilio_account_sid")
                auth_token = self.config.get("twilio_auth_token")
                self.sms_client = TwilioClient(account_sid, auth_token)
            
            # Send SMS using Twilio API
            from_number = self.config.get("twilio_phone_number", "+1234567890")  # Default fallback
            
            message = self.sms_client.messages.create(
                body=notification.message,
                from_=from_number,
                to=notification.recipient
            )
            
            return True if message.sid else False
            
        except Exception as e:
            self.logger.error(f"Failed to send SMS: {e}")
            return False

    async def _send_telegram(self, notification: Notification) -> bool:
        """Send Telegram message."""
        try:
            # Initialize Telegram bot if not already done
            if not self.telegram_bot:
                token = self.config.get("telegram_token")
                self.telegram_bot = telegram.Bot(token=token)
            
            # Send message via Telegram API
            await self.telegram_bot.send_message(
                chat_id=notification.recipient,
                text=notification.message,
                parse_mode="HTML"
            )
            
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to send Telegram message: {e}")
            return False

    async def _send_webhook(self, notification: Notification) -> bool:
        """Send webhook request."""
        try:
            # Get webhook URL from configuration or notification metadata
            if not notification.metadata or "webhook_url" not in notification.metadata:
                webhook_urls = self.alert_configs[NotificationChannel.WEBHOOK].recipients
                if not webhook_urls:
                    return False  # No webhooks configured
                    
                url = webhook_urls[0]  # Use first configured URL
            else:
                url = notification.metadata["webhook_url"]
            
            payload = {
                "timestamp": datetime.now().isoformat(),
                "channel": NotificationChannel.WEBHOOK.value,
                "subject": notification.subject,
                "message": notification.message,
                "priority": notification.priority
            }
            
            # Send POST request to webhook endpoint
            response = requests.post(
                url,
                json=payload,
                timeout=10  # Timeout after 10 seconds
            )
            
            return response.status_code < 400
            
        except Exception as e:
            self.logger.error(f"Failed to send webhook: {e}")
            return False

    async def _send_dashboard_alert(self, notification: Notification) -> bool:
        """Send alert to dashboard (simulated)."""
        try:
            # In a real implementation this would push data to WebSocket or database
            # For now we simulate by storing in memory
            
            self.active_alerts[notification.recipient] = {
                "timestamp": datetime.now(),
                "subject": notification.subject,
                "message": notification.message,
                "priority": notification.priority
            }
            
            # Simulate sending via websocket or event bus
            print(f"Dashboard alert sent: {notification.subject}")
            
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to send dashboard alert: {e}")
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
            # Route to appropriate handler based on function name
            if tool_call.function == "send_notification":
                return await self._handle_send_notification(tool_call.arguments)
            elif tool_call.function == "send_alert":
                return await self._handle_send_alert(tool_call.arguments)
            elif tool_call.function == "get_notification_history":
                return await self._handle_get_notification_history(tool_call.arguments)
            else:
                raise ValueError(f"Unknown tool function: {tool_call.function}")
                
        except Exception as e:
            self.logger.error(f"Error handling tool call: {e}")
            return ToolResult(
                success=False,
                result=f"Tool execution failed: {str(e)}"
            )

    async def _handle_send_notification(self, args: Dict[str, Any]) -> ToolResult:
        """Handle sending a notification."""
        try:
            # Extract parameters from arguments
            channel = NotificationChannel(args.get("channel", "email"))
            recipient = args.get("recipient")
            subject = args.get("subject", "")
            message = args.get("message", "")
            priority = int(args.get("priority", 3))
            
            notification = Notification(
                channel=channel,
                recipient=recipient,
                subject=subject,
                message=message,
                priority=priority,
                timestamp=datetime.now()
            )
            
            success = await self.send_notification(notification)
            
            return ToolResult(
                success=True,
                result={
                    "success": success,
                    "notification_id": f"notif_{datetime.now().timestamp()}"
                }
            )
        except Exception as e:
            self.logger.error(f"Error in _handle_send_notification: {e}")
            return ToolResult(
                success=False,
                result=f"Notification send failed: {str(e)}"
            )

    async def _handle_send_alert(self, args: Dict[str, Any]) -> ToolResult:
        """Handle sending an alert via configured channels."""
        try:
            # This would typically be called with incident details
            # For now we'll create a default alert
            
            alert_type = args.get("alert_type", "general")
            
            # Get configuration for this alert type
            if alert_type not in self.alert_configs:
                raise ValueError(f"Unknown alert type: {alert_type}")
                
            config = self.alert_configs[alert_type]
            
            # Send alerts to all configured recipients
            results = []
            for recipient in config.recipients:
                notification = Notification(
                    channel=config.channel,
                    recipient=recipient,
                    subject=f"[SECURITY ALERT] - {config.template}",
                    message=args.get("message", "Security incident detected"),
                    priority=config.priority,
                    timestamp=datetime.now()
                )
                
                success = await self.send_notification(notification)
                results.append({
                    "recipient": recipient,
                    "success": success
                })
            
            return ToolResult(
                success=True,
                result={
                    "alert_type": alert_type,
                    "sent_to": len(config.recipients),
                    "successful_deliveries": sum(1 for r in results if r["success"]),
                    "results": results
                }
            )
        except Exception as e:
            self.logger.error(f"Error in _handle_send_alert: {e}")
            return ToolResult(
                success=False,
                result=f"Alert sending failed: {str(e)}"
            )

    async def _handle_get_notification_history(self, args: Dict[str, Any]) -> ToolResult:
        """Handle getting notification history."""
        try:
            # Return recent notifications with optional filtering
            limit = int(args.get("limit", 10))
            
            return ToolResult(
                success=True,
                result={
                    "history": self.notification_history[-limit:] if len(self.notification_history) > limit 
                              else self.notification_history.copy(),
                    "total_count": len(self.notification_history)
                }
            )
        except Exception as e:
            self.logger.error(f"Error in _handle_get_notification_history: {e}")
            return ToolResult(
                success=False,
                result=f"History retrieval failed: {str(e)}"
            )

    def get_agent_state(self) -> Dict[str, Any]:
        """Return current agent state."""
        return {
            "notification_count": len(self.notification_history),
            "active_alerts": len(self.active_alerts),
            "status": "active",
            "memory_size": len(self.memory.get_all_items()),
            "configs": {k.value: v.enabled for k, v in self.alert_configs.items()}
        }

    def get_active_alerts_summary(self) -> Dict[str, Any]:
        """Get summary of active alerts."""
        return {
            "count": len(self.active_alerts),
            "alerts": [
                {
                    "id": key,
                    "subject": value["subject"],
                    "priority": value["priority"]
                } for key, value in self.active_alerts.items()
            ]
        }

    async def cleanup(self):
        """Cleanup resources when shutting down."""
        try:
            # Close SMTP connection if open
            if self.email_client:
                self.email_client.quit()
            
            self.logger.info("Notification agent cleanup completed")
        except Exception as e:
            self.logger.error(f"Error during cleanup: {e}")

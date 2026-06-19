import os
import logging
import requests
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Credentials configuration
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")

SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL", "")
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")


def send_email_alert(recipient: str, subject: str, message_body: str) -> bool:
    """Dispatches alert notifications via SMTP email."""
    if not SMTP_USER or not SMTP_PASS:
        logger.warning(f"[Mock Mail] Sending alert to {recipient}: {subject} | {message_body}")
        return True
        
    try:
        import smtplib
        from email.mime.text import MIMEText
        
        msg = MIMEText(message_body)
        msg['Subject'] = subject
        msg['From'] = SMTP_USER
        msg['To'] = recipient
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)
            
        logger.info(f"Email alert successfully sent to {recipient}")
        return True
    except Exception as e:
        logger.error(f"Failed to dispatch email notification: {e}")
        return False


def send_slack_notification(message: str) -> bool:
    """Dispatches a markdown notification block to a Slack Channel webhook."""
    if not SLACK_WEBHOOK_URL:
        logger.warning(f"[Mock Slack] Alert: {message}")
        return True
        
    try:
        payload = {"text": f"🚨 *ATMOS-WATCH ALERT* 🚨\n{message}"}
        response = requests.post(SLACK_WEBHOOK_URL, json=payload, timeout=5)
        if response.status_code == 200:
            logger.info("Slack alert successfully dispatched.")
            return True
        else:
            logger.error(f"Slack webhook returned code {response.status_code}")
    except Exception as e:
        logger.error(f"Failed to send Slack alert: {e}")
        
    return False


def send_telegram_alert(message: str) -> bool:
    """Sends active warning advice message to a Telegram chat/channel using bot API."""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        logger.warning(f"[Mock Telegram] Channel Message: {message}")
        return True
        
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": f"⚠️ ATMOS-WATCH ALERT ⚠️\n\n{message}",
        "parse_mode": "HTML"
    }
    try:
        response = requests.post(url, json=payload, timeout=5)
        if response.status_code == 200:
            logger.info("Telegram alert sent.")
            return True
    except Exception as e:
        logger.error(f"Failed to dispatch Telegram message: {e}")
        
    return False


def route_atmospheric_alerts(alert_event: Dict[str, Any]) -> None:
    """Determines alert severity and dispatches notifications to appropriate channels."""
    region = alert_event.get("region", "Unknown")
    severity = alert_event.get("severity", "Moderate")
    param = alert_event.get("parameter", "AQI")
    val = alert_event.get("value", 0.0)
    msg = alert_event.get("message", "")
    
    alert_text = f"<b>[{severity}] Threshold Exceeded in {region}</b>\n\nMetric: {param}\nValue: {val}\nDetails: {msg}"
    
    # Broadcast based on severity
    if severity == "Critical":
        # Multi-channel broadcast for critical spikes
        send_telegram_alert(alert_text)
        send_slack_notification(f"*Critical Alert!* {region} - {param} is {val}. {msg}")
        send_email_alert("admin@cpcb.gov.in", f"CRITICAL: {param} Spike in {region}", alert_text)
    elif severity == "Warning":
        send_telegram_alert(alert_text)
        send_slack_notification(f"Warning: {region} - {param} is {val}. {msg}")
    else:
        logger.info(f"Logged moderate alert event for {region}: {param}={val}")

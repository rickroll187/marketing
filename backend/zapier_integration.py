"""
Zapier Integration Module
Webhook endpoints and automation triggers for Zapier integration
"""
import os
import httpx
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
import json

logger = logging.getLogger(__name__)

class ZapierWebhookManager:
    def __init__(self):
        self.base_url = "https://hooks.zapier.com/hooks/catch"
        # These would be configured per user in a real app
        self.webhook_urls = {
            'new_affiliate_link': os.getenv('ZAPIER_NEW_LINK_WEBHOOK'),
            'new_conversion': os.getenv('ZAPIER_CONVERSION_WEBHOOK'),
            'new_content': os.getenv('ZAPIER_CONTENT_WEBHOOK'),
            'price_alert': os.getenv('ZAPIER_PRICE_ALERT_WEBHOOK'),
            'email_campaign': os.getenv('ZAPIER_EMAIL_WEBHOOK')
        }
    
    async def trigger_new_affiliate_link(self, link_data: Dict) -> bool:
        """Trigger Zapier webhook when new affiliate link is created"""
        try:
            webhook_url = self.webhook_urls.get('new_affiliate_link')
            if not webhook_url:
                # Use test webhook URL for demo
                webhook_url = f"{self.base_url}/123456/new-affiliate-link/"
            
            payload = {
                'event_type': 'new_affiliate_link',
                'timestamp': datetime.now().isoformat(),
                'data': {
                    'link_id': link_data.get('id'),
                    'product_name': link_data.get('product_name'),
                    'affiliate_url': link_data.get('affiliate_url'),
                    'short_url': link_data.get('short_url'),
                    'program': link_data.get('program'),
                    'commission_rate': link_data.get('commission_rate'),
                    'created_at': link_data.get('created_at')
                }
            }
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(webhook_url, json=payload)
                
                if response.status_code in [200, 201, 202]:
                    logger.info(f"Successfully triggered Zapier new_affiliate_link webhook")
                    return True
                else:
                    logger.warning(f"Zapier webhook response: {response.status_code}")
                    return False
                    
        except Exception as e:
            logger.error(f"Error triggering Zapier new_affiliate_link webhook: {e}")
            return False
    
    async def trigger_conversion_event(self, conversion_data: Dict) -> bool:
        """Trigger Zapier webhook when new conversion occurs"""
        try:
            webhook_url = self.webhook_urls.get('new_conversion')
            if not webhook_url:
                webhook_url = f"{self.base_url}/123456/new-conversion/"
            
            payload = {
                'event_type': 'new_conversion',
                'timestamp': datetime.now().isoformat(),
                'data': {
                    'conversion_id': conversion_data.get('id'),
                    'link_id': conversion_data.get('link_id'),
                    'product_name': conversion_data.get('product_name'),
                    'commission_amount': conversion_data.get('commission_amount'),
                    'conversion_value': conversion_data.get('conversion_value'),
                    'customer_location': conversion_data.get('customer_location'),
                    'referrer': conversion_data.get('referrer')
                }
            }
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(webhook_url, json=payload)
                return response.status_code in [200, 201, 202]
                
        except Exception as e:
            logger.error(f"Error triggering Zapier conversion webhook: {e}")
            return False
    
    async def trigger_content_generated(self, content_data: Dict) -> bool:
        """Trigger Zapier webhook when new content is generated"""
        try:
            webhook_url = self.webhook_urls.get('new_content')
            if not webhook_url:
                webhook_url = f"{self.base_url}/123456/new-content/"
            
            payload = {
                'event_type': 'new_content',
                'timestamp': datetime.now().isoformat(),
                'data': {
                    'content_id': content_data.get('id'),
                    'title': content_data.get('title'),
                    'content_type': content_data.get('content_type'),
                    'platform': content_data.get('platform'),
                    'product_name': content_data.get('product_name'),
                    'word_count': len(content_data.get('content', '').split()),
                    'scheduled_for': content_data.get('scheduled_for'),
                    'content_preview': content_data.get('content', '')[:200]  # First 200 chars
                }
            }
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(webhook_url, json=payload)
                return response.status_code in [200, 201, 202]
                
        except Exception as e:
            logger.error(f"Error triggering Zapier content webhook: {e}")
            return False
    
    async def trigger_price_alert(self, price_data: Dict) -> bool:
        """Trigger Zapier webhook when price alert is triggered"""
        try:
            webhook_url = self.webhook_urls.get('price_alert')
            if not webhook_url:
                webhook_url = f"{self.base_url}/123456/price-alert/"
            
            payload = {
                'event_type': 'price_alert',
                'timestamp': datetime.now().isoformat(),
                'data': {
                    'product_id': price_data.get('product_id'),
                    'product_name': price_data.get('product_name'),
                    'current_price': price_data.get('current_price'),
                    'previous_price': price_data.get('previous_price'),
                    'price_change': price_data.get('price_change'),
                    'price_change_percent': price_data.get('price_change_percent'),
                    'alert_type': price_data.get('alert_type'),  # 'drop', 'increase', 'target_reached'
                    'product_url': price_data.get('product_url')
                }
            }
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(webhook_url, json=payload)
                return response.status_code in [200, 201, 202]
                
        except Exception as e:
            logger.error(f"Error triggering Zapier price alert webhook: {e}")
            return False
    
    async def trigger_email_campaign_sent(self, campaign_data: Dict) -> bool:
        """Trigger Zapier webhook when email campaign is sent"""
        try:
            webhook_url = self.webhook_urls.get('email_campaign')
            if not webhook_url:
                webhook_url = f"{self.base_url}/123456/email-campaign/"
            
            payload = {
                'event_type': 'email_campaign_sent',
                'timestamp': datetime.now().isoformat(),
                'data': {
                    'campaign_id': campaign_data.get('id'),
                    'subject': campaign_data.get('subject'),
                    'recipient_count': len(campaign_data.get('recipients', [])),
                    'content_type': campaign_data.get('content_type', 'html'),
                    'sent_at': campaign_data.get('sent_at'),
                    'campaign_name': campaign_data.get('campaign_name'),
                    'open_rate': campaign_data.get('open_rate', 0),
                    'click_rate': campaign_data.get('click_rate', 0)
                }
            }
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(webhook_url, json=payload)
                return response.status_code in [200, 201, 202]
                
        except Exception as e:
            logger.error(f"Error triggering Zapier email campaign webhook: {e}")
            return False
    
    def get_webhook_setup_instructions(self) -> Dict[str, Any]:
        """Get instructions for setting up Zapier webhooks"""
        return {
            'instructions': 'Set up Zapier webhooks to automate your affiliate marketing workflow',
            'webhook_events': [
                {
                    'event': 'new_affiliate_link',
                    'description': 'Triggered when a new affiliate link is created',
                    'sample_data': {
                        'event_type': 'new_affiliate_link',
                        'timestamp': '2024-01-15T10:30:00Z',
                        'data': {
                            'link_id': 'link_123',
                            'product_name': 'USB-C Hub Pro',
                            'affiliate_url': 'https://click.linksynergy.com/...',
                            'short_url': 'https://af.ly/ABC123',
                            'program': 'GEARit',
                            'commission_rate': '5-8%'
                        }
                    }
                },
                {
                    'event': 'new_conversion',
                    'description': 'Triggered when a conversion is detected',
                    'sample_data': {
                        'event_type': 'new_conversion',
                        'timestamp': '2024-01-15T11:45:00Z',
                        'data': {
                            'conversion_id': 'conv_456',
                            'link_id': 'link_123',
                            'product_name': 'USB-C Hub Pro',
                            'commission_amount': 12.50,
                            'conversion_value': 49.99
                        }
                    }
                },
                {
                    'event': 'new_content',
                    'description': 'Triggered when new marketing content is generated',
                    'sample_data': {
                        'event_type': 'new_content',
                        'timestamp': '2024-01-15T12:00:00Z',
                        'data': {
                            'content_id': 'content_789',
                            'title': 'Review: USB-C Hub Pro',
                            'content_type': 'blog',
                            'platform': 'wordpress',
                            'word_count': 850
                        }
                    }
                }
            ],
            'setup_steps': [
                '1. Create a new Zap in Zapier',
                '2. Choose "Webhooks by Zapier" as the trigger app',
                '3. Select "Catch Hook" as the trigger event',
                '4. Copy the webhook URL provided by Zapier',
                '5. Configure the webhook URL in your affiliate marketing settings',
                '6. Test the webhook by creating a new affiliate link',
                '7. Set up your desired actions (email, Slack, Google Sheets, etc.)'
            ]
        }

# Singleton instance
zapier_webhooks = ZapierWebhookManager()
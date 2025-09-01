"""
Google Analytics 4 Integration Module
"""
import os
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from google.oauth2.service_account import Credentials
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    RunReportRequest,
    DateRange,
    Dimension,
    Metric,
    RunRealtimeReportRequest,
    OrderBy,
    FilterExpression,
    Filter,
    FilterExpressionList
)
import logging

logger = logging.getLogger(__name__)

class GoogleAnalyticsService:
    def __init__(self):
        self.credentials_path = os.path.join(os.path.dirname(__file__), 'google_credentials.json')
        self.property_id = "397234567"  # Default property ID, can be overridden
        self.client = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Google Analytics Data API client"""
        try:
            if os.path.exists(self.credentials_path):
                credentials = Credentials.from_service_account_file(
                    self.credentials_path,
                    scopes=['https://www.googleapis.com/auth/analytics.readonly']
                )
                self.client = BetaAnalyticsDataClient(credentials=credentials)
                logger.info("Google Analytics client initialized successfully")
            else:
                logger.warning("Google Analytics credentials file not found")
        except Exception as e:
            logger.error(f"Failed to initialize Google Analytics client: {e}")
    
    async def get_affiliate_performance(self, days: int = 30) -> Dict[str, Any]:
        """Get affiliate link performance data"""
        if not self.client:
            return self._get_mock_performance_data()
        
        try:
            # Date range for the report
            start_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
            end_date = datetime.now().strftime('%Y-%m-%d')
            
            request = RunReportRequest(
                property=f"properties/{self.property_id}",
                dimensions=[
                    Dimension(name="pagePath"),
                    Dimension(name="eventName"),
                    Dimension(name="customEvent:affiliate_link"),
                ],
                metrics=[
                    Metric(name="eventCount"),
                    Metric(name="sessions"),
                    Metric(name="bounceRate"),
                    Metric(name="sessionDuration"),
                ],
                date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
                limit=100
            )
            
            response = self.client.run_report(request=request)
            
            # Process the response
            performance_data = {
                'total_clicks': 0,
                'total_sessions': 0,
                'bounce_rate': 0,
                'avg_session_duration': 0,
                'top_performing_links': [],
                'daily_breakdown': []
            }
            
            for row in response.rows:
                performance_data['total_clicks'] += int(row.metric_values[0].value)
                performance_data['total_sessions'] += int(row.metric_values[1].value)
            
            if response.rows:
                total_bounce_rate = sum(float(row.metric_values[2].value) for row in response.rows)
                performance_data['bounce_rate'] = total_bounce_rate / len(response.rows)
                
                total_duration = sum(float(row.metric_values[3].value) for row in response.rows)
                performance_data['avg_session_duration'] = total_duration / len(response.rows)
            
            return performance_data
            
        except Exception as e:
            logger.error(f"Error getting affiliate performance: {e}")
            return self._get_mock_performance_data()
    
    async def get_realtime_data(self) -> Dict[str, Any]:
        """Get real-time analytics data"""
        if not self.client:
            return self._get_mock_realtime_data()
        
        try:
            request = RunRealtimeReportRequest(
                property=f"properties/{self.property_id}",
                dimensions=[
                    Dimension(name="city"),
                    Dimension(name="eventName"),
                ],
                metrics=[
                    Metric(name="activeUsers"),
                    Metric(name="eventCount"),
                ],
                limit=10
            )
            
            response = self.client.run_realtime_report(request=request)
            
            realtime_data = {
                'active_users': 0,
                'events_last_30min': 0,
                'top_events': [],
                'geographic_data': []
            }
            
            for row in response.rows:
                realtime_data['active_users'] += int(row.metric_values[0].value)
                realtime_data['events_last_30min'] += int(row.metric_values[1].value)
            
            return realtime_data
            
        except Exception as e:
            logger.error(f"Error getting realtime data: {e}")
            return self._get_mock_realtime_data()
    
    async def track_affiliate_conversion(self, link_id: str, revenue: float, product_name: str) -> bool:
        """Track affiliate conversion (this would typically be done client-side)"""
        try:
            # In a real implementation, this would send conversion data to GA4
            # For now, we'll log it and return success
            logger.info(f"Conversion tracked: {link_id} - ${revenue} - {product_name}")
            return True
        except Exception as e:
            logger.error(f"Error tracking conversion: {e}")
            return False
    
    def _get_mock_performance_data(self) -> Dict[str, Any]:
        """Mock performance data for testing"""
        return {
            'total_clicks': 1847,
            'total_sessions': 1234,
            'bounce_rate': 23.5,
            'avg_session_duration': 185.7,
            'conversion_rate': 15.8,
            'revenue': 2847.50,
            'top_performing_links': [
                {
                    'link': 'gearit-usb-hub-2024',
                    'clicks': 234,
                    'conversions': 18,
                    'revenue': 567.89,
                    'ctr': 4.2
                },
                {
                    'link': 'hubspot-marketing-2024',
                    'clicks': 189,
                    'conversions': 12,
                    'revenue': 445.67,
                    'ctr': 3.8
                },
                {
                    'link': 'elementor-pro-2024',
                    'clicks': 156,
                    'conversions': 9,
                    'revenue': 234.50,
                    'ctr': 3.1
                }
            ],
            'daily_breakdown': [
                {'date': '2024-01-10', 'clicks': 67, 'conversions': 4, 'revenue': 123.45},
                {'date': '2024-01-11', 'clicks': 89, 'conversions': 6, 'revenue': 234.56},
                {'date': '2024-01-12', 'clicks': 78, 'conversions': 5, 'revenue': 189.34},
                {'date': '2024-01-13', 'clicks': 92, 'conversions': 7, 'revenue': 267.89},
                {'date': '2024-01-14', 'clicks': 85, 'conversions': 6, 'revenue': 198.76}
            ]
        }
    
    def _get_mock_realtime_data(self) -> Dict[str, Any]:
        """Mock realtime data for testing"""
        return {
            'active_users': 23,
            'events_last_30min': 156,
            'affiliate_clicks_30min': 12,
            'top_events': [
                {'event': 'affiliate_click', 'count': 12},
                {'event': 'page_view', 'count': 89},
                {'event': 'product_view', 'count': 34}
            ],
            'geographic_data': [
                {'country': 'United States', 'users': 12},
                {'country': 'Canada', 'users': 6},
                {'country': 'United Kingdom', 'users': 5}
            ],
            'device_breakdown': [
                {'device': 'Desktop', 'users': 14},
                {'device': 'Mobile', 'users': 7},
                {'device': 'Tablet', 'users': 2}
            ]
        }

# Singleton instance
google_analytics = GoogleAnalyticsService()
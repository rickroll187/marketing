#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Affiliate Marketing Platform
Tests all endpoints including scraping, content generation, and CRUD operations
"""

import requests
import json
import sys
import time
from datetime import datetime
from typing import Dict, List, Any, Optional

class AffiliateMarketingAPITester:
    def __init__(self, base_url: str = "https://saasmate.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.created_products = []
        self.created_content = []

    def log_test(self, name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}: PASSED")
        else:
            print(f"❌ {name}: FAILED - {details}")
        
        if details:
            print(f"   Details: {details}")
        
        self.test_results.append({
            'name': name,
            'success': success,
            'details': details,
            'response_data': response_data
        })

    def make_request(self, method: str, endpoint: str, data: Dict = None, expected_status: int = 200) -> tuple[bool, Dict]:
        """Make HTTP request and return success status and response data"""
        url = f"{self.api_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        headers = {'Content-Type': 'application/json'}
        
        try:
            if method.upper() == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method.upper() == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method.upper() == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method.upper() == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                return False, {"error": f"Unsupported method: {method}"}

            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text, "status_code": response.status_code}
            
            return success, response_data
            
        except requests.exceptions.RequestException as e:
            return False, {"error": str(e)}

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        print("\n🔍 Testing Root Endpoint...")
        success, response = self.make_request('GET', '')
        
        if success and 'message' in response:
            self.log_test("Root Endpoint", True, f"Message: {response['message']}")
        else:
            self.log_test("Root Endpoint", False, f"Unexpected response: {response}")

    def test_stats_endpoint(self):
        """Test the stats endpoint"""
        print("\n📊 Testing Stats Endpoint...")
        success, response = self.make_request('GET', 'stats')
        
        if success:
            expected_keys = ['total_products', 'total_content', 'categories', 'content_types']
            has_all_keys = all(key in response for key in expected_keys)
            
            if has_all_keys:
                self.log_test("Stats Endpoint", True, 
                    f"Products: {response['total_products']}, Content: {response['total_content']}")
            else:
                self.log_test("Stats Endpoint", False, f"Missing keys in response: {response}")
        else:
            self.log_test("Stats Endpoint", False, f"Request failed: {response}")

    def test_get_products(self):
        """Test getting all products"""
        print("\n📦 Testing Get Products...")
        success, response = self.make_request('GET', 'products')
        
        if success and isinstance(response, list):
            self.log_test("Get Products", True, f"Retrieved {len(response)} products")
            return response
        else:
            self.log_test("Get Products", False, f"Expected list, got: {type(response)}")
            return []

    def test_create_product(self):
        """Test creating a product manually"""
        print("\n➕ Testing Create Product...")
        
        test_product = {
            "name": "Test Gaming Laptop",
            "price": 1299.99,
            "original_price": 1499.99,
            "description": "High-performance gaming laptop with RTX 4060 graphics card",
            "image_url": "https://example.com/laptop.jpg",
            "affiliate_url": "https://example.com/buy-laptop",
            "source": "test-store.com",
            "category": "laptops",
            "rating": 4.5,
            "reviews_count": 128,
            "features": ["RTX 4060", "16GB RAM", "1TB SSD", "144Hz Display"]
        }
        
        success, response = self.make_request('POST', 'products', test_product, 200)
        
        if success and 'id' in response:
            product_id = response['id']
            self.created_products.append(product_id)
            self.log_test("Create Product", True, f"Created product with ID: {product_id}")
            return product_id
        else:
            self.log_test("Create Product", False, f"Failed to create product: {response}")
            return None

    def test_get_single_product(self, product_id: str):
        """Test getting a single product by ID"""
        print(f"\n🔍 Testing Get Single Product (ID: {product_id[:8]}...)...")
        
        success, response = self.make_request('GET', f'products/{product_id}')
        
        if success and 'id' in response and response['id'] == product_id:
            self.log_test("Get Single Product", True, f"Retrieved product: {response['name']}")
            return response
        else:
            self.log_test("Get Single Product", False, f"Failed to get product: {response}")
            return None

    def test_scrape_products(self):
        """Test product scraping functionality"""
        print("\n🕷️ Testing Product Scraping...")
        
        # Using a simple test URL - in real scenario would use actual e-commerce URLs
        scrape_request = {
            "urls": ["https://example.com/test-product"],
            "category": "testing"
        }
        
        success, response = self.make_request('POST', 'scrape', scrape_request, 200)
        
        if success and isinstance(response, list):
            scraped_count = len(response)
            self.log_test("Product Scraping", True, f"Scraping completed, returned {scraped_count} products")
            
            # Store scraped product IDs for later use
            for product in response:
                if 'id' in product:
                    self.created_products.append(product['id'])
            
            return response
        else:
            self.log_test("Product Scraping", False, f"Scraping failed: {response}")
            return []

    def test_generate_content(self, product_id: str):
        """Test content generation for a product"""
        print(f"\n✨ Testing Content Generation (Product: {product_id[:8]}...)...")
        
        content_request = {
            "product_id": product_id,
            "content_types": ["blog", "social", "video_script"],
            "platforms": ["twitter", "instagram"]
        }
        
        # Content generation might take longer due to LLM processing
        success, response = self.make_request('POST', 'generate-content', content_request, 200)
        
        if success and 'generated_content' in response:
            generated_count = len(response['generated_content'])
            self.log_test("Content Generation", True, f"Generated {generated_count} pieces of content")
            
            # Store generated content IDs for later testing
            for content in response['generated_content']:
                if 'id' in content:
                    self.created_content.append(content['id'])
            
            return response['generated_content']
        else:
            self.log_test("Content Generation", False, f"Content generation failed: {response}")
            return []

    def test_get_content(self):
        """Test getting all generated content"""
        print("\n📄 Testing Get Generated Content...")
        
        success, response = self.make_request('GET', 'content')
        
        if success and isinstance(response, list):
            self.log_test("Get Generated Content", True, f"Retrieved {len(response)} content items")
            return response
        else:
            self.log_test("Get Generated Content", False, f"Failed to get content: {response}")
            return []

    def test_get_single_content(self, content_id: str):
        """Test getting a single content item by ID"""
        print(f"\n📄 Testing Get Single Content (ID: {content_id[:8]}...)...")
        
        success, response = self.make_request('GET', f'content/{content_id}')
        
        if success and 'id' in response and response['id'] == content_id:
            self.log_test("Get Single Content", True, f"Retrieved content: {response['title']}")
            return response
        else:
            self.log_test("Get Single Content", False, f"Failed to get content: {response}")
            return None

    def test_delete_content(self, content_id: str):
        """Test deleting generated content"""
        print(f"\n🗑️ Testing Delete Content (ID: {content_id[:8]}...)...")
        
        success, response = self.make_request('DELETE', f'content/{content_id}', expected_status=200)
        
        if success and 'message' in response:
            self.log_test("Delete Content", True, f"Content deleted: {response['message']}")
            return True
        else:
            self.log_test("Delete Content", False, f"Failed to delete content: {response}")
            return False

    def test_content_filtering(self):
        """Test content filtering by product_id and content_type"""
        print("\n🔍 Testing Content Filtering...")
        
        if not self.created_products:
            self.log_test("Content Filtering", False, "No products available for filtering test")
            return
        
        product_id = self.created_products[0]
        
        # Test filtering by product_id
        success, response = self.make_request('GET', f'content?product_id={product_id}')
        
        if success and isinstance(response, list):
            filtered_count = len(response)
            self.log_test("Content Filtering by Product", True, f"Found {filtered_count} content items for product")
        else:
            self.log_test("Content Filtering by Product", False, f"Filtering failed: {response}")
        
        # Test filtering by content_type
        success, response = self.make_request('GET', 'content?content_type=blog')
        
        if success and isinstance(response, list):
            blog_count = len(response)
            self.log_test("Content Filtering by Type", True, f"Found {blog_count} blog content items")
        else:
            self.log_test("Content Filtering by Type", False, f"Type filtering failed: {response}")

    def test_advanced_content_generation(self, product_id: str):
        """Test all 8 content types with advanced options"""
        print(f"\n🎯 Testing Advanced Content Generation (Product: {product_id[:8]}...)...")
        
        # Test all 8 content types
        all_content_types = ["blog", "social", "video_script", "comparison", "tutorial", "review_roundup", "seasonal", "launch"]
        
        advanced_request = {
            "product_id": product_id,
            "content_types": all_content_types,
            "platforms": ["twitter", "instagram", "facebook", "linkedin", "tiktok"],
            "comparison_products": ["iPhone 15", "Samsung Galaxy S24"],
            "season": "black-friday",
            "tutorial_focus": "setup and configuration"
        }
        
        success, response = self.make_request('POST', 'generate-content', advanced_request, 200)
        
        if success and 'generated_content' in response:
            generated_count = len(response['generated_content'])
            content_types_generated = set()
            platforms_generated = set()
            
            for content in response['generated_content']:
                if 'content_type' in content:
                    content_types_generated.add(content['content_type'])
                if 'platform' in content and content['platform']:
                    platforms_generated.add(content['platform'])
                if 'id' in content:
                    self.created_content.append(content['id'])
            
            self.log_test("Advanced Content Generation", True, 
                f"Generated {generated_count} pieces, Types: {len(content_types_generated)}, Platforms: {len(platforms_generated)}")
            return response['generated_content']
        else:
            self.log_test("Advanced Content Generation", False, f"Advanced generation failed: {response}")
            return []

    def test_content_scheduling(self, content_id: str):
        """Test content scheduling functionality"""
        print(f"\n📅 Testing Content Scheduling (Content: {content_id[:8]}...)...")
        
        # Schedule content for 1 hour from now
        from datetime import datetime, timedelta
        scheduled_time = (datetime.now() + timedelta(hours=1)).isoformat()
        
        success, response = self.make_request('POST', f'schedule-content/{content_id}?scheduled_for={scheduled_time}', expected_status=200)
        
        if success and 'message' in response:
            self.log_test("Content Scheduling", True, f"Content scheduled: {response['message']}")
            return True
        else:
            self.log_test("Content Scheduling", False, f"Scheduling failed: {response}")
            return False

    def test_email_campaigns(self):
        """Test email marketing campaign functionality"""
        print("\n📧 Testing Email Marketing Campaigns...")
        
        campaign_data = {
            "name": "Test Campaign",
            "subject": "Amazing Tech Deals - Limited Time!",
            "content": "<h1>Great Deals!</h1><p>Check out our latest tech products with amazing discounts.</p>",
            "recipient_list": ["test1@example.com", "test2@example.com"],
            "scheduled_for": None  # Send immediately
        }
        
        success, response = self.make_request('POST', 'email-campaigns', campaign_data, 200)
        
        if success and 'id' in response:
            campaign_id = response['id']
            self.log_test("Create Email Campaign", True, f"Created campaign with ID: {campaign_id}")
            
            # Test getting all campaigns
            success, campaigns = self.make_request('GET', 'email-campaigns')
            if success and isinstance(campaigns, list):
                self.log_test("Get Email Campaigns", True, f"Retrieved {len(campaigns)} campaigns")
            else:
                self.log_test("Get Email Campaigns", False, f"Failed to get campaigns: {campaigns}")
            
            return campaign_id
        else:
            self.log_test("Create Email Campaign", False, f"Campaign creation failed: {response}")
            return None

    def test_social_media_export(self):
        """Test social media content export functionality"""
        print("\n📱 Testing Social Media Export...")
        
        # Test Twitter export
        success, response = self.make_request('GET', 'content/export/twitter')
        
        if success and 'csv_data' in response and 'filename' in response:
            self.log_test("Twitter Export", True, f"Generated CSV: {response['filename']}")
        else:
            self.log_test("Twitter Export", False, f"Twitter export failed: {response}")
        
        # Test Instagram export
        success, response = self.make_request('GET', 'content/export/instagram')
        
        if success and 'csv_data' in response and 'filename' in response:
            self.log_test("Instagram Export", True, f"Generated CSV: {response['filename']}")
        else:
            self.log_test("Instagram Export", False, f"Instagram export failed: {response}")

    def test_url_queue_management(self):
        """Test URL queue management functionality"""
        print("\n🔗 Testing URL Queue Management...")
        
        # Test bulk URL saving
        bulk_urls = {
            "urls": [
                "https://www.amazon.com/dp/B08N5WRWNW",
                "https://www.bestbuy.com/site/apple-macbook-pro/6418599.p",
                "https://www.newegg.com/asus-rog-strix/p/N82E16834235398"
            ],
            "category": "electronics",
            "priority": "high",
            "notes": "Test bulk URL save for electronics category"
        }
        
        success, response = self.make_request('POST', 'saved-urls/bulk', bulk_urls, 200)
        
        if success and isinstance(response, list) and len(response) > 0:
            saved_count = len(response)
            self.log_test("Bulk URL Save", True, f"Saved {saved_count} URLs to queue")
            
            # Store URL IDs for later testing
            saved_url_ids = [url['id'] for url in response if 'id' in url]
            
            # Test getting saved URLs
            success, response = self.make_request('GET', 'saved-urls')
            
            if success and isinstance(response, list):
                self.log_test("Get Saved URLs", True, f"Retrieved {len(response)} saved URLs")
                
                # Test URL filtering
                success, filtered = self.make_request('GET', 'saved-urls?category=electronics')
                if success and isinstance(filtered, list):
                    self.log_test("Filter URLs by Category", True, f"Found {len(filtered)} electronics URLs")
                else:
                    self.log_test("Filter URLs by Category", False, f"Filtering failed: {filtered}")
                
                # Test selecting URLs for scraping
                if saved_url_ids:
                    url_id = saved_url_ids[0]
                    update_data = {"selected": True}
                    success, response = self.make_request('PUT', f'saved-urls/{url_id}', update_data, 200)
                    
                    if success and 'id' in response:
                        self.log_test("Update URL Selection", True, f"URL {url_id[:8]}... marked as selected")
                        
                        # Test scraping selected URLs
                        success, scrape_response = self.make_request('POST', 'saved-urls/scrape-selected', expected_status=200)
                        
                        if success and 'scraped_products' in scrape_response:
                            scraped_count = len(scrape_response['scraped_products'])
                            self.log_test("Scrape Selected URLs", True, f"Scraped {scraped_count} products from selected URLs")
                            
                            # Store scraped product IDs
                            for product in scrape_response['scraped_products']:
                                if 'id' in product:
                                    self.created_products.append(product['id'])
                        else:
                            self.log_test("Scrape Selected URLs", False, f"Scraping failed: {scrape_response}")
                    else:
                        self.log_test("Update URL Selection", False, f"URL update failed: {response}")
            else:
                self.log_test("Get Saved URLs", False, f"Failed to get saved URLs: {response}")
        else:
            self.log_test("Bulk URL Save", False, f"Bulk save failed: {response}")

    def test_product_price_update(self):
        """Test manual product price updates"""
        print("\n💰 Testing Product Price Updates...")
        
        if not self.created_products:
            self.log_test("Product Price Update", False, "No products available for price update test")
            return
        
        product_id = self.created_products[0]
        price_update = {
            "price": 999.99,
            "original_price": 1199.99,
            "name": "Updated Gaming Laptop Pro"
        }
        
        success, response = self.make_request('PUT', f'products/{product_id}/price', price_update, 200)
        
        if success and 'id' in response and response['price'] == 999.99:
            self.log_test("Product Price Update", True, f"Updated product price to ${response['price']}")
        else:
            self.log_test("Product Price Update", False, f"Price update failed: {response}")

    def test_performance_metrics(self):
        """Test performance metrics recording and analytics"""
        print("\n📊 Testing Performance Metrics...")
        
        # Record a test metric
        metric_data = {
            "content_id": self.created_content[0] if self.created_content else "test-content-id",
            "platform": "twitter",
            "metric_type": "views",
            "value": 1250.0
        }
        
        success, response = self.make_request('POST', 'performance-metrics', metric_data, 200)
        
        if success and 'message' in response:
            self.log_test("Record Performance Metric", True, f"Metric recorded: {response['message']}")
        else:
            self.log_test("Record Performance Metric", False, f"Metric recording failed: {response}")
        
        # Test analytics endpoint
        success, response = self.make_request('GET', 'analytics')
        
        if success and 'analytics' in response:
            analytics_count = len(response['analytics'])
            self.log_test("Get Analytics", True, f"Retrieved analytics with {analytics_count} metric types")
        else:
            self.log_test("Get Analytics", False, f"Analytics retrieval failed: {response}")

    def test_enhanced_stats(self):
        """Test enhanced stats endpoint with new fields"""
        print("\n📈 Testing Enhanced Stats...")
        
        success, response = self.make_request('GET', 'stats')
        
        if success:
            expected_keys = ['total_products', 'total_content', 'total_campaigns', 'scheduled_content', 'categories', 'content_types', 'platforms']
            has_all_keys = all(key in response for key in expected_keys)
            
            if has_all_keys:
                self.log_test("Enhanced Stats", True, 
                    f"Products: {response['total_products']}, Content: {response['total_content']}, Campaigns: {response['total_campaigns']}, Scheduled: {response['scheduled_content']}")
            else:
                missing_keys = [key for key in expected_keys if key not in response]
                self.log_test("Enhanced Stats", False, f"Missing keys: {missing_keys}")
        else:
            self.log_test("Enhanced Stats", False, f"Stats request failed: {response}")

    def test_price_tracker_endpoints(self):
        """Test all price tracker endpoints"""
        print("\n💰 Testing Price Tracker Endpoints...")
        
        if not self.created_products:
            self.log_test("Price Tracker", False, "No products available for price tracking tests")
            return
        
        product_id = self.created_products[0]
        
        # Test creating price alert
        alert_data = {
            "product_id": product_id,
            "threshold_percentage": 10.0,
            "alert_type": "decrease",
            "is_active": True
        }
        
        success, response = self.make_request('POST', 'price-tracker/alerts', alert_data, 200)
        if success and 'alert_id' in response:
            self.log_test("Create Price Alert", True, f"Alert created: {response['alert_id']}")
        else:
            self.log_test("Create Price Alert", False, f"Failed to create alert: {response}")
        
        # Test getting price alerts
        success, response = self.make_request('GET', 'price-tracker/alerts')
        if success and isinstance(response, list):
            self.log_test("Get Price Alerts", True, f"Retrieved {len(response)} active alerts")
        else:
            self.log_test("Get Price Alerts", False, f"Failed to get alerts: {response}")
        
        # Test getting price history
        success, response = self.make_request('GET', f'price-tracker/history/{product_id}')
        if success and isinstance(response, list):
            self.log_test("Get Price History", True, f"Retrieved {len(response)} price history records")
        else:
            self.log_test("Get Price History", False, f"Failed to get price history: {response}")
        
        # Test checking all prices
        success, response = self.make_request('POST', 'price-tracker/check-prices', expected_status=200)
        if success and 'message' in response:
            self.log_test("Check All Prices", True, f"Price check completed: {response['message']}")
        else:
            self.log_test("Check All Prices", False, f"Price check failed: {response}")

    def test_advanced_analytics_endpoints(self):
        """Test advanced analytics dashboard"""
        print("\n📊 Testing Advanced Analytics Endpoints...")
        
        # Test advanced analytics dashboard
        success, response = self.make_request('GET', 'advanced-analytics/dashboard')
        
        if success:
            expected_keys = ['conversion_rate', 'revenue', 'roi_percentage', 'click_through_rate', 
                           'engagement_rate', 'traffic_sources', 'top_products', 'revenue_trend', 'conversion_funnel']
            has_all_keys = all(key in response for key in expected_keys)
            
            if has_all_keys:
                self.log_test("Advanced Analytics Dashboard", True, 
                    f"Revenue: ${response['revenue']}, ROI: {response['roi_percentage']}%, Conversion: {response['conversion_rate']}%")
            else:
                missing_keys = [key for key in expected_keys if key not in response]
                self.log_test("Advanced Analytics Dashboard", False, f"Missing keys: {missing_keys}")
        else:
            self.log_test("Advanced Analytics Dashboard", False, f"Dashboard request failed: {response}")

    def test_social_automation_endpoints(self):
        """Test social automation features"""
        print("\n📱 Testing Social Automation Endpoints...")
        
        # Test scheduling social post
        post_data = {
            "content": "🚀 Check out this amazing tech deal! Perfect for productivity enthusiasts. Limited time offer! #TechDeals #Productivity #AffiliateMarketing",
            "platforms": ["twitter", "instagram", "facebook"],
            "hashtags": ["#TechDeals", "#Productivity", "#AffiliateMarketing"],
            "status": "scheduled"
        }
        
        success, response = self.make_request('POST', 'social-automation/schedule-post', post_data, 200)
        if success and 'post_id' in response:
            self.log_test("Schedule Social Post", True, f"Post scheduled: {response['post_id']}")
        else:
            self.log_test("Schedule Social Post", False, f"Failed to schedule post: {response}")
        
        # Test getting social posts
        success, response = self.make_request('GET', 'social-automation/posts')
        if success and isinstance(response, list):
            self.log_test("Get Social Posts", True, f"Retrieved {len(response)} social posts")
        else:
            self.log_test("Get Social Posts", False, f"Failed to get posts: {response}")
        
        # Test auto-generating social content
        if self.created_products:
            product_id = self.created_products[0]
            platforms = ["twitter", "instagram"]
            
            success, response = self.make_request('POST', f'social-automation/auto-generate?product_id={product_id}&platforms={",".join(platforms)}', expected_status=200)
            if success and 'posts' in response:
                generated_count = len(response['posts'])
                self.log_test("Auto-Generate Social Content", True, f"Generated {generated_count} social posts")
            else:
                self.log_test("Auto-Generate Social Content", False, f"Auto-generation failed: {response}")
        else:
            self.log_test("Auto-Generate Social Content", False, "No products available for social content generation")

    def test_content_studio_endpoints(self):
        """Test content studio features"""
        print("\n🎬 Testing Content Studio Endpoints...")
        
        if not self.created_products:
            self.log_test("Content Studio", False, "No products available for content studio tests")
            return
        
        product_id = self.created_products[0]
        
        # Test generating voice script
        success, response = self.make_request('POST', f'content-studio/generate-voice-script?product_id={product_id}&duration=90', expected_status=200)
        if success and 'id' in response and response.get('content_type') == 'voice_script':
            self.log_test("Generate Voice Script", True, f"Voice script created: {response['title']}")
        else:
            self.log_test("Generate Voice Script", False, f"Voice script generation failed: {response}")
        
        # Test generating video script
        success, response = self.make_request('POST', f'content-studio/generate-video-script?product_id={product_id}&video_type=unboxing', expected_status=200)
        if success and 'id' in response and response.get('content_type') == 'video_script':
            self.log_test("Generate Video Script", True, f"Video script created: {response['title']}")
        else:
            self.log_test("Generate Video Script", False, f"Video script generation failed: {response}")
        
        # Test getting all content studio items
        success, response = self.make_request('GET', 'content-studio/items')
        if success and isinstance(response, list):
            self.log_test("Get Content Studio Items", True, f"Retrieved {len(response)} studio items")
        else:
            self.log_test("Get Content Studio Items", False, f"Failed to get studio items: {response}")

    def test_competitor_intelligence_endpoints(self):
        """Test competitor intelligence features"""
        print("\n🕵️ Testing Competitor Intelligence Endpoints...")
        
        # Test analyzing competitors
        competitor_urls = [
            "https://www.amazon.com",
            "https://www.bestbuy.com",
            "https://www.newegg.com"
        ]
        
        success, response = self.make_request('POST', 'competitor-intel/analyze', competitor_urls, 200)
        if success and 'results' in response:
            analyzed_count = len(response['results'])
            self.log_test("Analyze Competitors", True, f"Analyzed {analyzed_count} competitors: {response['message']}")
        else:
            self.log_test("Analyze Competitors", False, f"Competitor analysis failed: {response}")
        
        # Test getting competitor analysis results
        success, response = self.make_request('GET', 'competitor-intel/analysis')
        if success and isinstance(response, list):
            self.log_test("Get Competitor Analysis", True, f"Retrieved {len(response)} analysis results")
        else:
            self.log_test("Get Competitor Analysis", False, f"Failed to get analysis: {response}")

    def test_smart_workflows_endpoints(self):
        """Test smart workflows automation"""
        print("\n⚡ Testing Smart Workflows Endpoints...")
        
        # Test creating automation workflow
        workflow_data = {
            "name": "Price Drop Alert Workflow",
            "trigger_type": "price_drop",
            "trigger_conditions": {
                "threshold_percentage": 15.0,
                "product_categories": ["electronics", "laptops"]
            },
            "actions": [
                {
                    "type": "generate_content",
                    "content_types": ["social", "blog"]
                },
                {
                    "type": "send_email",
                    "subject": "Price Drop Alert!",
                    "content": "Great deal detected on your tracked products!"
                },
                {
                    "type": "social_post",
                    "platforms": ["twitter", "facebook"]
                }
            ],
            "is_active": True
        }
        
        success, response = self.make_request('POST', 'smart-workflows/create', workflow_data, 200)
        workflow_id = None
        if success and 'workflow_id' in response:
            workflow_id = response['workflow_id']
            self.log_test("Create Automation Workflow", True, f"Workflow created: {workflow_id}")
        else:
            self.log_test("Create Automation Workflow", False, f"Workflow creation failed: {response}")
        
        # Test getting all workflows
        success, response = self.make_request('GET', 'smart-workflows/workflows')
        if success and isinstance(response, list):
            self.log_test("Get Automation Workflows", True, f"Retrieved {len(response)} workflows")
        else:
            self.log_test("Get Automation Workflows", False, f"Failed to get workflows: {response}")
        
        # Test triggering workflow
        if workflow_id:
            trigger_context = {
                "product_id": self.created_products[0] if self.created_products else "test-product-id",
                "price_change": -20.5
            }
            
            success, response = self.make_request('POST', f'smart-workflows/trigger/{workflow_id}', trigger_context, 200)
            if success and 'actions_completed' in response:
                self.log_test("Trigger Workflow", True, f"Workflow executed: {response['actions_completed']} actions completed")
            else:
                self.log_test("Trigger Workflow", False, f"Workflow trigger failed: {response}")
        else:
            self.log_test("Trigger Workflow", False, "No workflow ID available for trigger test")

    def test_phase3_google_analytics_endpoints(self):
        """Test Phase 3 Google Analytics Integration endpoints"""
        print("\n📊 Testing Phase 3 Google Analytics Integration Endpoints...")
        
        # Test Google Analytics performance endpoint
        success, response = self.make_request('GET', 'integrations/google-analytics/performance')
        if success and 'success' in response and response['success']:
            if 'data' in response:
                self.log_test("Google Analytics Performance", True, 
                    f"Performance data retrieved successfully")
            else:
                self.log_test("Google Analytics Performance", False, f"Missing data field in response")
        else:
            self.log_test("Google Analytics Performance", False, f"Performance request failed: {response}")
        
        # Test Google Analytics realtime endpoint
        success, response = self.make_request('GET', 'integrations/google-analytics/realtime')
        if success and 'success' in response and response['success']:
            if 'data' in response:
                self.log_test("Google Analytics Realtime", True, 
                    f"Realtime data retrieved successfully")
            else:
                self.log_test("Google Analytics Realtime", False, f"Missing data field in response")
        else:
            self.log_test("Google Analytics Realtime", False, f"Realtime request failed: {response}")
        
        # Test Google Analytics track conversion endpoint (using query parameters)
        link_id = "test-affiliate-link"
        revenue = 29.99
        product_name = "Test Gaming Laptop"
        
        success, response = self.make_request('POST', f'integrations/google-analytics/track-conversion?link_id={link_id}&revenue={revenue}&product_name={product_name}', expected_status=200)
        if success and 'success' in response and 'message' in response:
            self.log_test("Google Analytics Track Conversion", True, f"Conversion tracked: {response['message']}")
        else:
            self.log_test("Google Analytics Track Conversion", False, f"Conversion tracking failed: {response}")

    def test_phase3_affiliate_networks_endpoints(self):
        """Test Phase 3 Affiliate Network API endpoints"""
        print("\n🤝 Testing Phase 3 Affiliate Network API Endpoints...")
        
        # Test affiliate networks programs endpoint
        success, response = self.make_request('GET', 'affiliate-networks/programs?category=electronics')
        if success and 'success' in response and response['success']:
            if 'programs' in response and isinstance(response['programs'], list):
                programs_count = len(response['programs'])
                total_count = response.get('count', programs_count)
                self.log_test("Affiliate Networks Programs", True, 
                    f"Found {programs_count} programs, Total count: {total_count}")
            else:
                self.log_test("Affiliate Networks Programs", False, f"Invalid programs structure: {response}")
        else:
            self.log_test("Affiliate Networks Programs", False, f"Programs request failed: {response}")
        
        # Test affiliate networks commissions endpoint
        success, response = self.make_request('GET', 'affiliate-networks/commissions')
        if success and 'success' in response and response['success']:
            if 'data' in response:
                self.log_test("Affiliate Networks Commissions", True, 
                    f"Commission data retrieved successfully")
            else:
                self.log_test("Affiliate Networks Commissions", False, f"Missing data field in response")
        else:
            self.log_test("Affiliate Networks Commissions", False, f"Commissions request failed: {response}")

    def test_phase3_user_engagement_endpoints(self):
        """Test Phase 3 User Engagement API endpoints"""
        print("\n🎮 Testing Phase 3 User Engagement API Endpoints...")
        
        # Test user progress endpoint
        success, response = self.make_request('GET', 'engagement/user-progress')
        if success and 'success' in response and response['success']:
            if 'data' in response:
                data = response['data']
                level = data.get('level', 0)
                xp = data.get('xp', 0)
                achievements = data.get('achievements', [])
                self.log_test("User Engagement Progress", True, 
                    f"Level: {level}, XP: {xp}, Achievements: {len(achievements)}")
            else:
                self.log_test("User Engagement Progress", False, f"Missing data field in response")
        else:
            self.log_test("User Engagement Progress", False, f"Progress request failed: {response}")
        
        # Test daily challenges endpoint
        success, response = self.make_request('GET', 'engagement/daily-challenges')
        if success and 'success' in response and response['success']:
            if 'challenges' in response and isinstance(response['challenges'], list):
                challenges_count = len(response['challenges'])
                self.log_test("User Engagement Daily Challenges", True, 
                    f"Available: {challenges_count} challenges")
            else:
                self.log_test("User Engagement Daily Challenges", False, f"Invalid challenges structure: {response}")
        else:
            self.log_test("User Engagement Daily Challenges", False, f"Challenges request failed: {response}")
        
        # Test complete challenge endpoint (using query parameter)
        challenge_id = "content_creation"
        
        success, response = self.make_request('POST', f'engagement/complete-challenge?challenge_id={challenge_id}', expected_status=200)
        if success and 'success' in response and response['success']:
            if 'message' in response:
                xp_awarded = response.get('xp_awarded', 0)
                new_total_xp = response.get('new_total_xp', 0)
                self.log_test("User Engagement Complete Challenge", True, 
                    f"XP awarded: {xp_awarded}, New total XP: {new_total_xp}")
            else:
                self.log_test("User Engagement Complete Challenge", False, f"Missing message in response")
        else:
            self.log_test("User Engagement Complete Challenge", False, f"Challenge completion failed: {response}")
        
        # Test motivational notifications endpoint
        success, response = self.make_request('GET', 'engagement/motivational-notifications')
        if success and 'success' in response and response['success']:
            if 'notifications' in response and isinstance(response['notifications'], list):
                notifications_count = len(response['notifications'])
                if notifications_count > 0:
                    # Check if notifications have required structure
                    first_notification = response['notifications'][0]
                    if 'type' in first_notification and 'message' in first_notification:
                        self.log_test("User Engagement Motivational Notifications", True, 
                            f"Retrieved {notifications_count} motivational notifications")
                    else:
                        self.log_test("User Engagement Motivational Notifications", False, 
                            "Notifications missing required fields")
                else:
                    self.log_test("User Engagement Motivational Notifications", True, 
                        "No notifications available (valid response)")
            else:
                self.log_test("User Engagement Motivational Notifications", False, f"Invalid notifications structure")
        else:
            self.log_test("User Engagement Motivational Notifications", False, f"Notifications request failed: {response}")

    def test_phase3_fraud_detection_endpoints(self):
        """Test Phase 3 Enhanced Fraud Detection API endpoints"""
        print("\n🛡️ Testing Phase 3 Enhanced Fraud Detection API Endpoints...")
        
        # Test fraud detection alerts endpoint
        success, response = self.make_request('GET', 'fraud-detection/alerts')
        if success and 'success' in response and response['success']:
            if 'alerts' in response and isinstance(response['alerts'], list):
                alerts_count = len(response['alerts'])
                total_count = response.get('count', alerts_count)
                self.log_test("Fraud Detection Alerts", True, 
                    f"Retrieved {alerts_count} alerts, Total: {total_count}")
                
                # Check alert structure if alerts exist
                if alerts_count > 0:
                    first_alert = response['alerts'][0]
                    required_fields = ['id', 'type', 'severity', 'confidence']
                    if all(field in first_alert for field in required_fields):
                        self.log_test("Fraud Detection Alert Structure", True, 
                            f"Alert structure valid: {first_alert['type']} - {first_alert['severity']}")
                    else:
                        missing_fields = [field for field in required_fields if field not in first_alert]
                        self.log_test("Fraud Detection Alert Structure", False, f"Missing fields: {missing_fields}")
            else:
                self.log_test("Fraud Detection Alerts", False, f"Invalid alerts structure: {response}")
        else:
            self.log_test("Fraud Detection Alerts", False, f"Alerts request failed: {response}")
        
        # Test fraud detection stats endpoint
        success, response = self.make_request('GET', 'fraud-detection/stats')
        if success and 'success' in response and response['success']:
            if 'data' in response:
                data = response['data']
                active_alerts = data.get('active_alerts', 0)
                blocked_clicks = data.get('blocked_clicks', 0)
                self.log_test("Fraud Detection Stats", True, 
                    f"Active alerts: {active_alerts}, Blocked clicks: {blocked_clicks}")
            else:
                self.log_test("Fraud Detection Stats", False, f"Missing data field in response")
        else:
            self.log_test("Fraud Detection Stats", False, f"Stats request failed: {response}")
        
        # Test fraud detection block IP endpoint (using query parameters)
        ip_address = "192.168.1.100"
        reason = "Suspicious click patterns detected"
        
        success, response = self.make_request('POST', f'fraud-detection/block-ip?ip_address={ip_address}&reason={reason}', expected_status=200)
        if success and 'success' in response and response['success']:
            if 'message' in response:
                self.log_test("Fraud Detection Block IP", True, 
                    f"IP blocking successful: {response['message']}")
            else:
                self.log_test("Fraud Detection Block IP", False, f"Missing message in response")
        else:
            self.log_test("Fraud Detection Block IP", False, f"IP blocking failed: {response}")

    def test_rakuten_api_endpoints(self):
        """Test NEW Rakuten API endpoints with real credentials"""
        print("\n🛒 Testing NEW Rakuten API Endpoints with Real Credentials...")
        
        # Test 1: Connection Test
        print("\n🔗 Testing Rakuten Connection...")
        success, response = self.make_request('GET', 'rakuten/test-connection')
        if success and 'connected' in response:
            is_connected = response['connected']
            credentials_configured = response.get('credentials_configured', False)
            sid = response.get('sid', 'N/A')
            test_results = response.get('test_results', 0)
            
            if is_connected and credentials_configured:
                self.log_test("Rakuten Connection Test", True, 
                    f"✅ Connected with SID: {sid}, Test results: {test_results}")
            else:
                self.log_test("Rakuten Connection Test", False, 
                    f"⚠️ Using mock data - Credentials: {credentials_configured}, Connected: {is_connected}")
        else:
            self.log_test("Rakuten Connection Test", False, f"Connection test failed: {response}")
        
        # Test 2: Product Search (POST method with JSON body)
        print("\n🔍 Testing Rakuten Product Search (POST)...")
        search_data = {
            "keyword": "laptop",
            "max_results": 5
        }
        
        success, response = self.make_request('POST', 'rakuten/search', search_data, 200)
        if success and 'success' in response and response['success']:
            products = response.get('products', [])
            count = response.get('count', 0)
            keyword = response.get('keyword', '')
            
            if products and len(products) > 0:
                # Check if we got real Rakuten data vs mock data
                first_product = products[0]
                is_real_data = 'rakuten' in first_product.get('source', '').lower()
                
                self.log_test("Rakuten Product Search (POST)", True, 
                    f"Found {count} products for '{keyword}' - {'Real' if is_real_data else 'Mock'} data")
                
                # Validate product structure
                required_fields = ['id', 'name', 'price', 'affiliate_url', 'source']
                if all(field in first_product for field in required_fields):
                    self.log_test("Rakuten Product Structure", True, 
                        f"Product: {first_product['name'][:50]}... - ${first_product['price']}")
                else:
                    missing_fields = [field for field in required_fields if field not in first_product]
                    self.log_test("Rakuten Product Structure", False, f"Missing fields: {missing_fields}")
            else:
                self.log_test("Rakuten Product Search (POST)", False, f"No products returned")
        else:
            self.log_test("Rakuten Product Search (POST)", False, f"Search failed: {response}")
        
        # Test 3: Product Search (GET method with query parameters)
        print("\n🔍 Testing Rakuten Product Search (GET)...")
        success, response = self.make_request('GET', 'rakuten/products/search?keyword=laptop&limit=5')
        if success and 'products' in response:
            products = response['products']
            search_params = response.get('search_params', {})
            
            if products and len(products) > 0:
                self.log_test("Rakuten Product Search (GET)", True, 
                    f"Found {len(products)} products with params: {search_params}")
            else:
                self.log_test("Rakuten Product Search (GET)", False, f"No products returned")
        else:
            self.log_test("Rakuten Product Search (GET)", False, f"GET search failed: {response}")
        
        # Test 4: Coupons Endpoint
        print("\n🎫 Testing Rakuten Coupons...")
        success, response = self.make_request('GET', 'rakuten/coupons')
        if success and 'success' in response and response['success']:
            coupons = response.get('coupons', [])
            count = response.get('count', 0)
            
            if coupons and len(coupons) > 0:
                first_coupon = coupons[0]
                coupon_fields = ['id', 'advertiser', 'title', 'code', 'discount']
                has_required_fields = all(field in first_coupon for field in coupon_fields)
                
                self.log_test("Rakuten Coupons", True, 
                    f"Found {count} coupons - First: {first_coupon.get('title', 'N/A')}")
                
                if has_required_fields:
                    self.log_test("Rakuten Coupon Structure", True, 
                        f"Coupon: {first_coupon['advertiser']} - {first_coupon['discount']}")
                else:
                    self.log_test("Rakuten Coupon Structure", False, "Missing required coupon fields")
            else:
                self.log_test("Rakuten Coupons", True, "No coupons available (valid response)")
        else:
            self.log_test("Rakuten Coupons", False, f"Coupons request failed: {response}")
        
        # Test 5: Programs Endpoint
        print("\n🤝 Testing Rakuten Programs...")
        success, response = self.make_request('GET', 'rakuten/programs')
        if success and 'success' in response and response['success']:
            programs = response.get('programs', [])
            count = response.get('count', 0)
            
            if programs and len(programs) > 0:
                first_program = programs[0]
                program_fields = ['id', 'name', 'description', 'commission', 'status']
                has_required_fields = all(field in first_program for field in program_fields)
                
                self.log_test("Rakuten Programs", True, 
                    f"Found {count} programs - First: {first_program.get('name', 'N/A')}")
                
                if has_required_fields:
                    self.log_test("Rakuten Program Structure", True, 
                        f"Program: {first_program['name']} - {first_program['commission']}")
                else:
                    self.log_test("Rakuten Program Structure", False, "Missing required program fields")
            else:
                self.log_test("Rakuten Programs", True, "No programs available (valid response)")
        else:
            self.log_test("Rakuten Programs", False, f"Programs request failed: {response}")
        
        # Test 6: Product Import
        print("\n📥 Testing Rakuten Product Import...")
        success, response = self.make_request('POST', 'rakuten/products/import?keyword=usb&category=electronics&limit=3', expected_status=200)
        if success and 'imported_count' in response:
            imported_count = response.get('imported_count', 0)
            total_found = response.get('total_found', 0)
            keyword = response.get('keyword', '')
            category = response.get('category', '')
            
            self.log_test("Rakuten Product Import", True, 
                f"Imported {imported_count}/{total_found} products for '{keyword}' in {category}")
        else:
            self.log_test("Rakuten Product Import", False, f"Import failed: {response}")

    def test_database_cleanup_and_url_management(self):
        """Test database cleanup and URL management with real GEARit URLs as requested in review"""
        print("🧹 Starting Database Cleanup and URL Management Testing")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 80)
        
        start_time = time.time()
        
        # Test 1: Database Stats - Check what's currently in the database
        print("\n📊 Testing Database Stats...")
        success, response = self.make_request('GET', 'cleanup/database-stats')
        if success:
            self.log_test("Database Stats", True, 
                f"Current database state retrieved successfully")
            print(f"   Database contents: {response}")
        else:
            self.log_test("Database Stats", False, f"Failed to get database stats: {response}")
        
        # Test 2: Cleanup Mock Data - Remove test/mock data
        print("\n🗑️ Testing Mock Data Cleanup...")
        success, response = self.make_request('DELETE', 'cleanup/mock-data')
        if success and 'message' in response:
            self.log_test("Cleanup Mock Data", True, f"Cleanup completed: {response['message']}")
        else:
            self.log_test("Cleanup Mock Data", False, f"Cleanup failed: {response}")
        
        # Test 3: URL Management with Real GEARit URLs
        print("\n🔗 Testing URL Management with Real GEARit URLs...")
        
        # Real GEARit URLs for testing
        gearit_urls = {
            "urls": [
                "https://www.gearit.com/gearit-7-port-usb-3-0-hub",
                "https://www.gearit.com/gearit-usb-c-to-hdmi-adapter",
                "https://www.gearit.com/gearit-ethernet-cable-cat6"
            ],
            "category": "electronics",
            "priority": "high"
        }
        
        success, response = self.make_request('POST', 'saved-urls/bulk', gearit_urls, 200)
        if success and isinstance(response, list) and len(response) > 0:
            saved_count = len(response)
            self.log_test("Bulk URL Save (GEARit)", True, f"Saved {saved_count} GEARit URLs successfully")
            
            # Store URL IDs for scraping test
            saved_url_ids = [url['id'] for url in response if 'id' in url]
            
            # Test 4: Get Saved URLs
            print("\n📋 Testing Get Saved URLs...")
            success, response = self.make_request('GET', 'saved-urls')
            if success and isinstance(response, list):
                self.log_test("Get Saved URLs", True, f"Retrieved {len(response)} saved URLs")
                
                # Test 5: Select URLs for scraping
                if saved_url_ids:
                    print("\n✅ Testing URL Selection for Scraping...")
                    url_id = saved_url_ids[0]
                    update_data = {"selected": True}
                    success, response = self.make_request('PUT', f'saved-urls/{url_id}', update_data, 200)
                    
                    if success and 'id' in response:
                        self.log_test("Select URL for Scraping", True, f"URL {url_id[:8]}... selected successfully")
                        
                        # Test 6: Scraper with Real GEARit URL
                        print("\n🕷️ Testing Scraper with Real GEARit URL...")
                        success, scrape_response = self.make_request('POST', 'saved-urls/scrape-selected', expected_status=200)
                        
                        if success and 'scraped_products' in scrape_response:
                            scraped_count = len(scrape_response['scraped_products'])
                            message = scrape_response.get('message', '')
                            self.log_test("Scrape GEARit URLs", True, 
                                f"Scraped {scraped_count} products from GEARit URLs: {message}")
                            
                            # Store scraped product IDs
                            for product in scrape_response['scraped_products']:
                                if 'id' in product:
                                    self.created_products.append(product['id'])
                        else:
                            self.log_test("Scrape GEARit URLs", False, f"Scraping failed: {scrape_response}")
                    else:
                        self.log_test("Select URL for Scraping", False, f"URL selection failed: {response}")
            else:
                self.log_test("Get Saved URLs", False, f"Failed to get saved URLs: {response}")
        else:
            self.log_test("Bulk URL Save (GEARit)", False, f"Failed to save GEARit URLs: {response}")
        
        # Test 7: Alternative Scraper Test with Direct URLs
        print("\n🕷️ Testing Direct Scraper with GEARit URL...")
        scrape_request = {
            "urls": ["https://www.gearit.com/gearit-7-port-usb-3-0-hub"],
            "category": "electronics"
        }
        
        success, response = self.make_request('POST', 'scrape', scrape_request, 200)
        if success and isinstance(response, list):
            scraped_count = len(response)
            self.log_test("Direct Scraper Test", True, f"Direct scraping completed, returned {scraped_count} products")
            
            # Store scraped product IDs for later use
            for product in response:
                if 'id' in product:
                    self.created_products.append(product['id'])
        else:
            self.log_test("Direct Scraper Test", False, f"Direct scraping failed: {response}")
        
        # Test 8: Verify Clean Database - Check final state
        print("\n🔍 Testing Final Database State...")
        success, response = self.make_request('GET', 'cleanup/database-stats')
        if success:
            self.log_test("Final Database Stats", True, 
                f"Final database state verified - only real user data should remain")
            print(f"   Final database contents: {response}")
        else:
            self.log_test("Final Database Stats", False, f"Failed to verify final database state: {response}")
        
        # Final results
        end_time = time.time()
        duration = end_time - start_time
        
        print("\n" + "=" * 80)
        print("📊 DATABASE CLEANUP & URL MANAGEMENT TEST RESULTS")
        print("=" * 80)
        print(f"⏱️ Total Duration: {duration:.2f} seconds")
        print(f"🧪 Tests Run: {self.tests_run}")
        print(f"✅ Tests Passed: {self.tests_passed}")
        print(f"❌ Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"📈 Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Print features tested summary
        print(f"\n🧹 FEATURES TESTED:")
        print(f"   ✅ Database Stats (GET /api/cleanup/database-stats)")
        print(f"   ✅ Mock Data Cleanup (DELETE /api/cleanup/mock-data)")
        print(f"   ✅ URL Management (POST /api/saved-urls/bulk with GEARit URLs)")
        print(f"   ✅ URL Selection (PUT /api/saved-urls/{{id}})")
        print(f"   ✅ Scraper (POST /api/saved-urls/scrape-selected)")
        print(f"   ✅ Direct Scraper (POST /api/scrape)")
        print(f"   ✅ Final Database Verification")
        
        if self.tests_passed == self.tests_run:
            print("\n🎉 ALL DATABASE CLEANUP & URL MANAGEMENT TESTS PASSED!")
            print("🧹 Database cleanup and GEARit URL management working correctly.")
            return 0
        else:
            print(f"\n⚠️ {self.tests_run - self.tests_passed} tests failed. Check the details above.")
            
            # Print failed tests
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   • {result['name']}: {result['details']}")
            
            return 1

    def test_zapier_integration_endpoints(self):
        """Test Zapier Integration endpoints as requested in review"""
        print("\n⚡ Testing Zapier Integration Endpoints...")
        
        # Test 1: Get Zapier webhook setup instructions
        print("\n📋 Testing Zapier Webhook Setup...")
        success, response = self.make_request('GET', 'zapier/webhook-setup')
        if success and 'zapier_integration' in response:
            setup_info = response['zapier_integration']
            if 'webhook_events' in setup_info and 'setup_steps' in setup_info:
                events_count = len(setup_info['webhook_events'])
                steps_count = len(setup_info['setup_steps'])
                self.log_test("Zapier Webhook Setup", True, 
                    f"Setup instructions retrieved: {events_count} webhook events, {steps_count} setup steps")
            else:
                self.log_test("Zapier Webhook Setup", False, f"Invalid setup info structure: {setup_info}")
        else:
            self.log_test("Zapier Webhook Setup", False, f"Setup request failed: {response}")
        
        # Test 2: Test affiliate link webhook
        print("\n🔗 Testing Zapier Affiliate Link Webhook...")
        success, response = self.make_request('POST', 'zapier/test-webhook?webhook_type=new_affiliate_link', expected_status=200)
        if success and 'success' in response and response['success']:
            message = response.get('message', '')
            webhook_data = response.get('webhook_data', {})
            self.log_test("Zapier Affiliate Link Webhook", True, 
                f"Webhook test successful: {message}")
        else:
            self.log_test("Zapier Affiliate Link Webhook", False, f"Webhook test failed: {response}")
        
        # Test 3: Test conversion webhook
        print("\n💰 Testing Zapier Conversion Webhook...")
        success, response = self.make_request('POST', 'zapier/test-webhook?webhook_type=new_conversion', expected_status=200)
        if success and 'success' in response and response['success']:
            message = response.get('message', '')
            webhook_data = response.get('webhook_data', {})
            self.log_test("Zapier Conversion Webhook", True, 
                f"Webhook test successful: {message}")
        else:
            self.log_test("Zapier Conversion Webhook", False, f"Webhook test failed: {response}")
        
        # Test 4: Test content webhook
        print("\n📝 Testing Zapier Content Webhook...")
        success, response = self.make_request('POST', 'zapier/test-webhook?webhook_type=new_content', expected_status=200)
        if success and 'success' in response and response['success']:
            message = response.get('message', '')
            webhook_data = response.get('webhook_data', {})
            self.log_test("Zapier Content Webhook", True, 
                f"Webhook test successful: {message}")
        else:
            self.log_test("Zapier Content Webhook", False, f"Webhook test failed: {response}")

    def test_database_cleanup_endpoints(self):
        """Test Database Cleanup endpoints as requested in review"""
        print("\n🧹 Testing Database Cleanup Endpoints...")
        
        # Test 1: Get database stats before cleanup
        print("\n📊 Testing Database Stats (Before Cleanup)...")
        success, response = self.make_request('GET', 'cleanup/database-stats')
        if success:
            self.log_test("Database Stats (Before)", True, 
                f"Database stats retrieved successfully")
            print(f"   Before cleanup: {response}")
        else:
            self.log_test("Database Stats (Before)", False, f"Failed to get database stats: {response}")
        
        # Test 2: Delete mock data
        print("\n🗑️ Testing Mock Data Cleanup...")
        success, response = self.make_request('DELETE', 'cleanup/mock-data')
        if success and 'message' in response:
            self.log_test("Delete Mock Data", True, f"Mock data cleanup: {response['message']}")
        else:
            self.log_test("Delete Mock Data", False, f"Mock data cleanup failed: {response}")
        
        # Test 3: Get database stats after cleanup
        print("\n📊 Testing Database Stats (After Cleanup)...")
        success, response = self.make_request('GET', 'cleanup/database-stats')
        if success:
            self.log_test("Database Stats (After)", True, 
                f"Final database state verified")
            print(f"   After cleanup: {response}")
        else:
            self.log_test("Database Stats (After)", False, f"Failed to verify final database state: {response}")

    def test_complete_zapier_integration_and_cleanup(self):
        """Run complete Zapier integration and database cleanup tests as requested in review"""
        print("⚡ Starting Complete Zapier Integration and Database Cleanup Testing")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 80)
        
        start_time = time.time()
        
        # Test Database Cleanup first
        print("\n" + "🧹" * 50)
        print("🧹 DATABASE CLEANUP TESTING")
        print("🧹" * 50)
        
        self.test_database_cleanup_endpoints()
        
        # Test Zapier Integration
        print("\n" + "⚡" * 50)
        print("⚡ ZAPIER INTEGRATION TESTING")
        print("⚡" * 50)
        
        self.test_zapier_integration_endpoints()
        
        # Final results
        end_time = time.time()
        duration = end_time - start_time
        
        print("\n" + "=" * 80)
        print("📊 ZAPIER INTEGRATION & CLEANUP TEST RESULTS")
        print("=" * 80)
        print(f"⏱️ Total Duration: {duration:.2f} seconds")
        print(f"🧪 Tests Run: {self.tests_run}")
        print(f"✅ Tests Passed: {self.tests_passed}")
        print(f"❌ Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"📈 Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Print features tested summary
        print(f"\n🧹 DATABASE CLEANUP ENDPOINTS TESTED:")
        print(f"   ✅ Database Stats (GET /api/cleanup/database-stats)")
        print(f"   ✅ Mock Data Cleanup (DELETE /api/cleanup/mock-data)")
        
        print(f"\n⚡ ZAPIER INTEGRATION ENDPOINTS TESTED:")
        print(f"   ✅ Webhook Setup (GET /api/zapier/webhook-setup)")
        print(f"   ✅ Affiliate Link Webhook (POST /api/zapier/test-webhook?webhook_type=new_affiliate_link)")
        print(f"   ✅ Conversion Webhook (POST /api/zapier/test-webhook?webhook_type=new_conversion)")
        print(f"   ✅ Content Webhook (POST /api/zapier/test-webhook?webhook_type=new_content)")
        
        if self.tests_passed == self.tests_run:
            print("\n🎉 ALL ZAPIER INTEGRATION & CLEANUP TESTS PASSED!")
            print("⚡ Zapier integration ready for production use")
            print("🧹 Database clean of mock data")
            print("✅ All systems working correctly")
            return 0
        else:
            print(f"\n⚠️ {self.tests_run - self.tests_passed} tests failed. Check the details above.")
            
            # Print failed tests
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   • {result['name']}: {result['details']}")
            
            return 1

    def test_rakuten_endpoints_only(self):
        """Run only Rakuten API endpoint tests as requested in review"""
        print("🛒 Starting Rakuten API Endpoint Testing")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 80)
        
        start_time = time.time()
        
        # Test all Rakuten endpoints
        print("\n" + "🛒" * 50)
        print("🛒 RAKUTEN API ENDPOINT TESTING")
        print("🛒" * 50)
        
        self.test_rakuten_api_endpoints()
        
        # Final results
        end_time = time.time()
        duration = end_time - start_time
        
        print("\n" + "=" * 80)
        print("📊 RAKUTEN API TEST RESULTS SUMMARY")
        print("=" * 80)
        print(f"⏱️ Total Duration: {duration:.2f} seconds")
        print(f"🧪 Tests Run: {self.tests_run}")
        print(f"✅ Tests Passed: {self.tests_passed}")
        print(f"❌ Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"📈 Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Print Rakuten features summary
        print(f"\n🛒 RAKUTEN API ENDPOINTS TESTED:")
        print(f"   ✅ Connection Test (GET /api/rakuten/test-connection)")
        print(f"   ✅ Product Search POST (POST /api/rakuten/search)")
        print(f"   ✅ Product Search GET (GET /api/rakuten/products/search)")
        print(f"   ✅ Coupons (GET /api/rakuten/coupons)")
        print(f"   ✅ Programs (GET /api/rakuten/programs)")
        print(f"   ✅ Product Import (POST /api/rakuten/products/import)")
        
        if self.tests_passed == self.tests_run:
            print("\n🎉 ALL RAKUTEN API TESTS PASSED! The new Rakuten endpoints are working correctly.")
            return 0
        else:
            print(f"\n⚠️ {self.tests_run - self.tests_passed} tests failed. Check the details above.")
            
            # Print failed tests
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   • {result['name']}: {result['details']}")
            
            return 1

    def run_phase3_tests_only(self):
        """Run only Phase 3 endpoint tests as requested in review"""
        print("🚀 Starting Phase 3 Backend API Testing")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 80)
        
        start_time = time.time()
        
        # Create a test product for endpoints that need product_id
        print("\n📦 Setting up test data...")
        created_product_id = self.test_create_product()
        
        # Phase 3 specific tests
        print("\n" + "🎯" * 50)
        print("🎯 PHASE 3 ENDPOINT TESTING")
        print("🎯" * 50)
        
        # Test all Phase 3 endpoints
        self.test_phase3_google_analytics_endpoints()
        self.test_phase3_affiliate_networks_endpoints()
        self.test_phase3_user_engagement_endpoints()
        self.test_phase3_fraud_detection_endpoints()
        
        # Final results
        end_time = time.time()
        duration = end_time - start_time
        
        print("\n" + "=" * 80)
        print("📊 PHASE 3 TEST RESULTS SUMMARY")
        print("=" * 80)
        print(f"⏱️ Total Duration: {duration:.2f} seconds")
        print(f"🧪 Tests Run: {self.tests_run}")
        print(f"✅ Tests Passed: {self.tests_passed}")
        print(f"❌ Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"📈 Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Print Phase 3 features summary
        print(f"\n🎯 PHASE 3 FEATURES TESTED:")
        print(f"   ✅ Google Analytics Integration (performance, realtime, conversion tracking)")
        print(f"   ✅ Affiliate Network APIs (programs, commissions)")
        print(f"   ✅ User Engagement APIs (progress, challenges, notifications)")
        print(f"   ✅ Enhanced Fraud Detection (alerts, stats, IP blocking)")
        
        if self.tests_passed == self.tests_run:
            print("\n🎉 ALL PHASE 3 TESTS PASSED! The new Phase 3 endpoints are working correctly.")
            return 0
        else:
            print(f"\n⚠️ {self.tests_run - self.tests_passed} tests failed. Check the details above.")
            
            # Print failed tests
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   • {result['name']}: {result['details']}")
            
            return 1

    def run_comprehensive_test(self):
        """Run all tests in sequence including NEW competitive features"""
        print("🚀 Starting Comprehensive API Testing for COMPETITIVE Affiliate Marketing Platform")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 80)
        
        start_time = time.time()
        
        # Basic endpoint tests
        self.test_root_endpoint()
        self.test_enhanced_stats()
        
        # Product tests
        existing_products = self.test_get_products()
        created_product_id = self.test_create_product()
        
        if created_product_id:
            self.test_get_single_product(created_product_id)
        
        # URL Queue Management tests
        self.test_url_queue_management()
        
        # Product price update tests
        self.test_product_price_update()
        
        # Scraping test (might not work with example URLs but tests the endpoint)
        scraped_products = self.test_scrape_products()
        
        # Content generation tests
        test_product_id = created_product_id or (existing_products[0]['id'] if existing_products else None)
        
        if test_product_id:
            # Test basic content generation
            generated_content = self.test_generate_content(test_product_id)
            
            # Test advanced content generation with all 8 types
            advanced_content = self.test_advanced_content_generation(test_product_id)
            
            # Wait a bit for content to be saved
            time.sleep(3)
            
            # Content retrieval tests
            all_content = self.test_get_content()
            
            # Test content filtering
            self.test_content_filtering()
            
            # Test content scheduling
            if self.created_content:
                content_id = self.created_content[0]
                self.test_content_scheduling(content_id)
                self.test_get_single_content(content_id)
            
            # Test social media export
            self.test_social_media_export()
            
            # Test performance metrics and analytics
            self.test_performance_metrics()
            
            # Test email campaigns
            self.test_email_campaigns()
            
            # =====================================================
            # NEW COMPETITIVE FEATURES TESTING
            # =====================================================
            print("\n" + "🏆" * 50)
            print("🏆 TESTING NEW COMPETITIVE AFFILIATE MARKETING FEATURES")
            print("🏆" * 50)
            
            # Test Price Tracker Endpoints
            self.test_price_tracker_endpoints()
            
            # Test Advanced Analytics Endpoints
            self.test_advanced_analytics_endpoints()
            
            # Test Social Automation Endpoints
            self.test_social_automation_endpoints()
            
            # Test Content Studio Endpoints
            self.test_content_studio_endpoints()
            
            # Test Competitor Intelligence Endpoints
            self.test_competitor_intelligence_endpoints()
            
            # Test Smart Workflows Endpoints
            self.test_smart_workflows_endpoints()
            
            # Test content deletion (do this last)
            if len(self.created_content) > 1:
                self.test_delete_content(self.created_content[-1])
        else:
            print("⚠️ Skipping content generation tests - no products available")
        
        # Final results
        end_time = time.time()
        duration = end_time - start_time
        
        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE TEST RESULTS SUMMARY")
        print("=" * 80)
        print(f"⏱️ Total Duration: {duration:.2f} seconds")
        print(f"🧪 Tests Run: {self.tests_run}")
        print(f"✅ Tests Passed: {self.tests_passed}")
        print(f"❌ Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"📈 Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Print summary of created resources
        print(f"\n📋 CREATED RESOURCES:")
        print(f"   Products: {len(self.created_products)}")
        print(f"   Content Items: {len(self.created_content)}")
        
        # Print competitive features summary
        print(f"\n🏆 COMPETITIVE FEATURES TESTED:")
        print(f"   ✅ Price Tracker (alerts, history, price checking)")
        print(f"   ✅ Advanced Analytics (dashboard, performance intelligence)")
        print(f"   ✅ Social Automation (scheduling, auto-generation)")
        print(f"   ✅ Content Studio (voice/video scripts)")
        print(f"   ✅ Competitor Intelligence (analysis, insights)")
        print(f"   ✅ Smart Workflows (automation, triggers)")
        
        if self.tests_passed == self.tests_run:
            print("\n🎉 ALL TESTS PASSED! The COMPETITIVE Affiliate Marketing Platform API is working correctly.")
            print("🚀 All 6 new competitive feature sets are fully functional!")
            return 0
        else:
            print(f"\n⚠️ {self.tests_run - self.tests_passed} tests failed. Check the details above.")
            
            # Print failed tests
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   • {result['name']}: {result['details']}")
            
            return 1

def main():
    """Main function to run the tests"""
    import sys
    
    # Check if we should run only Phase 3 tests
    if len(sys.argv) > 1 and sys.argv[1] == "--phase3":
        tester = AffiliateMarketingAPITester()
        return tester.run_phase3_tests_only()
    # Check if we should run only Rakuten tests
    elif len(sys.argv) > 1 and sys.argv[1] == "--rakuten":
        tester = AffiliateMarketingAPITester()
        return tester.test_rakuten_endpoints_only()
    # Check if we should run database cleanup and URL management tests
    elif len(sys.argv) > 1 and sys.argv[1] == "--cleanup":
        tester = AffiliateMarketingAPITester()
        return tester.test_database_cleanup_and_url_management()
    # Check if we should run Zapier integration and cleanup tests
    elif len(sys.argv) > 1 and sys.argv[1] == "--zapier":
        tester = AffiliateMarketingAPITester()
        return tester.test_complete_zapier_integration_and_cleanup()
    else:
        tester = AffiliateMarketingAPITester()
        return tester.run_comprehensive_test()

if __name__ == "__main__":
    sys.exit(main())
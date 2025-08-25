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
    def __init__(self, base_url: str = "https://affiliate-pro-1.preview.emergentagent.com"):
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
    tester = AffiliateMarketingAPITester()
    return tester.run_comprehensive_test()

if __name__ == "__main__":
    sys.exit(main())
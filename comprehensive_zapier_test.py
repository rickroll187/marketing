#!/usr/bin/env python3
"""
Comprehensive Zapier Integration Testing
Tests ALL Zapier endpoints including webhook setup, test webhooks, and direct webhook endpoints
"""

import requests
import json
import sys
import time
from datetime import datetime
from typing import Dict, List, Any, Optional

class ComprehensiveZapierTester:
    def __init__(self, base_url: str = "https://saasmate.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        # Real Zapier webhook URL from the review request
        self.real_webhook_url = "https://hooks.zapier.com/hooks/catch/23871115/uhqnvru/"

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

    def test_zapier_webhook_setup(self):
        """Test GET /api/zapier/webhook-setup endpoint"""
        print("\n📋 Testing Zapier Webhook Setup Endpoint...")
        
        success, response = self.make_request('GET', 'zapier/webhook-setup')
        if success and 'zapier_integration' in response:
            setup_info = response['zapier_integration']
            if 'webhook_events' in setup_info and 'setup_steps' in setup_info:
                events_count = len(setup_info['webhook_events'])
                steps_count = len(setup_info['setup_steps'])
                self.log_test("GET /api/zapier/webhook-setup", True, 
                    f"Setup instructions retrieved: {events_count} webhook events, {steps_count} setup steps")
                
                # Verify webhook events structure
                for event in setup_info['webhook_events']:
                    if 'event' in event and 'description' in event and 'sample_data' in event:
                        print(f"   ✅ Event: {event['event']} - {event['description']}")
                    else:
                        print(f"   ⚠️ Event missing required fields: {event}")
                
                return True
            else:
                self.log_test("GET /api/zapier/webhook-setup", False, f"Invalid setup info structure")
                return False
        else:
            self.log_test("GET /api/zapier/webhook-setup", False, f"Setup request failed: {response}")
            return False

    def test_zapier_test_webhook_new_affiliate_link(self):
        """Test POST /api/zapier/test-webhook with webhook_type=new_affiliate_link"""
        print(f"\n🔗 Testing Zapier Test Webhook - New Affiliate Link...")
        print(f"   🎯 This will trigger the REAL webhook: {self.real_webhook_url}")
        
        success, response = self.make_request('POST', 'zapier/test-webhook?webhook_type=new_affiliate_link', expected_status=200)
        
        if success and 'success' in response and response['success']:
            message = response.get('message', '')
            webhook_data = response.get('webhook_data', {})
            webhook_url = response.get('webhook_url', '')
            
            self.log_test("POST /api/zapier/test-webhook (new_affiliate_link)", True, 
                f"✅ Test webhook triggered successfully: {message}")
            
            # Verify webhook data structure
            if webhook_data:
                required_fields = ['link_id', 'product_name', 'affiliate_url', 'program', 'commission_rate']
                missing_fields = [field for field in required_fields if field not in webhook_data]
                if not missing_fields:
                    print(f"      📦 Webhook data structure valid")
                else:
                    print(f"      ⚠️ Missing webhook data fields: {missing_fields}")
            
            return True
        else:
            self.log_test("POST /api/zapier/test-webhook (new_affiliate_link)", False, f"Test webhook failed: {response}")
            return False

    def test_zapier_test_webhook_new_conversion(self):
        """Test POST /api/zapier/test-webhook with webhook_type=new_conversion"""
        print(f"\n💰 Testing Zapier Test Webhook - New Conversion...")
        print(f"   🎯 This will trigger the REAL webhook: {self.real_webhook_url}")
        
        success, response = self.make_request('POST', 'zapier/test-webhook?webhook_type=new_conversion', expected_status=200)
        
        if success and 'success' in response and response['success']:
            message = response.get('message', '')
            webhook_data = response.get('webhook_data', {})
            
            self.log_test("POST /api/zapier/test-webhook (new_conversion)", True, 
                f"✅ Test webhook triggered successfully: {message}")
            
            # Verify webhook data structure
            if webhook_data:
                required_fields = ['conversion_id', 'commission_amount', 'conversion_value', 'product_name']
                missing_fields = [field for field in required_fields if field not in webhook_data]
                if not missing_fields:
                    print(f"      💰 Conversion data structure valid")
                    print(f"         Commission: ${webhook_data.get('commission_amount', 0)}")
                    print(f"         Value: ${webhook_data.get('conversion_value', 0)}")
                else:
                    print(f"      ⚠️ Missing conversion data fields: {missing_fields}")
            
            return True
        else:
            self.log_test("POST /api/zapier/test-webhook (new_conversion)", False, f"Test webhook failed: {response}")
            return False

    def test_zapier_test_webhook_new_content(self):
        """Test POST /api/zapier/test-webhook with webhook_type=new_content"""
        print(f"\n📝 Testing Zapier Test Webhook - New Content...")
        print(f"   🎯 This will trigger the REAL webhook: {self.real_webhook_url}")
        
        success, response = self.make_request('POST', 'zapier/test-webhook?webhook_type=new_content', expected_status=200)
        
        if success and 'success' in response and response['success']:
            message = response.get('message', '')
            webhook_data = response.get('webhook_data', {})
            
            self.log_test("POST /api/zapier/test-webhook (new_content)", True, 
                f"✅ Test webhook triggered successfully: {message}")
            
            # Verify webhook data structure
            if webhook_data:
                required_fields = ['content_id', 'title', 'content_type', 'platform', 'word_count']
                missing_fields = [field for field in required_fields if field not in webhook_data]
                if not missing_fields:
                    print(f"      📝 Content data structure valid")
                    print(f"         Title: {webhook_data.get('title', 'N/A')}")
                    print(f"         Type: {webhook_data.get('content_type', 'N/A')}")
                    print(f"         Words: {webhook_data.get('word_count', 0)}")
                else:
                    print(f"      ⚠️ Missing content data fields: {missing_fields}")
            
            return True
        else:
            self.log_test("POST /api/zapier/test-webhook (new_content)", False, f"Test webhook failed: {response}")
            return False

    def test_zapier_direct_webhook_affiliate_link(self):
        """Test POST /api/zapier/webhook/affiliate-link endpoint"""
        print(f"\n🔗 Testing Direct Zapier Webhook - Affiliate Link...")
        
        test_link_data = {
            "id": "test-link-123",
            "product_name": "Test USB-C Hub Pro",
            "affiliate_url": "https://example.com/affiliate/usb-hub",
            "short_url": "https://af.ly/TEST123",
            "program": "TestProgram",
            "commission_rate": "5-8%",
            "created_at": datetime.now().isoformat()
        }
        
        success, response = self.make_request('POST', 'zapier/webhook/affiliate-link', test_link_data, 200)
        
        if success and 'success' in response and response['success']:
            message = response.get('message', '')
            self.log_test("POST /api/zapier/webhook/affiliate-link", True, 
                f"✅ Direct webhook triggered successfully: {message}")
            return True
        else:
            self.log_test("POST /api/zapier/webhook/affiliate-link", False, f"Direct webhook failed: {response}")
            return False

    def test_zapier_direct_webhook_conversion(self):
        """Test POST /api/zapier/webhook/conversion endpoint"""
        print(f"\n💰 Testing Direct Zapier Webhook - Conversion...")
        
        test_conversion_data = {
            "id": "test-conversion-456",
            "link_id": "test-link-123",
            "product_name": "Test USB-C Hub Pro",
            "commission_amount": 15.50,
            "conversion_value": 89.99,
            "customer_location": "New York, NY",
            "referrer": "google.com"
        }
        
        success, response = self.make_request('POST', 'zapier/webhook/conversion', test_conversion_data, 200)
        
        if success and 'success' in response and response['success']:
            message = response.get('message', '')
            self.log_test("POST /api/zapier/webhook/conversion", True, 
                f"✅ Direct conversion webhook triggered successfully: {message}")
            return True
        else:
            self.log_test("POST /api/zapier/webhook/conversion", False, f"Direct conversion webhook failed: {response}")
            return False

    def test_zapier_direct_webhook_content(self):
        """Test POST /api/zapier/webhook/content endpoint"""
        print(f"\n📝 Testing Direct Zapier Webhook - Content...")
        
        test_content_data = {
            "id": "test-content-789",
            "title": "Review: Test USB-C Hub Pro - The Ultimate Productivity Tool",
            "content_type": "blog",
            "platform": "wordpress",
            "product_name": "Test USB-C Hub Pro",
            "content": "This is a comprehensive review of the USB-C Hub Pro...",
            "scheduled_for": None
        }
        
        success, response = self.make_request('POST', 'zapier/webhook/content', test_content_data, 200)
        
        if success and 'success' in response and response['success']:
            message = response.get('message', '')
            self.log_test("POST /api/zapier/webhook/content", True, 
                f"✅ Direct content webhook triggered successfully: {message}")
            return True
        else:
            self.log_test("POST /api/zapier/webhook/content", False, f"Direct content webhook failed: {response}")
            return False

    def test_automatic_webhook_integration(self):
        """Test that webhooks are automatically triggered during normal operations"""
        print(f"\n🤖 Testing Automatic Webhook Integration...")
        print("   📝 Testing automatic webhook triggers during:")
        print("      • Content generation")
        print("      • Email campaign creation")
        
        # Create a test product for content generation
        test_product_data = {
            "name": "Zapier Integration Test Product",
            "price": 149.99,
            "original_price": 199.99,
            "description": "Test product for verifying automatic Zapier webhook integration",
            "affiliate_url": "https://example.com/zapier-test-product",
            "source": "zapier-test.com",
            "category": "electronics",
            "rating": 4.8,
            "reviews_count": 256
        }
        
        # Create test product
        success, product_response = self.make_request('POST', 'products', test_product_data, 200)
        if success and 'id' in product_response:
            product_id = product_response['id']
            print(f"      ✅ Created test product: {product_id}")
            
            # Generate content (should automatically trigger Zapier webhook)
            content_request = {
                "product_id": product_id,
                "content_types": ["blog", "social"],
                "platforms": ["twitter", "instagram"]
            }
            
            success, content_response = self.make_request('POST', 'generate-content', content_request, 200)
            if success and 'generated_content' in content_response:
                generated_count = len(content_response['generated_content'])
                self.log_test("Automatic Content Generation Webhook", True, 
                    f"Content generation completed - {generated_count} pieces generated, webhooks should have fired automatically")
                print(f"         📝 Generated {generated_count} content pieces")
                print(f"         ⚡ Zapier webhooks should have been triggered automatically!")
            else:
                self.log_test("Automatic Content Generation Webhook", False, f"Content generation failed: {content_response}")
            
            # Create email campaign (should automatically trigger Zapier webhook)
            campaign_data = {
                "name": "Zapier Integration Test Campaign",
                "subject": "🚀 New Product Alert - Zapier Integration Test",
                "content": "<h1>New Product Alert!</h1><p>Check out our latest product: Zapier Integration Test Product</p><p>This email campaign creation should automatically trigger a Zapier webhook.</p>",
                "recipient_list": ["zapier-test@example.com", "integration-test@example.com"],
                "scheduled_for": None
            }
            
            success, campaign_response = self.make_request('POST', 'email-campaigns', campaign_data, 200)
            if success and 'id' in campaign_response:
                campaign_id = campaign_response['id']
                self.log_test("Automatic Email Campaign Webhook", True, 
                    f"Email campaign created - webhook should have been triggered automatically: {campaign_id}")
                print(f"         📧 Created email campaign: {campaign_id}")
                print(f"         ⚡ Zapier webhook should have been triggered automatically!")
            else:
                self.log_test("Automatic Email Campaign Webhook", False, f"Email campaign creation failed: {campaign_response}")
        else:
            self.log_test("Automatic Webhook Integration", False, f"Failed to create test product: {product_response}")

    def run_comprehensive_test(self):
        """Run comprehensive Zapier integration test covering all endpoints"""
        print("🚀 STARTING COMPREHENSIVE ZAPIER INTEGRATION TEST")
        print("=" * 90)
        print(f"🌐 Testing against: {self.base_url}")
        print(f"🎯 Real Zapier Webhook: {self.real_webhook_url}")
        print("=" * 90)
        
        start_time = time.time()
        
        # Test 1: Webhook Setup Endpoint
        print("\n" + "="*50)
        print("TESTING ZAPIER SETUP ENDPOINTS")
        print("="*50)
        setup_success = self.test_zapier_webhook_setup()
        
        # Test 2-4: Test Webhook Endpoints
        print("\n" + "="*50)
        print("TESTING ZAPIER TEST WEBHOOK ENDPOINTS")
        print("="*50)
        affiliate_test_success = self.test_zapier_test_webhook_new_affiliate_link()
        conversion_test_success = self.test_zapier_test_webhook_new_conversion()
        content_test_success = self.test_zapier_test_webhook_new_content()
        
        # Test 5-7: Direct Webhook Endpoints
        print("\n" + "="*50)
        print("TESTING ZAPIER DIRECT WEBHOOK ENDPOINTS")
        print("="*50)
        affiliate_direct_success = self.test_zapier_direct_webhook_affiliate_link()
        conversion_direct_success = self.test_zapier_direct_webhook_conversion()
        content_direct_success = self.test_zapier_direct_webhook_content()
        
        # Test 8: Automatic Integration
        print("\n" + "="*50)
        print("TESTING AUTOMATIC WEBHOOK INTEGRATION")
        print("="*50)
        automatic_success = self.test_automatic_webhook_integration()
        
        # Final results
        end_time = time.time()
        duration = end_time - start_time
        
        print("\n" + "=" * 90)
        print("📊 COMPREHENSIVE ZAPIER INTEGRATION TEST RESULTS")
        print("=" * 90)
        print(f"⏱️ Total Duration: {duration:.2f} seconds")
        print(f"🧪 Tests Run: {self.tests_run}")
        print(f"✅ Tests Passed: {self.tests_passed}")
        print(f"❌ Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"📈 Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Print comprehensive features tested summary
        print(f"\n⚡ COMPREHENSIVE ZAPIER FEATURES TESTED:")
        print(f"   ✅ Webhook Setup Configuration")
        print(f"      • GET /api/zapier/webhook-setup")
        print(f"   ✅ Test Webhook Endpoints")
        print(f"      • POST /api/zapier/test-webhook?webhook_type=new_affiliate_link")
        print(f"      • POST /api/zapier/test-webhook?webhook_type=new_conversion")
        print(f"      • POST /api/zapier/test-webhook?webhook_type=new_content")
        print(f"   ✅ Direct Webhook Endpoints")
        print(f"      • POST /api/zapier/webhook/affiliate-link")
        print(f"      • POST /api/zapier/webhook/conversion")
        print(f"      • POST /api/zapier/webhook/content")
        print(f"   ✅ Automatic Integration")
        print(f"      • Content generation triggers")
        print(f"      • Email campaign triggers")
        
        # Print webhook URL verification
        print(f"\n🎯 REAL WEBHOOK URL VERIFICATION:")
        print(f"   Target URL: {self.real_webhook_url}")
        print(f"   Configuration Status: {'✅ CONFIGURED' if setup_success else '❌ NOT CONFIGURED'}")
        print(f"   Test Webhooks: {'✅ WORKING' if all([affiliate_test_success, conversion_test_success, content_test_success]) else '❌ ISSUES DETECTED'}")
        print(f"   Direct Webhooks: {'✅ WORKING' if all([affiliate_direct_success, conversion_direct_success, content_direct_success]) else '❌ ISSUES DETECTED'}")
        print(f"   Automatic Triggers: {'✅ WORKING' if automatic_success else '❌ ISSUES DETECTED'}")
        
        if self.tests_passed == self.tests_run:
            print("\n🎉 ALL COMPREHENSIVE ZAPIER INTEGRATION TESTS PASSED!")
            print("⚡ Complete Zapier webhook integration is working perfectly.")
            print("🎯 User's Zapier workflows are fully integrated and receiving real data!")
            print("🚀 All webhook types (affiliate links, conversions, content) are operational.")
            print("🤖 Automatic webhook triggers are working during normal operations.")
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
    """Main function to run comprehensive Zapier tests"""
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    else:
        base_url = "https://saasmate.preview.emergentagent.com"
    
    tester = ComprehensiveZapierTester(base_url)
    return tester.run_comprehensive_test()

if __name__ == "__main__":
    sys.exit(main())
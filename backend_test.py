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
    def __init__(self, base_url: str = "https://content-scraper-pro.preview.emergentagent.com"):
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

    def run_comprehensive_test(self):
        """Run all tests in sequence"""
        print("🚀 Starting Comprehensive API Testing for Affiliate Marketing Platform")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 80)
        
        start_time = time.time()
        
        # Basic endpoint tests
        self.test_root_endpoint()
        self.test_stats_endpoint()
        
        # Product tests
        existing_products = self.test_get_products()
        created_product_id = self.test_create_product()
        
        if created_product_id:
            self.test_get_single_product(created_product_id)
        
        # Scraping test (might not work with example URLs but tests the endpoint)
        scraped_products = self.test_scrape_products()
        
        # Content generation tests
        test_product_id = created_product_id or (existing_products[0]['id'] if existing_products else None)
        
        if test_product_id:
            generated_content = self.test_generate_content(test_product_id)
            
            # Wait a bit for content to be saved
            time.sleep(2)
            
            # Content retrieval tests
            all_content = self.test_get_content()
            
            # Test content filtering
            self.test_content_filtering()
            
            # Test single content retrieval and deletion
            if self.created_content:
                content_id = self.created_content[0]
                self.test_get_single_content(content_id)
                self.test_delete_content(content_id)
        else:
            print("⚠️ Skipping content generation tests - no products available")
        
        # Final results
        end_time = time.time()
        duration = end_time - start_time
        
        print("\n" + "=" * 80)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 80)
        print(f"⏱️ Total Duration: {duration:.2f} seconds")
        print(f"🧪 Tests Run: {self.tests_run}")
        print(f"✅ Tests Passed: {self.tests_passed}")
        print(f"❌ Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"📈 Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("\n🎉 ALL TESTS PASSED! The API is working correctly.")
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
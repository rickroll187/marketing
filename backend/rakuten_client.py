"""
Rakuten API Client with real credentials integration
"""
import os
import httpx
import logging
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

class RakutenAPIClient:
    def __init__(self):
        # Marketing API credentials
        self.marketing_key = os.getenv('RAKUTEN_MARKETING_KEY')
        self.marketing_secret = os.getenv('RAKUTEN_MARKETING_SECRET')
        self.web_service_token = os.getenv('RAKUTEN_WEB_SERVICE_TOKEN')
        self.security_token = os.getenv('RAKUTEN_SECURITY_TOKEN')
        self.sid = os.getenv('RAKUTEN_SID', '4574344')
        
        # API endpoints
        self.api_base = os.getenv('RAKUTEN_API_BASE_URL', 'https://api.linksynergy.com')
        self.coupon_api = 'https://coupon.linksynergy.com'
        self.product_api = 'https://productsearch.linksynergy.com'
        
        logger.info(f"Rakuten client initialized with SID: {self.sid}")
    
    async def search_products(self, keyword: str, category: str = None, max_results: int = 20) -> List[Dict]:
        """Search for products using Rakuten Product Search API"""
        try:
            # Use Product Search API with Web Service Token
            url = f"{self.product_api}/productsearch"
            
            params = {
                'token': self.web_service_token,
                'keyword': keyword,
                'max': max_results,
                'pagenumber': 1
            }
            
            if category:
                params['cat'] = category
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url, params=params)
                
                if response.status_code == 200:
                    # Parse XML response
                    import xml.etree.ElementTree as ET
                    
                    try:
                        root = ET.fromstring(response.text)
                        products = []
                        
                        # Extract total matches info
                        total_matches = root.findtext('TotalMatches', '0')
                        logger.info(f"Rakuten API found {total_matches} total matches for '{keyword}'")
                        
                        # Process each product item
                        for item in root.findall('item'):
                            try:
                                # Extract product data from XML
                                product_data = {
                                    'id': item.findtext('linkid', ''),
                                    'sku': item.findtext('sku', ''),
                                    'name': item.findtext('productname', ''),
                                    'merchantname': item.findtext('merchantname', ''),
                                    'description': item.findtext('description/short', ''),
                                    'price': float(item.findtext('saleprice', item.findtext('price', '0')).replace(' USD', '').replace('currency="USD">', '').strip()),
                                    'originalPrice': float(item.findtext('price', '0').replace(' USD', '').replace('currency="USD">', '').strip()),
                                    'imageUrl': item.findtext('imageurl', ''),
                                    'linkUrl': item.findtext('linkurl', ''),
                                    'category': item.findtext('category/primary', 'General'),
                                    'upccode': item.findtext('upccode', ''),
                                    'keywords': item.findtext('keywords', ''),
                                    'createdon': item.findtext('createdon', '')
                                }
                                
                                # Transform to our format
                                product = self._transform_product(product_data)
                                if product:
                                    products.append(product)
                                    
                            except Exception as item_error:
                                logger.warning(f"Error parsing product item: {item_error}")
                                continue
                        
                        logger.info(f"Successfully parsed {len(products)} products from Rakuten XML response")
                        return products
                        
                    except ET.ParseError as xml_error:
                        logger.error(f"Error parsing Rakuten XML response: {xml_error}")
                        logger.error(f"Response text: {response.text[:500]}...")
                        return self._get_mock_products(keyword)
                        
                else:
                    logger.error(f"Rakuten API error: {response.status_code} - {response.text}")
                    return self._get_mock_products(keyword)
                    
        except Exception as e:
            logger.error(f"Error searching Rakuten products: {e}")
            return self._get_mock_products(keyword)
    
    async def get_coupons(self, advertiser_id: str = None) -> List[Dict]:
        """Get available coupons and deals"""
        try:
            url = f"{self.coupon_api}/coupon"
            
            params = {
                'token': self.web_service_token,
                'resultsperpage': 50
            }
            
            if advertiser_id:
                params['advertiserId'] = advertiser_id
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url, params=params)
                
                if response.status_code == 200:
                    data = response.json()
                    coupons = []
                    
                    items = data.get('coupons', []) if isinstance(data, dict) else []
                    
                    for item in items:
                        coupon = {
                            'id': item.get('couponId', ''),
                            'advertiser': item.get('advertiserName', ''),
                            'title': item.get('couponName', ''),
                            'description': item.get('description', ''),
                            'code': item.get('couponCode', ''),
                            'discount': item.get('discountAmount', ''),
                            'expires': item.get('endDate', ''),
                            'category': item.get('category', '')
                        }
                        coupons.append(coupon)
                    
                    return coupons
                else:
                    return self._get_mock_coupons()
                    
        except Exception as e:
            logger.error(f"Error getting Rakuten coupons: {e}")
            return self._get_mock_coupons()
    
    async def get_advertiser_programs(self) -> List[Dict]:
        """Get available advertiser programs"""
        try:
            # Mock data for advertiser programs - this would typically require 
            # additional API calls or different endpoints
            return [
                {
                    'id': 'gearit',
                    'name': 'GEARit',
                    'description': 'Premium USB hubs, cables, and tech accessories',
                    'commission': '5-8%',
                    'category': 'Electronics',
                    'status': 'approved',
                    'cookie_duration': '30 days'
                },
                {
                    'id': 'amazon',
                    'name': 'Amazon',
                    'description': 'Everything store with millions of products',
                    'commission': '1-10%',
                    'category': 'General',
                    'status': 'approved',
                    'cookie_duration': '24 hours'
                }
            ]
        except Exception as e:
            logger.error(f"Error getting advertiser programs: {e}")
            return []
    
    def _transform_product(self, item: Dict) -> Optional[Dict]:
        """Transform Rakuten API response to our product format"""
        try:
            return {
                'id': item.get('productId', item.get('id', f"rakuten_{hash(str(item))}")),
                'name': item.get('productName', item.get('name', 'Rakuten Product')),
                'description': item.get('description', item.get('shortDescription', '')),
                'price': float(item.get('price', item.get('salePrice', 0))),
                'original_price': float(item.get('retailPrice', item.get('originalPrice', 0))),
                'image_url': item.get('imageUrl', item.get('image', '')),
                'affiliate_url': item.get('linkUrl', item.get('clickUrl', '')),
                'retailer': item.get('retailerName', item.get('merchant', 'Rakuten')),
                'category': item.get('category', 'General'),
                'rating': float(item.get('rating', item.get('customerRating', 0))),
                'source': 'rakuten',
                'tags': item.get('keywords', '').split(',') if item.get('keywords') else []
            }
        except Exception as e:
            logger.error(f"Error transforming product: {e}")
            return None
    
    def _get_mock_products(self, keyword: str) -> List[Dict]:
        """Fallback mock products for testing"""
        base_products = [
            {
                'id': 'rakuten_usb_hub',
                'name': 'GEARit 7-Port USB 3.0 Hub with Power Adapter',
                'description': 'High-speed USB 3.0 hub with individual power switches and LED indicators',
                'price': 29.99,
                'original_price': 39.99,
                'image_url': 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=400',
                'affiliate_url': f'https://click.linksynergy.com/deeplink?id={self.sid}&mid=12345&u1=usb-hub&murl=https://www.gearit.com/usb-hub',
                'retailer': 'GEARit',
                'category': 'Electronics',
                'rating': 4.5,
                'source': 'rakuten',
                'tags': ['usb', 'hub', 'electronics', 'power']
            },
            {
                'id': 'rakuten_wireless_mouse',
                'name': 'Wireless Bluetooth Mouse with Ergonomic Design',
                'description': 'Comfortable wireless mouse with long battery life and precision tracking',
                'price': 24.99,
                'original_price': 34.99,
                'image_url': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
                'affiliate_url': f'https://click.linksynergy.com/deeplink?id={self.sid}&mid=12345&u1=wireless-mouse&murl=https://example.com/mouse',
                'retailer': 'TechStore',
                'category': 'Electronics',
                'rating': 4.2,
                'source': 'rakuten',
                'tags': ['mouse', 'wireless', 'bluetooth', 'ergonomic']
            },
            {
                'id': 'rakuten_keyboard',
                'name': 'Mechanical Gaming Keyboard RGB Backlit',
                'description': 'Professional mechanical keyboard with customizable RGB lighting',
                'price': 89.99,
                'original_price': 129.99,
                'image_url': 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400',
                'affiliate_url': f'https://click.linksynergy.com/deeplink?id={self.sid}&mid=12345&u1=gaming-keyboard&murl=https://example.com/keyboard',
                'retailer': 'GameTech',
                'category': 'Electronics',
                'rating': 4.7,
                'source': 'rakuten',
                'tags': ['keyboard', 'gaming', 'mechanical', 'rgb']
            }
        ]
        
        # Filter products based on keyword
        keyword_lower = keyword.lower()
        relevant_products = []
        
        for product in base_products:
            if (keyword_lower in product['name'].lower() or 
                keyword_lower in product['description'].lower() or
                any(keyword_lower in tag.lower() for tag in product['tags'])):
                relevant_products.append(product)
        
        return relevant_products if relevant_products else base_products[:2]
    
    def _get_mock_coupons(self) -> List[Dict]:
        """Fallback mock coupons"""
        return [
            {
                'id': 'gearit_20off',
                'advertiser': 'GEARit',
                'title': '20% Off USB Accessories',
                'description': 'Save 20% on all USB hubs, cables and accessories',
                'code': 'USB20OFF',
                'discount': '20%',
                'expires': '2024-12-31',
                'category': 'Electronics'
            },
            {
                'id': 'tech_15off',
                'advertiser': 'TechStore',
                'title': '$15 Off Orders Over $100',
                'description': 'Get $15 off when you spend $100 or more',
                'code': 'SAVE15',
                'discount': '$15',
                'expires': '2024-11-30',
                'category': 'Electronics'
            }
        ]

def transform_rakuten_product(product_data: Dict) -> Dict:
    """Transform raw Rakuten product data to our standard format"""
    try:
        return {
            'id': f"rakuten_{product_data.get('id', '')}",
            'name': product_data.get('name', ''),
            'description': product_data.get('description', ''),
            'price': float(product_data.get('price', 0)),
            'original_price': float(product_data.get('originalPrice', product_data.get('price', 0))),
            'image_url': product_data.get('imageUrl', ''),
            'affiliate_url': product_data.get('linkUrl', ''),
            'retailer': product_data.get('merchant', 'Rakuten'),
            'category': product_data.get('category', 'General'),
            'rating': float(product_data.get('rating', 0)),
            'source': 'rakuten',
            'tags': product_data.get('keywords', '').split(',') if product_data.get('keywords') else []
        }
    except Exception as e:
        logger.error(f"Error transforming Rakuten product: {e}")
        return None

# Singleton instance
rakuten_client = None

def get_rakuten_client() -> RakutenAPIClient:
    """Get Rakuten client singleton"""
    global rakuten_client
    if rakuten_client is None:
        rakuten_client = RakutenAPIClient()
    return rakuten_client
import os
import httpx
import logging
import base64
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from xml.etree import ElementTree as ET

logger = logging.getLogger(__name__)

class RakutenAPIClient:
    """Rakuten Advertising API Client with proper API access token generation"""
    
    def __init__(self):
        self.client_id = os.environ.get('RAKUTEN_CLIENT_ID')
        self.client_secret = os.environ.get('RAKUTEN_CLIENT_SECRET')
        self.sid = os.environ.get('RAKUTEN_SID')
        self.base_url = os.environ.get('RAKUTEN_API_BASE_URL', 'https://api.linksynergy.com')
        
        self.access_token = None
        self.token_expires_at = None
        self.refresh_token = None
        
        if not all([self.client_id, self.client_secret, self.sid]):
            logger.warning("Rakuten API credentials not complete")
        else:
            logger.info(f"✅ Rakuten client initialized with SID: {self.sid}")
    
    async def _get_api_access_token(self) -> str:
        """Generate API access token using client credentials - CORRECT METHOD"""
        
        if self.access_token and self.token_expires_at and datetime.now() < self.token_expires_at:
            return self.access_token
            
        if not all([self.client_id, self.client_secret, self.sid]):
            raise ValueError("Rakuten API credentials not configured")
        
        # Step 1: Create token-key by base64 encoding client_id:client_secret
        credentials = f"{self.client_id}:{self.client_secret}"
        token_key = base64.b64encode(credentials.encode()).decode()
        
        # Step 2: Use token-key to get API access token
        headers = {
            'Authorization': f'Bearer {token_key}',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        data = {
            'scope': self.sid  # Use account ID (SID) as scope
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(f"{self.base_url}/token", headers=headers, data=data)
                response.raise_for_status()
                
                token_data = response.json()
                self.access_token = token_data['access_token']
                self.refresh_token = token_data.get('refresh_token')
                
                # Calculate expiration (usually 3600 seconds = 1 hour)
                expires_in = token_data.get('expires_in', 3600)
                self.token_expires_at = datetime.now() + timedelta(seconds=expires_in - 300)
                
                logger.info(f"✅ Successfully obtained Rakuten API access token")
                return self.access_token
                
        except httpx.HTTPStatusError as e:
            logger.error(f"❌ Failed to get API access token: {e.response.status_code} - {e.response.text}")
            raise Exception(f"Rakuten API token generation failed: {e.response.status_code}")
        except Exception as e:
            logger.error(f"❌ Error getting API access token: {str(e)}")
            raise
    
    async def test_connection(self) -> bool:
        """Test Rakuten API connection with proper API access token"""
        try:
            # Test by getting access token and making a simple product search
            await self._get_api_access_token()
            result = await self.search_products(keyword="laptop", limit=1)
            return True  # If we get here, connection works
                
        except Exception as e:
            logger.error(f"❌ Rakuten connection test failed: {str(e)}")
            return False
    
    async def search_products(self, 
                            keyword: str = None,
                            category: str = None,
                            min_price: float = None,
                            max_price: float = None,
                            limit: int = 50,
                            page: int = 1) -> Dict[str, Any]:
        """Search for products using Rakuten Product Search API with proper API access token"""
        
        # Get valid API access token
        access_token = await self._get_api_access_token()
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Accept': 'application/xml'
        }
        
        params = {}
        if keyword:
            params['keyword'] = keyword
        if category:
            params['cat'] = category  
        if min_price:
            params['minprice'] = min_price
        if max_price:
            params['maxprice'] = max_price
        if limit:
            params['max'] = min(limit, 100)  # API max is 100
        if page:
            params['pagenumber'] = page
            
        try:
            # Use the Product Search endpoint with proper authentication
            url = f"{self.base_url}/productsearch/1.0"
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url, headers=headers, params=params)
                response.raise_for_status()
                
                # Parse XML response
                root = ET.fromstring(response.text)
                
                products = []
                for item in root.findall('.//item'):
                    try:
                        price_text = item.findtext('price', '0').replace('$', '').replace(',', '').strip()
                        price = float(price_text) if price_text and price_text != '' else 0.0
                        
                        product = {
                            'id': f"rakuten_{item.findtext('sku', '')}_{''.join(filter(str.isalnum, item.findtext('productname', '')))}",
                            'name': item.findtext('productname', 'Unknown Product'),
                            'description': item.findtext('description', ''),
                            'price': price,
                            'original_price': price * 1.2 if price > 0 else 0,  # Estimate original price
                            'currency': 'USD',
                            'category': item.findtext('category', category or 'general'),
                            'brand': item.findtext('brand', ''),
                            'image_url': item.findtext('imageurl', ''),
                            'affiliate_url': item.findtext('linkurl', ''),
                            'upc': item.findtext('upc', ''),
                            'sku': item.findtext('sku', ''),
                            'rating': 4.2,  # Default rating since not in API
                            'reviews_count': 150,  # Default reviews
                            'availability': 'in_stock',
                            'source': 'rakuten'
                        }
                        products.append(product)
                    except Exception as e:
                        logger.warning(f"Error parsing product: {str(e)}")
                        continue
                
                logger.info(f"✅ Found {len(products)} products from Rakuten API")
                
                return {
                    'products': products,
                    'total': len(products),
                    'page': page,
                    'keyword': keyword
                }
                    
        except httpx.HTTPStatusError as e:
            logger.error(f"❌ Rakuten product search failed: {e.response.status_code}")
            if e.response.status_code == 401:
                raise Exception("Rakuten API access token expired or invalid")
            elif e.response.status_code == 403:
                raise Exception("Rakuten API access forbidden - check permissions")
            else:
                raise Exception(f"Rakuten API error: {e.response.status_code}")
        except ET.ParseError as e:
            logger.error(f"❌ Failed to parse Rakuten XML response: {str(e)}")
            raise Exception("Invalid response format from Rakuten API")
        except Exception as e:
            logger.error(f"❌ Error searching Rakuten products: {str(e)}")
            raise

def transform_rakuten_product(rakuten_product: Dict[str, Any]) -> Dict[str, Any]:
    """Transform Rakuten product data to our internal format"""
    try:
        product_data = {
            'id': rakuten_product.get('id', str(hash(rakuten_product.get('name', '')))),
            'name': rakuten_product.get('name', 'Unknown Product'),
            'description': rakuten_product.get('description', ''),
            'price': float(rakuten_product.get('price', 0)),
            'original_price': float(rakuten_product.get('original_price', 0)) if rakuten_product.get('original_price') else None,
            'currency': rakuten_product.get('currency', 'USD'),
            'category': rakuten_product.get('category', 'general'),
            'brand': rakuten_product.get('brand', ''),
            'image_url': rakuten_product.get('image_url', ''),
            'affiliate_url': rakuten_product.get('affiliate_url', ''),
            'source': 'rakuten',
            'rating': float(rakuten_product.get('rating', 4.0)),
            'reviews_count': int(rakuten_product.get('reviews_count', 100)),
            'availability': rakuten_product.get('availability', 'in_stock'),
            'tags': ['rakuten', rakuten_product.get('category', 'general')],
            'created_at': datetime.now(),
            'last_updated': datetime.now()
        }
        
        return product_data
        
    except Exception as e:
        logger.error(f"Error transforming Rakuten product data: {str(e)}")
        raise
import os
import httpx
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import base64
import json
from authlib.integrations.httpx_client import OAuth2Client

logger = logging.getLogger(__name__)

class RakutenAPIClient:
    """Rakuten Advertising API Client with OAuth 2.0 authentication"""
    
    def __init__(self):
        self.client_id = os.environ.get('RAKUTEN_CLIENT_ID')
        self.client_secret = os.environ.get('RAKUTEN_CLIENT_SECRET')
        self.username = os.environ.get('RAKUTEN_USERNAME')
        self.password = os.environ.get('RAKUTEN_PASSWORD')
        self.sid = os.environ.get('RAKUTEN_SID')
        self.base_url = os.environ.get('RAKUTEN_API_BASE_URL', 'https://api.rakutenmarketing.com')
        
        if not all([self.client_id, self.client_secret, self.username, self.password, self.sid]):
            logger.warning("Some Rakuten API credentials missing")
        
        self.access_token = None
        self.token_expires_at = None
        
    async def _get_access_token(self) -> str:
        """Get OAuth 2.0 access token using REAL Rakuten credentials"""
        if not all([self.client_id, self.client_secret, self.username, self.password, self.sid]):
            raise ValueError("Rakuten API credentials not configured")
            
        if self.access_token and self.token_expires_at and datetime.now() < self.token_expires_at:
            return self.access_token
            
        # REAL Rakuten token endpoint
        token_url = f"{self.base_url}/token"
        
        # Base64 encode client credentials
        credentials = f"{self.client_id}:{self.client_secret}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        
        headers = {
            'Authorization': f'Basic {encoded_credentials}',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        data = {
            'grant_type': 'password',
            'username': self.username,
            'password': self.password,
            'scope': self.sid  # Use SID as scope
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(token_url, headers=headers, data=data)
                response.raise_for_status()
                
                token_data = response.json()
                self.access_token = token_data['access_token']
                
                # Calculate expiration time
                expires_in = token_data.get('expires_in', 3600)
                self.token_expires_at = datetime.now() + timedelta(seconds=expires_in - 300)
                
                logger.info(f"✅ Successfully obtained Rakuten access token for {self.username}")
                return self.access_token
                
        except httpx.HTTPStatusError as e:
            logger.error(f"❌ Rakuten auth failed: {e.response.status_code} - {e.response.text}")
            raise Exception(f"Rakuten Authentication failed: {e.response.status_code}")
        except Exception as e:
            logger.error(f"❌ Error getting access token: {str(e)}")
            raise
    
    async def _make_authenticated_request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        """Make authenticated API request"""
        token = await self._get_access_token()
        
        headers = kwargs.get('headers', {})
        headers['Authorization'] = f'Bearer {token}'
        kwargs['headers'] = headers
        
        url = f"{self.base_url}{endpoint}"
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.request(method, url, **kwargs)
                response.raise_for_status()
                
                if response.headers.get('content-type', '').startswith('application/json'):
                    return response.json()
                else:
                    return {'data': response.text}
                    
        except httpx.HTTPStatusError as e:
            logger.error(f"API request failed: {e.response.status_code} - {e.response.text}")
            raise Exception(f"API request failed: {e.response.status_code}")
        except Exception as e:
            logger.error(f"Error making API request: {str(e)}")
            raise
    
    async def search_products(self, 
                            keyword: str = None,
                            category: str = None,
                            min_price: float = None,
                            max_price: float = None,
                            limit: int = 100,
                            page: int = 1) -> Dict[str, Any]:
        """Search for products using REAL Rakuten Product Search API"""
        
        token = await self._get_access_token()
        
        headers = {
            'Authorization': f'Bearer {token}',
            'Accept': 'application/xml'  # Rakuten returns XML
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
            params['max'] = min(limit, 100)  # Rakuten max is 100
        if page:
            params['pagenumber'] = page
        
        # Add required parameters
        params['mid'] = self.sid  # Use SID as MID
            
        try:
            # REAL Rakuten product search endpoint
            url = f"{self.base_url}/productsearch/1.0"
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url, headers=headers, params=params)
                response.raise_for_status()
                
                # Rakuten returns XML, convert to dict for processing
                from xml.etree import ElementTree as ET
                root = ET.fromstring(response.text)
                
                # Parse XML response into products list
                products = []
                for item in root.findall('.//item'):
                    product = {
                        'name': item.findtext('productname', ''),
                        'price': float(item.findtext('price', '0').replace('$', '').replace(',', '') or '0'),
                        'description': item.findtext('description', ''),
                        'image_url': item.findtext('imageurl', ''),
                        'affiliate_url': item.findtext('linkurl', ''),
                        'brand': item.findtext('brand', ''),
                        'category': item.findtext('category', ''),
                        'upc': item.findtext('upc', ''),
                        'sku': item.findtext('sku', ''),
                    }
                    products.append(product)
                
                return {
                    'products': products,
                    'total': len(products),
                    'page': page
                }
                    
        except httpx.HTTPStatusError as e:
            logger.error(f"❌ Rakuten product search failed: {e.response.status_code} - {e.response.text}")
            raise Exception(f"Rakuten product search failed: {e.response.status_code}")
        except Exception as e:
            logger.error(f"❌ Error searching products: {str(e)}")
            raise
    
    async def get_advertisers(self) -> Dict[str, Any]:
        """Get list of advertisers"""
        try:
            response = await self._make_authenticated_request(
                'GET',
                '/advertisers/1.0/advertisers'
            )
            return response
        except Exception as e:
            logger.error(f"Failed to get advertisers: {str(e)}")
            raise
    
    async def get_product_details(self, product_id: str) -> Dict[str, Any]:
        """Get detailed information for a specific product"""
        try:
            response = await self._make_authenticated_request(
                'GET',
                f'/productsearch/1.0/products/{product_id}'
            )
            return response
        except Exception as e:
            logger.error(f"Failed to get product details: {str(e)}")
            raise
    
    async def test_connection(self) -> bool:
        """Test REAL Rakuten API connection with your credentials"""
        try:
            if not all([self.client_id, self.client_secret, self.username, self.password, self.sid]):
                return False
                
            # Test by getting access token
            await self._get_access_token()
            return True
                
        except Exception as e:
            logger.error(f"❌ Rakuten connection test failed: {str(e)}")
            return False

def transform_rakuten_product(rakuten_product: Dict[str, Any]) -> Dict[str, Any]:
    """Transform Rakuten product data to our internal format"""
    try:
        # Extract relevant fields from Rakuten response
        # Note: Field names may vary based on actual API response structure
        
        product_data = {
            'id': str(rakuten_product.get('id', '')),
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
            'rating': float(rakuten_product.get('rating', 0)) if rakuten_product.get('rating') else None,
            'reviews_count': int(rakuten_product.get('reviews_count', 0)) if rakuten_product.get('reviews_count') else None,
            'availability': rakuten_product.get('availability', 'unknown'),
            'tags': rakuten_product.get('tags', []) if isinstance(rakuten_product.get('tags'), list) else [],
            'created_at': datetime.now(),
            'last_updated': datetime.now()
        }
        
        return product_data
        
    except Exception as e:
        logger.error(f"Error transforming Rakuten product data: {str(e)}")
        raise

# Don't create global client instance - will be created after env is loaded
# rakuten_client = RakutenAPIClient()
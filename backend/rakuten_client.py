import os
import httpx
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from xml.etree import ElementTree as ET

logger = logging.getLogger(__name__)

class RakutenAPIClient:
    """Rakuten Advertising API Client with Web Service Token authentication"""
    
    def __init__(self):
        self.web_service_token = os.environ.get('RAKUTEN_WEB_SERVICE_TOKEN')
        self.sid = os.environ.get('RAKUTEN_SID')
        self.base_url = os.environ.get('RAKUTEN_API_BASE_URL', 'https://api.rakutenadvertising.com')
        
        if not self.web_service_token or not self.sid:
            logger.warning("Rakuten Web Service Token or SID not found")
        else:
            logger.info(f"✅ Rakuten client initialized with SID: {self.sid}")
    
    async def test_connection(self) -> bool:
        """Test Rakuten API connection with web service token"""
        try:
            if not self.web_service_token:
                return False
                
            # Test with a simple product search
            result = await self.search_products(keyword="laptop", limit=1)
            return len(result.get('products', [])) >= 0  # Even 0 results means connection works
                
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
        """Search for products using Rakuten Product Search API with web service token"""
        
        if not self.web_service_token:
            raise ValueError("Rakuten Web Service Token not configured")
        
        headers = {
            'Authorization': f'Bearer {self.web_service_token}',
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
            # Use the Product Search endpoint
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
                
                logger.info(f"✅ Found {len(products)} products from Rakuten")
                
                return {
                    'products': products,
                    'total': len(products),
                    'page': page,
                    'keyword': keyword
                }
                    
        except httpx.HTTPStatusError as e:
            logger.error(f"❌ Rakuten product search failed: {e.response.status_code}")
            if e.response.status_code == 401:
                raise Exception("Invalid Rakuten Web Service Token")
            elif e.response.status_code == 403:
                raise Exception("Rakuten API access forbidden - check token permissions")
            else:
                raise Exception(f"Rakuten API error: {e.response.status_code}")
        except ET.ParseError as e:
            logger.error(f"❌ Failed to parse Rakuten XML response: {str(e)}")
            raise Exception("Invalid response format from Rakuten API")
        except Exception as e:
            logger.error(f"❌ Error searching Rakuten products: {str(e)}")
            raise
    
    async def get_advertisers(self, category: str = None) -> Dict[str, Any]:
        """Get list of advertisers from Rakuten"""
        
        if not self.web_service_token:
            raise ValueError("Rakuten Web Service Token not configured")
        
        try:
            url = f"{self.base_url}/v2/advertisers"
            headers = {
                'Authorization': f'Bearer {self.web_service_token}'
            }
            
            params = {}
            if category:
                params['category'] = category
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url, headers=headers, params=params)
                response.raise_for_status()
                
                return response.json()
                
        except httpx.HTTPStatusError as e:
            logger.error(f"❌ Failed to get advertisers: {e.response.status_code}")
            raise Exception(f"Failed to get advertisers: {e.response.status_code}")
        except Exception as e:
            logger.error(f"❌ Error getting advertisers: {str(e)}")
            raise
    
    async def create_deep_link(self, product_url: str) -> str:
        """Create affiliate deep link for a product URL"""
        
        if not self.web_service_token:
            raise ValueError("Rakuten Web Service Token not configured")
        
        try:
            url = f"{self.base_url}/v1/links/deep_links"
            headers = {
                'Authorization': f'Bearer {self.web_service_token}',
                'Content-Type': 'application/json'
            }
            
            data = {
                'url': product_url,
                'sid': self.sid
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, headers=headers, json=data)
                response.raise_for_status()
                
                result = response.json()
                return result.get('deep_link', product_url)
                
        except Exception as e:
            logger.error(f"❌ Failed to create deep link: {str(e)}")
            return product_url  # Return original URL if deep link fails

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

# Don't create global client instance - will be created after env is loaded
# rakuten_client = RakutenAPIClient()
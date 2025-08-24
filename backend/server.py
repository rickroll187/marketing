from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import aiohttp
import asyncio
from bs4 import BeautifulSoup
import re
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# LLM Integration Setup
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Define Models
class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    price: float
    original_price: Optional[float] = None
    description: str
    image_url: Optional[str] = None
    affiliate_url: str
    source: str
    category: str
    rating: Optional[float] = None
    reviews_count: Optional[int] = None
    scraped_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    features: Optional[List[str]] = []

class ProductCreate(BaseModel):
    name: str
    price: float
    original_price: Optional[float] = None
    description: str
    image_url: Optional[str] = None
    affiliate_url: str
    source: str
    category: str
    rating: Optional[float] = None
    reviews_count: Optional[int] = None
    features: Optional[List[str]] = []

class GeneratedContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    content_type: str  # 'blog', 'social', 'video_script'
    platform: Optional[str] = None  # 'twitter', 'instagram', 'youtube', etc.
    title: str
    content: str
    hashtags: Optional[List[str]] = []
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContentGenerationRequest(BaseModel):
    product_id: str
    content_types: List[str]  # ['blog', 'social', 'video_script']
    platforms: Optional[List[str]] = []  # ['twitter', 'instagram', 'youtube']

class ScrapeRequest(BaseModel):
    urls: List[str]
    category: str

# Web Scraping Functions
async def scrape_product_data(url: str, category: str) -> Optional[Dict[str, Any]]:
    """Basic web scraper for product data"""
    try:
        async with aiohttp.ClientSession() as session:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            async with session.get(url, headers=headers) as response:
                if response.status != 200:
                    return None
                
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                # Generic scraping logic - adaptable to different sites
                product_data = {
                    'name': extract_product_name(soup),
                    'price': extract_price(soup),
                    'description': extract_description(soup),
                    'image_url': extract_image_url(soup, url),
                    'rating': extract_rating(soup),
                    'reviews_count': extract_reviews_count(soup),
                    'features': extract_features(soup),
                    'affiliate_url': url,
                    'source': extract_domain(url),
                    'category': category
                }
                
                return product_data
                
    except Exception as e:
        logging.error(f"Error scraping {url}: {str(e)}")
        return None

def extract_product_name(soup):
    """Extract product name from various common selectors"""
    selectors = [
        'h1[data-automation-id="product-title"]',
        'h1.x-item-title-label',
        '.product-title h1',
        'h1.product-name',
        'h1.pdp-product-name',
        'h1',
        '.title'
    ]
    
    for selector in selectors:
        element = soup.select_one(selector)
        if element:
            return element.get_text().strip()
    return "Unknown Product"

def extract_price(soup):
    """Extract price from various common selectors"""
    price_selectors = [
        '.price-current',
        '.price .current',
        '.price-now',
        '.current-price',
        '.sale-price',
        '[data-testid="price"]',
        '.price'
    ]
    
    for selector in price_selectors:
        element = soup.select_one(selector)
        if element:
            price_text = element.get_text().strip()
            # Extract numeric value
            price_match = re.search(r'[\d,]+\.?\d*', price_text.replace(',', ''))
            if price_match:
                return float(price_match.group())
    return 0.0

def extract_description(soup):
    """Extract product description"""
    desc_selectors = [
        '.product-description',
        '.description',
        '.product-details',
        '.overview',
        'meta[name="description"]'
    ]
    
    for selector in desc_selectors:
        element = soup.select_one(selector)
        if element:
            if element.name == 'meta':
                return element.get('content', '')[:500]
            return element.get_text().strip()[:500]
    return "No description available"

def extract_image_url(soup, base_url):
    """Extract main product image"""
    img_selectors = [
        '.product-image img',
        '.main-image img',
        '.hero-image img',
        'img[data-testid="product-image"]'
    ]
    
    for selector in img_selectors:
        element = soup.select_one(selector)
        if element:
            src = element.get('src') or element.get('data-src')
            if src:
                if src.startswith('//'):
                    return 'https:' + src
                elif src.startswith('/'):
                    domain = extract_domain(base_url)
                    return f"https://{domain}{src}"
                return src
    return None

def extract_rating(soup):
    """Extract product rating"""
    rating_selectors = [
        '[data-testid="rating"]',
        '.rating',
        '.stars',
        '.review-rating'
    ]
    
    for selector in rating_selectors:
        element = soup.select_one(selector)
        if element:
            rating_text = element.get_text().strip()
            rating_match = re.search(r'(\d\.?\d?)', rating_text)
            if rating_match:
                return float(rating_match.group())
    return None

def extract_reviews_count(soup):
    """Extract number of reviews"""
    review_selectors = [
        '.review-count',
        '.reviews-count',
        '.rating-count'
    ]
    
    for selector in review_selectors:
        element = soup.select_one(selector)
        if element:
            count_text = element.get_text().strip()
            count_match = re.search(r'(\d+)', count_text.replace(',', ''))
            if count_match:
                return int(count_match.group())
    return None

def extract_features(soup):
    """Extract product features/specs"""
    features = []
    feature_selectors = [
        '.product-features li',
        '.specifications li',
        '.key-features li',
        '.features li'
    ]
    
    for selector in feature_selectors:
        elements = soup.select(selector)
        for element in elements[:5]:  # Limit to first 5 features
            feature = element.get_text().strip()
            if feature and len(feature) < 100:
                features.append(feature)
    
    return features

def extract_domain(url):
    """Extract domain from URL"""
    from urllib.parse import urlparse
    return urlparse(url).netloc

# Content Generation Functions
async def generate_content_with_llm(product: Dict[str, Any], content_type: str, platform: str = None) -> Dict[str, Any]:
    """Generate content using Emergent LLM"""
    try:
        # Initialize LLM chat
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"content-gen-{uuid.uuid4()}",
            system_message="You are an expert affiliate marketing content creator specializing in technology products."
        ).with_model("openai", "gpt-4o-mini")
        
        # Create content generation prompt based on type
        if content_type == 'blog':
            prompt = f"""
            Create a comprehensive blog post about this product:
            Product: {product['name']}
            Price: ${product['price']}
            Description: {product['description']}
            Features: {', '.join(product.get('features', []))}
            
            Write an engaging 800-word blog post that:
            1. Has an attention-grabbing title
            2. Explains the product benefits
            3. Highlights key features
            4. Includes a compelling call-to-action
            5. Is optimized for affiliate marketing
            
            Format as: TITLE: [title] | CONTENT: [content]
            """
        elif content_type == 'social':
            platform_specific = {
                'twitter': "Keep it under 280 characters with relevant hashtags",
                'instagram': "Create an engaging caption with emojis and hashtags",
                'facebook': "Write a compelling post that encourages engagement",
                'linkedin': "Professional tone focusing on productivity benefits"
            }
            
            platform_instruction = platform_specific.get(platform, "Create engaging social media content")
            
            prompt = f"""
            Create social media content for {platform or 'general social media'} about this product:
            Product: {product['name']}
            Price: ${product['price']}
            Description: {product['description']}
            
            {platform_instruction}
            
            Focus on benefits and create urgency. Include relevant hashtags.
            Format as: TITLE: [hook/title] | CONTENT: [post content] | HASHTAGS: [hashtags]
            """
        elif content_type == 'video_script':
            prompt = f"""
            Create a 60-second video script for this product:
            Product: {product['name']}
            Price: ${product['price']}
            Description: {product['description']}
            Features: {', '.join(product.get('features', []))}
            
            Create an engaging script with:
            1. Hook (first 5 seconds)
            2. Problem/solution presentation
            3. Product demonstration points
            4. Social proof mention
            5. Strong call-to-action
            
            Format as: TITLE: [video title] | SCRIPT: [full script with timestamps]
            """
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse the response
        content_parts = response.split(' | ')
        title = ""
        content = response
        hashtags = []
        
        for part in content_parts:
            if part.startswith('TITLE:'):
                title = part.replace('TITLE:', '').strip()
            elif part.startswith('CONTENT:'):
                content = part.replace('CONTENT:', '').strip()
            elif part.startswith('SCRIPT:'):
                content = part.replace('SCRIPT:', '').strip()
            elif part.startswith('HASHTAGS:'):
                hashtag_text = part.replace('HASHTAGS:', '').strip()
                hashtags = [tag.strip() for tag in hashtag_text.split() if tag.startswith('#')]
        
        return {
            'title': title or f"{content_type.title()} for {product['name']}",
            'content': content,
            'hashtags': hashtags,
            'content_type': content_type,
            'platform': platform
        }
        
    except Exception as e:
        logging.error(f"Error generating content: {str(e)}")
        return {
            'title': f"Error generating {content_type}",
            'content': f"Failed to generate content: {str(e)}",
            'hashtags': [],
            'content_type': content_type,
            'platform': platform
        }

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Affiliate Marketing Platform API"}

@api_router.post("/scrape", response_model=List[Product])
async def scrape_products(request: ScrapeRequest, background_tasks: BackgroundTasks):
    """Scrape products from provided URLs"""
    scraped_products = []
    
    for url in request.urls:
        product_data = await scrape_product_data(url, request.category)
        if product_data:
            product = Product(**product_data)
            # Save to database
            await db.products.insert_one(product.dict())
            scraped_products.append(product)
    
    return scraped_products

@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None, limit: int = 50):
    """Get all scraped products"""
    query = {}
    if category:
        query["category"] = category
    
    products = await db.products.find(query).sort("scraped_at", -1).limit(limit).to_list(length=None)
    return [Product(**product) for product in products]

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Get a specific product"""
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**product)

@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate):
    """Manually add a product"""
    product_obj = Product(**product.dict())
    await db.products.insert_one(product_obj.dict())
    return product_obj

@api_router.post("/generate-content")
async def generate_content(request: ContentGenerationRequest):
    """Generate marketing content for a product"""
    # Get product details
    product = await db.products.find_one({"id": request.product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    generated_contents = []
    
    for content_type in request.content_types:
        if content_type == 'social' and request.platforms:
            # Generate for each platform
            for platform in request.platforms:
                content_data = await generate_content_with_llm(product, content_type, platform)
                content_obj = GeneratedContent(
                    product_id=request.product_id,
                    content_type=content_type,
                    platform=platform,
                    title=content_data['title'],
                    content=content_data['content'],
                    hashtags=content_data['hashtags']
                )
                await db.generated_content.insert_one(content_obj.dict())
                generated_contents.append(content_obj)
        else:
            # Generate general content
            content_data = await generate_content_with_llm(product, content_type)
            content_obj = GeneratedContent(
                product_id=request.product_id,
                content_type=content_type,
                title=content_data['title'],
                content=content_data['content'],
                hashtags=content_data['hashtags']
            )
            await db.generated_content.insert_one(content_obj.dict())
            generated_contents.append(content_obj)
    
    return {"generated_content": generated_contents}

@api_router.get("/content", response_model=List[GeneratedContent])
async def get_generated_content(product_id: Optional[str] = None, content_type: Optional[str] = None, limit: int = 50):
    """Get generated content"""
    query = {}
    if product_id:
        query["product_id"] = product_id
    if content_type:
        query["content_type"] = content_type
    
    content = await db.generated_content.find(query).sort("generated_at", -1).limit(limit).to_list(length=None)
    return [GeneratedContent(**item) for item in content]

@api_router.get("/content/{content_id}", response_model=GeneratedContent)
async def get_content(content_id: str):
    """Get specific generated content"""
    content = await db.generated_content.find_one({"id": content_id})
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return GeneratedContent(**content)

@api_router.delete("/content/{content_id}")
async def delete_content(content_id: str):
    """Delete generated content"""
    result = await db.generated_content.delete_one({"id": content_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Content not found")
    return {"message": "Content deleted successfully"}

@api_router.get("/stats")
async def get_stats():
    """Get dashboard statistics"""
    total_products = await db.products.count_documents({})
    total_content = await db.generated_content.count_documents({})
    
    # Get category breakdown
    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}}
    ]
    category_stats = await db.products.aggregate(pipeline).to_list(length=None)
    
    # Get content type breakdown
    content_pipeline = [
        {"$group": {"_id": "$content_type", "count": {"$sum": 1}}}
    ]
    content_stats = await db.generated_content.aggregate(content_pipeline).to_list(length=None)
    
    return {
        "total_products": total_products,
        "total_content": total_content,
        "categories": {item["_id"]: item["count"] for item in category_stats},
        "content_types": {item["_id"]: item["count"] for item in content_stats}
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
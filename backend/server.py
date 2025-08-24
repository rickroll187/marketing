from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks, File, UploadFile
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import aiohttp
import asyncio
from bs4 import BeautifulSoup
import re
from emergentintegrations.llm.chat import LlmChat, UserMessage
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Content
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.date import DateTrigger
import json
import csv
import io

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

# Email Integration Setup
SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'noreply@example.com')

# Scheduler for content publishing
scheduler = AsyncIOScheduler()

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
    tags: Optional[List[str]] = []

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
    tags: Optional[List[str]] = []

# NEW: URL Queue Management Models
class SavedUrl(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    url: str
    title: Optional[str] = None
    category: str
    priority: str = "medium"  # high, medium, low
    notes: Optional[str] = None
    selected: bool = False
    estimated_price: Optional[float] = None
    source: Optional[str] = None
    added_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    scraped: bool = False
    scraped_at: Optional[datetime] = None

class SavedUrlCreate(BaseModel):
    url: str
    title: Optional[str] = None
    category: str
    priority: str = "medium"
    notes: Optional[str] = None
    estimated_price: Optional[float] = None

class SavedUrlUpdate(BaseModel):
    selected: Optional[bool] = None
    priority: Optional[str] = None
    notes: Optional[str] = None
    category: Optional[str] = None

class BulkUrlSave(BaseModel):
    urls: List[str]
    category: str
    priority: str = "medium"
    notes: Optional[str] = None

class GeneratedContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    content_type: str  # 'blog', 'social', 'video_script', 'comparison', 'tutorial', 'review_roundup', 'seasonal', 'launch'
    platform: Optional[str] = None  # 'twitter', 'instagram', 'youtube', etc.
    title: str
    content: str
    hashtags: Optional[List[str]] = []
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    scheduled_for: Optional[datetime] = None
    published: bool = False
    published_at: Optional[datetime] = None
    performance_data: Optional[Dict[str, Any]] = {}

class ContentGenerationRequest(BaseModel):
    product_id: str
    content_types: List[str]  # ['blog', 'social', 'video_script', 'comparison', 'tutorial', 'review_roundup', 'seasonal', 'launch']
    platforms: Optional[List[str]] = []
    comparison_products: Optional[List[str]] = []  # For comparison content
    season: Optional[str] = None  # For seasonal content
    tutorial_focus: Optional[str] = None  # For tutorial content

class ScheduledPost(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    content_id: str
    platform: str
    scheduled_for: datetime
    status: str = "scheduled"  # scheduled, published, failed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EmailCampaign(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    subject: str
    content: str
    recipient_list: List[str]
    scheduled_for: Optional[datetime] = None
    sent: bool = False
    sent_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    stats: Optional[Dict[str, Any]] = {}

class PerformanceMetric(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    content_id: str
    platform: str
    metric_type: str  # views, clicks, conversions, engagement
    value: float
    recorded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ScrapeRequest(BaseModel):
    urls: List[str]
    category: str

# URL Preview Function
async def get_url_preview(url: str) -> Dict[str, Any]:
    """Get basic preview info from URL without full scraping"""
    try:
        async with aiohttp.ClientSession() as session:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            async with session.get(url, headers=headers, timeout=10) as response:
                if response.status != 200:
                    return {"title": "Unknown", "source": extract_domain(url)}
                
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                # Extract basic info
                title = extract_product_name(soup)
                source = extract_domain(url)
                estimated_price = extract_price(soup)
                
                return {
                    "title": title,
                    "source": source,
                    "estimated_price": estimated_price if estimated_price > 0 else None
                }
                
    except Exception as e:
        logging.error(f"Error getting preview for {url}: {str(e)}")
        return {"title": "Unknown", "source": extract_domain(url)}

# Web Scraping Functions (Enhanced)
async def scrape_product_data(url: str, category: str) -> Optional[Dict[str, Any]]:
    """Enhanced web scraper for product data"""
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
                
                # Enhanced scraping logic
                product_data = {
                    'name': extract_product_name(soup),
                    'price': extract_price(soup),
                    'original_price': extract_original_price(soup),
                    'description': extract_description(soup),
                    'image_url': extract_image_url(soup, url),
                    'rating': extract_rating(soup),
                    'reviews_count': extract_reviews_count(soup),
                    'features': extract_features(soup),
                    'tags': extract_tags(soup, category),
                    'affiliate_url': url,
                    'source': extract_domain(url),
                    'category': category
                }
                
                return product_data
                
    except Exception as e:
        logging.error(f"Error scraping {url}: {str(e)}")
        return None

def extract_original_price(soup):
    """Extract original price before discount"""
    selectors = [
        '.price-original',
        '.original-price',
        '.was-price',
        '.list-price',
        '[data-testid="original-price"]'
    ]
    
    for selector in selectors:
        element = soup.select_one(selector)
        if element:
            price_text = element.get_text().strip()
            price_match = re.search(r'[\d,]+\.?\d*', price_text.replace(',', ''))
            if price_match:
                return float(price_match.group())
    return None

def extract_tags(soup, category):
    """Extract relevant tags for the product"""
    tags = [category]
    
    # Extract from common tag locations
    tag_selectors = [
        '.product-tags span',
        '.categories a',
        '.breadcrumb a',
        '.tags .tag'
    ]
    
    for selector in tag_selectors:
        elements = soup.select(selector)
        for element in elements[:10]:  # Limit tags
            tag = element.get_text().strip().lower()
            if tag and len(tag) < 30 and tag not in tags:
                tags.append(tag)
    
    return tags

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
                return element.get('content', '')[:800]
            return element.get_text().strip()[:800]
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
        for element in elements[:8]:  # Increased limit
            feature = element.get_text().strip()
            if feature and len(feature) < 150:
                features.append(feature)
    
    return features

def extract_domain(url):
    """Extract domain from URL"""
    from urllib.parse import urlparse
    return urlparse(url).netloc

# Enhanced Content Generation Functions
async def generate_content_with_llm(product: Dict[str, Any], content_type: str, platform: str = None, **kwargs) -> Dict[str, Any]:
    """Enhanced content generation with multiple content types"""
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"content-gen-{uuid.uuid4()}",
            system_message="You are an expert affiliate marketing content creator specializing in technology products with deep knowledge of conversion optimization."
        ).with_model("openai", "gpt-4o-mini")
        
        # Enhanced content generation based on type
        if content_type == 'blog':
            prompt = f"""
            Create a comprehensive blog post about this product:
            Product: {product['name']}
            Price: ${product['price']}
            Original Price: ${product.get('original_price', 'N/A')}
            Description: {product['description']}
            Features: {', '.join(product.get('features', []))}
            Rating: {product.get('rating', 'N/A')}
            Reviews: {product.get('reviews_count', 'N/A')}
            
            Write an engaging 1200-word blog post that:
            1. Has an SEO-optimized title
            2. Explains the product benefits and use cases
            3. Highlights key features with detailed explanations
            4. Includes pros and cons analysis
            5. Compares with similar products
            6. Addresses common customer concerns
            7. Includes a compelling call-to-action with urgency
            8. Is optimized for affiliate conversions
            
            Format as: TITLE: [title] | CONTENT: [content]
            """
        elif content_type == 'comparison':
            comparison_products = kwargs.get('comparison_products', [])
            prompt = f"""
            Create a detailed product comparison post:
            Main Product: {product['name']} - ${product['price']}
            Compare with: {', '.join(comparison_products) if comparison_products else 'similar products in the category'}
            Category: {product['category']}
            Features: {', '.join(product.get('features', []))}
            
            Create a comprehensive comparison that:
            1. Has a compelling comparison title
            2. Creates a detailed feature-by-feature comparison
            3. Highlights unique selling points of each product
            4. Includes price-to-value analysis
            5. Recommends best use cases for each product
            6. Concludes with a clear winner and why
            
            Format as: TITLE: [title] | CONTENT: [content] | HASHTAGS: [hashtags]
            """
        elif content_type == 'tutorial':
            tutorial_focus = kwargs.get('tutorial_focus', 'setup and usage')
            prompt = f"""
            Create a step-by-step tutorial for this product:
            Product: {product['name']}
            Focus: {tutorial_focus}
            Features: {', '.join(product.get('features', []))}
            
            Create a detailed tutorial that:
            1. Has a clear, actionable title
            2. Lists what users will learn
            3. Provides step-by-step instructions
            4. Includes tips and best practices
            5. Addresses common troubleshooting issues
            6. Suggests advanced usage scenarios
            7. Ends with a call-to-action to purchase
            
            Format as: TITLE: [title] | CONTENT: [content]
            """
        elif content_type == 'review_roundup':
            prompt = f"""
            Create a comprehensive review roundup post:
            Product: {product['name']}
            Price: ${product['price']}
            Rating: {product.get('rating', 'N/A')}/5
            Reviews: {product.get('reviews_count', 'N/A')} reviews
            Features: {', '.join(product.get('features', []))}
            
            Create a review roundup that:
            1. Has an engaging title mentioning expert/user reviews
            2. Summarizes what experts are saying
            3. Highlights common praise points
            4. Addresses common criticisms fairly
            5. Includes user testimonials and use cases
            6. Provides an overall verdict
            7. Strong call-to-action based on reviews
            
            Format as: TITLE: [title] | CONTENT: [content]
            """
        elif content_type == 'seasonal':
            season = kwargs.get('season', 'current season')
            prompt = f"""
            Create seasonal marketing content:
            Product: {product['name']}
            Season/Event: {season}
            Price: ${product['price']}
            Category: {product['category']}
            
            Create seasonal content that:
            1. Connects the product to the season/event
            2. Highlights seasonal benefits and use cases
            3. Creates urgency with seasonal timing
            4. Mentions seasonal discounts or promotions
            5. Appeals to seasonal emotions and needs
            6. Includes seasonal hashtags and keywords
            
            Format as: TITLE: [title] | CONTENT: [content] | HASHTAGS: [hashtags]
            """
        elif content_type == 'launch':
            prompt = f"""
            Create a product launch announcement:
            Product: {product['name']}
            Price: ${product['price']}
            Features: {', '.join(product.get('features', []))}
            
            Create launch content that:
            1. Has an exciting announcement title
            2. Builds excitement about the product
            3. Highlights innovative features
            4. Creates FOMO with limited availability
            5. Includes early bird benefits
            6. Strong call-to-action to be among first buyers
            
            Format as: TITLE: [title] | CONTENT: [content] | HASHTAGS: [hashtags]
            """
        elif content_type == 'social':
            platform_specific = {
                'twitter': "Keep it under 280 characters with trending hashtags",
                'instagram': "Create an engaging caption with emojis and story hooks",
                'facebook': "Write a compelling post that encourages engagement and shares",
                'linkedin': "Professional tone focusing on productivity and business benefits",
                'tiktok': "Create viral-worthy content with trending elements"
            }
            
            platform_instruction = platform_specific.get(platform, "Create engaging social media content")
            
            prompt = f"""
            Create social media content for {platform or 'general social media'} about this product:
            Product: {product['name']}
            Price: ${product['price']}
            Description: {product['description']}
            
            {platform_instruction}
            
            Focus on benefits, create urgency, and optimize for the platform's algorithm.
            Include relevant hashtags and calls-to-action.
            Format as: TITLE: [hook/title] | CONTENT: [post content] | HASHTAGS: [hashtags]
            """
        elif content_type == 'video_script':
            prompt = f"""
            Create a compelling video script for this product:
            Product: {product['name']}
            Price: ${product['price']}
            Description: {product['description']}
            Features: {', '.join(product.get('features', []))}
            
            Create a 90-second video script with:
            1. Attention-grabbing hook (first 3 seconds)
            2. Problem identification and agitation
            3. Product introduction as solution
            4. Feature demonstration points
            5. Social proof and testimonials
            6. Price and value justification
            7. Strong call-to-action with urgency
            8. Visual cues and transitions
            
            Format as: TITLE: [video title] | SCRIPT: [full script with timestamps and visual cues]
            """
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse the enhanced response
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
            'title': title or f"{content_type.replace('_', ' ').title()} for {product['name']}",
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

# Email Marketing Functions
async def send_email_campaign(campaign: EmailCampaign):
    """Send email campaign using SendGrid"""
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        
        for recipient in campaign.recipient_list:
            message = Mail(
                from_email=SENDER_EMAIL,
                to_emails=recipient,
                subject=campaign.subject,
                html_content=campaign.content
            )
            
            response = sg.send(message)
            
        # Update campaign status
        campaign.sent = True
        campaign.sent_at = datetime.now(timezone.utc)
        
        await db.email_campaigns.update_one(
            {"id": campaign.id},
            {"$set": campaign.dict()}
        )
        
        return True
        
    except Exception as e:
        logging.error(f"Error sending email campaign: {str(e)}")
        return False

# Social Media Export Functions
async def generate_social_media_export(content_list: List[GeneratedContent], platform: str) -> str:
    """Generate CSV export for social media posting tools"""
    output = io.StringIO()
    
    if platform == 'twitter':
        fieldnames = ['Date', 'Time', 'Tweet', 'Media', 'Hashtags']
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        
        for content in content_list:
            if content.platform == 'twitter' or content.platform is None:
                scheduled_date = content.scheduled_for or datetime.now(timezone.utc)
                writer.writerow({
                    'Date': scheduled_date.strftime('%Y-%m-%d'),
                    'Time': scheduled_date.strftime('%H:%M'),
                    'Tweet': content.content[:280],  # Twitter limit
                    'Media': '',
                    'Hashtags': ' '.join(content.hashtags[:10])  # Limit hashtags
                })
    
    elif platform == 'instagram':
        fieldnames = ['Date', 'Time', 'Caption', 'Image URL', 'Hashtags']
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        
        for content in content_list:
            if content.platform == 'instagram' or content.platform is None:
                scheduled_date = content.scheduled_for or datetime.now(timezone.utc)
                # Get product for image
                product = await db.products.find_one({"id": content.product_id})
                writer.writerow({
                    'Date': scheduled_date.strftime('%Y-%m-%d'),
                    'Time': scheduled_date.strftime('%H:%M'),
                    'Caption': content.content[:2200],  # Instagram limit
                    'Image URL': product.get('image_url', '') if product else '',
                    'Hashtags': ' '.join(content.hashtags[:30])  # Instagram limit
                })
    
    return output.getvalue()

# Scheduler Functions
async def schedule_content_publishing():
    """Check and publish scheduled content"""
    now = datetime.now(timezone.utc)
    
    # Find content scheduled to be published
    scheduled_content = await db.generated_content.find({
        "scheduled_for": {"$lte": now},
        "published": False
    }).to_list(length=None)
    
    for content_data in scheduled_content:
        content = GeneratedContent(**content_data)
        
        # Mark as published (in real implementation, this would actually post to social media)
        content.published = True
        content.published_at = now
        
        await db.generated_content.update_one(
            {"id": content.id},
            {"$set": content.dict()}
        )
        
        # Record performance metric placeholder
        metric = PerformanceMetric(
            content_id=content.id,
            platform=content.platform or "general",
            metric_type="scheduled_publish",
            value=1.0
        )
        
        await db.performance_metrics.insert_one(metric.dict())

# NEW: URL Queue Management API Routes
@api_router.post("/saved-urls", response_model=SavedUrl)
async def save_url(url_data: SavedUrlCreate):
    """Save a URL to the queue for later processing"""
    # Get preview info
    preview = await get_url_preview(url_data.url)
    
    saved_url = SavedUrl(
        **url_data.dict(),
        title=url_data.title or preview.get('title', 'Unknown'),
        source=preview.get('source'),
        estimated_price=url_data.estimated_price or preview.get('estimated_price')
    )
    
    await db.saved_urls.insert_one(saved_url.dict())
    return saved_url

@api_router.post("/saved-urls/bulk", response_model=List[SavedUrl])
async def save_urls_bulk(bulk_data: BulkUrlSave):
    """Save multiple URLs at once"""
    saved_urls = []
    
    for url in bulk_data.urls:
        if url.strip():  # Skip empty URLs
            # Get preview info
            preview = await get_url_preview(url.strip())
            
            saved_url = SavedUrl(
                url=url.strip(),
                category=bulk_data.category,
                priority=bulk_data.priority,
                notes=bulk_data.notes,
                title=preview.get('title', 'Unknown'),
                source=preview.get('source'),
                estimated_price=preview.get('estimated_price')
            )
            
            await db.saved_urls.insert_one(saved_url.dict())
            saved_urls.append(saved_url)
    
    return saved_urls

@api_router.get("/saved-urls", response_model=List[SavedUrl])
async def get_saved_urls(
    category: Optional[str] = None,
    priority: Optional[str] = None,
    scraped: Optional[bool] = None,
    selected: Optional[bool] = None,
    limit: int = 1000  # Increased from 100 to 1000
):
    """Get saved URLs with optional filters - NO LIMITS!"""
    query = {}
    if category:
        query["category"] = category
    if priority:
        query["priority"] = priority
    if scraped is not None:
        query["scraped"] = scraped
    if selected is not None:
        query["selected"] = selected
    
    # Remove the limit entirely for unlimited URLs
    urls = await db.saved_urls.find(query).sort("added_at", -1).to_list(length=None)
    return [SavedUrl(**url) for url in urls]

@api_router.put("/saved-urls/{url_id}", response_model=SavedUrl)
async def update_saved_url(url_id: str, update_data: SavedUrlUpdate):
    """Update a saved URL (select/unselect, change priority, etc.)"""
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    
    result = await db.saved_urls.update_one(
        {"id": url_id},
        {"$set": update_dict}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="URL not found")
    
    updated_url = await db.saved_urls.find_one({"id": url_id})
    return SavedUrl(**updated_url)

@api_router.post("/saved-urls/select-all")
async def select_all_urls(category: Optional[str] = None):
    """Select all URLs (optionally by category)"""
    query = {}
    if category:
        query["category"] = category
    
    result = await db.saved_urls.update_many(
        query,
        {"$set": {"selected": True}}
    )
    
    return {"message": f"Selected {result.modified_count} URLs"}

@api_router.post("/saved-urls/unselect-all")
async def unselect_all_urls():
    """Unselect all URLs"""
    result = await db.saved_urls.update_many(
        {},
        {"$set": {"selected": False}}
    )
    
    return {"message": f"Unselected {result.modified_count} URLs"}

@api_router.delete("/saved-urls/{url_id}")
async def delete_saved_url(url_id: str):
    """Delete a saved URL"""
    result = await db.saved_urls.delete_one({"id": url_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="URL not found")
    return {"message": "URL deleted successfully"}

@api_router.post("/saved-urls/scrape-selected")
async def scrape_selected_urls():
    """Scrape all selected URLs and create products"""
    # Get selected URLs
    selected_urls = await db.saved_urls.find({"selected": True, "scraped": False}).to_list(length=None)
    
    if not selected_urls:
        return {"message": "No URLs selected for scraping", "scraped_products": []}
    
    scraped_products = []
    
    for url_data in selected_urls:
        url_obj = SavedUrl(**url_data)
        
        # Scrape the product
        product_data = await scrape_product_data(url_obj.url, url_obj.category)
        
        if product_data:
            # Create product
            product = Product(**product_data)
            await db.products.insert_one(product.dict())
            scraped_products.append(product)
            
            # Mark URL as scraped
            await db.saved_urls.update_one(
                {"id": url_obj.id},
                {"$set": {"scraped": True, "scraped_at": datetime.now(timezone.utc)}}
            )
    
    return {
        "message": f"Successfully scraped {len(scraped_products)} products",
        "scraped_products": scraped_products
    }

# API Routes (Existing ones remain the same)
@api_router.get("/")
async def root():
    return {"message": "Advanced Affiliate Marketing Platform API with URL Management"}

@api_router.post("/scrape", response_model=List[Product])
async def scrape_products(request: ScrapeRequest, background_tasks: BackgroundTasks):
    """Scrape products from provided URLs (original direct method)"""
    scraped_products = []
    
    for url in request.urls:
        product_data = await scrape_product_data(url, request.category)
        if product_data:
            product = Product(**product_data)
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
    """Generate enhanced marketing content for a product"""
    product = await db.products.find_one({"id": request.product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    generated_contents = []
    
    for content_type in request.content_types:
        if content_type == 'social' and request.platforms:
            for platform in request.platforms:
                content_data = await generate_content_with_llm(
                    product, content_type, platform,
                    comparison_products=request.comparison_products,
                    season=request.season,
                    tutorial_focus=request.tutorial_focus
                )
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
            content_data = await generate_content_with_llm(
                product, content_type,
                comparison_products=request.comparison_products,
                season=request.season,
                tutorial_focus=request.tutorial_focus
            )
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
async def get_generated_content(
    product_id: Optional[str] = None,
    content_type: Optional[str] = None,
    platform: Optional[str] = None,
    limit: int = 50
):
    """Get generated content with filters"""
    query = {}
    if product_id:
        query["product_id"] = product_id
    if content_type:
        query["content_type"] = content_type
    if platform:
        query["platform"] = platform
    
    content = await db.generated_content.find(query).sort("generated_at", -1).limit(limit).to_list(length=None)
    return [GeneratedContent(**item) for item in content]

@api_router.post("/schedule-content/{content_id}")
async def schedule_content(content_id: str, scheduled_for: datetime):
    """Schedule content for publishing"""
    result = await db.generated_content.update_one(
        {"id": content_id},
        {"$set": {"scheduled_for": scheduled_for}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Content not found")
    
    return {"message": "Content scheduled successfully"}

@api_router.get("/content/export/{platform}")
async def export_social_media_content(platform: str):
    """Export content for social media scheduling tools"""
    content = await db.generated_content.find({
        "$or": [
            {"platform": platform},
            {"platform": None, "content_type": "social"}
        ]
    }).to_list(length=None)
    
    content_list = [GeneratedContent(**item) for item in content]
    csv_data = await generate_social_media_export(content_list, platform)
    
    return {
        "platform": platform,
        "csv_data": csv_data,
        "filename": f"{platform}_content_export.csv"
    }

@api_router.post("/email-campaigns", response_model=EmailCampaign)
async def create_email_campaign(campaign_data: dict):
    """Create email marketing campaign"""
    campaign = EmailCampaign(**campaign_data)
    await db.email_campaigns.insert_one(campaign.dict())
    
    # Schedule campaign if needed
    if campaign.scheduled_for:
        scheduler.add_job(
            send_email_campaign,
            DateTrigger(run_date=campaign.scheduled_for),
            args=[campaign],
            id=f"email_campaign_{campaign.id}"
        )
    else:
        # Send immediately
        await send_email_campaign(campaign)
    
    return campaign

@api_router.get("/email-campaigns", response_model=List[EmailCampaign])
async def get_email_campaigns():
    """Get all email campaigns"""
    campaigns = await db.email_campaigns.find().sort("created_at", -1).to_list(length=None)
    return [EmailCampaign(**campaign) for campaign in campaigns]

@api_router.post("/performance-metrics")
async def record_performance_metric(metric_data: dict):
    """Record performance metrics"""
    metric = PerformanceMetric(**metric_data)
    await db.performance_metrics.insert_one(metric.dict())
    return {"message": "Metric recorded successfully"}

@api_router.get("/analytics")
async def get_analytics(
    content_id: Optional[str] = None,
    platform: Optional[str] = None,
    metric_type: Optional[str] = None,
    days: int = 30
):
    """Get performance analytics"""
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    query = {"recorded_at": {"$gte": start_date}}
    if content_id:
        query["content_id"] = content_id
    if platform:
        query["platform"] = platform
    if metric_type:
        query["metric_type"] = metric_type
    
    metrics = await db.performance_metrics.find(query).to_list(length=None)
    
    # Aggregate metrics
    analytics = {}
    for metric in metrics:
        key = f"{metric['platform']}_{metric['metric_type']}"
        if key not in analytics:
            analytics[key] = {"total": 0, "count": 0, "average": 0}
        
        analytics[key]["total"] += metric["value"]
        analytics[key]["count"] += 1
        analytics[key]["average"] = analytics[key]["total"] / analytics[key]["count"]
    
    return {
        "period_days": days,
        "total_metrics": len(metrics),
        "analytics": analytics
    }

@api_router.get("/stats")
async def get_stats():
    """Get enhanced dashboard statistics"""
    total_products = await db.products.count_documents({})
    total_content = await db.generated_content.count_documents({})
    total_campaigns = await db.email_campaigns.count_documents({})
    scheduled_content = await db.generated_content.count_documents({"scheduled_for": {"$exists": True}})
    saved_urls_count = await db.saved_urls.count_documents({})
    selected_urls_count = await db.saved_urls.count_documents({"selected": True})
    
    # Category breakdown
    category_pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}}
    ]
    category_stats = await db.products.aggregate(category_pipeline).to_list(length=None)
    
    # Content type breakdown
    content_pipeline = [
        {"$group": {"_id": "$content_type", "count": {"$sum": 1}}}
    ]
    content_stats = await db.generated_content.aggregate(content_pipeline).to_list(length=None)
    
    # Platform breakdown
    platform_pipeline = [
        {"$group": {"_id": "$platform", "count": {"$sum": 1}}}
    ]
    platform_stats = await db.generated_content.aggregate(platform_pipeline).to_list(length=None)
    
    return {
        "total_products": total_products,
        "total_content": total_content,
        "total_campaigns": total_campaigns,
        "scheduled_content": scheduled_content,
        "saved_urls": saved_urls_count,
        "selected_urls": selected_urls_count,
        "categories": {item["_id"]: item["count"] for item in category_stats},
        "content_types": {item["_id"]: item["count"] for item in content_stats},
        "platforms": {item["_id"] or "general": item["count"] for item in platform_stats}
    }

@api_router.delete("/content/{content_id}")
async def delete_content(content_id: str):
    """Delete generated content"""
    result = await db.generated_content.delete_one({"id": content_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Content not found")
    return {"message": "Content deleted successfully"}

# Initialize scheduler
@app.on_event("startup")
async def startup_event():
    scheduler.start()
    
    # Schedule recurring jobs
    scheduler.add_job(
        schedule_content_publishing,
        'interval',
        minutes=5,  # Check every 5 minutes
        id='content_publisher'
    )

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
    scheduler.shutdown()
    client.close()
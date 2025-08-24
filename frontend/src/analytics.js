import gtag from 'gtag';
import ReactPixel from 'react-facebook-pixel';

// Analytics Configuration
const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;
const FACEBOOK_PIXEL_ID = process.env.REACT_APP_FACEBOOK_PIXEL_ID;

// Initialize Google Analytics
export const initGA = () => {
  if (GA_MEASUREMENT_ID) {
    gtag('config', GA_MEASUREMENT_ID, {
      page_title: 'Affiliate Marketing Platform',
      page_location: window.location.href,
    });
    console.log('✅ Google Analytics initialized:', GA_MEASUREMENT_ID);
  } else {
    console.warn('⚠️ Google Analytics ID not found in environment variables');
  }
};

// Initialize Facebook Pixel
export const initFacebookPixel = () => {
  if (FACEBOOK_PIXEL_ID) {
    ReactPixel.init(FACEBOOK_PIXEL_ID, {
      autoConfig: true,
      debug: false,
    });
    ReactPixel.pageView();
    console.log('✅ Facebook Pixel initialized:', FACEBOOK_PIXEL_ID);
  } else {
    console.warn('⚠️ Facebook Pixel ID not found in environment variables');
  }
};

// Google Analytics Event Tracking
export const trackEvent = (action, category, label, value) => {
  gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Facebook Pixel Event Tracking
export const trackPixelEvent = (event, parameters = {}) => {
  ReactPixel.track(event, parameters);
};

// Affiliate Marketing Specific Events
export const trackProductView = (product) => {
  // Google Analytics
  trackEvent('view_item', 'product', product.name, product.price);
  
  // Facebook Pixel
  trackPixelEvent('ViewContent', {
    content_name: product.name,
    content_category: product.category,
    content_ids: [product.id],
    content_type: 'product',
    value: product.price,
    currency: 'USD',
  });
};

export const trackProductClick = (product) => {
  // Google Analytics
  trackEvent('select_content', 'product_click', product.name, product.price);
  
  // Facebook Pixel
  trackPixelEvent('AddToWishlist', {
    content_name: product.name,
    content_category: product.category,
    content_ids: [product.id],
    value: product.price,
    currency: 'USD',
  });
};

export const trackContentGeneration = (contentType, productName) => {
  // Google Analytics
  trackEvent('generate_content', 'content_creation', `${contentType}_${productName}`);
  
  // Facebook Pixel
  trackPixelEvent('CompleteRegistration', {
    content_name: `Generated ${contentType}`,
    content_category: 'content_creation',
  });
};

export const trackEmailCampaign = (campaignName, recipientCount) => {
  // Google Analytics
  trackEvent('email_sent', 'email_marketing', campaignName, recipientCount);
  
  // Facebook Pixel
  trackPixelEvent('Contact', {
    content_name: campaignName,
    value: recipientCount,
  });
};

export const trackSocialPost = (platform, contentType) => {
  // Google Analytics
  trackEvent('social_post', 'social_media', `${platform}_${contentType}`);
  
  // Facebook Pixel
  trackPixelEvent('Share', {
    content_name: `${platform} post`,
    content_category: contentType,
  });
};

export const trackPriceAlert = (productName, oldPrice, newPrice) => {
  const savings = oldPrice - newPrice;
  
  // Google Analytics
  trackEvent('price_alert', 'price_tracking', productName, savings);
  
  // Facebook Pixel
  trackPixelEvent('Purchase', {
    content_name: productName,
    value: savings,
    currency: 'USD',
  });
};

export const trackCompetitorAnalysis = (competitorCount) => {
  // Google Analytics
  trackEvent('competitor_analysis', 'intelligence', 'competitors_analyzed', competitorCount);
  
  // Facebook Pixel
  trackPixelEvent('Search', {
    search_string: 'competitor_analysis',
    content_category: 'business_intelligence',
  });
};

// Page View Tracking
export const trackPageView = (pageName) => {
  // Google Analytics
  gtag('config', GA_MEASUREMENT_ID, {
    page_title: pageName,
    page_location: window.location.href,
  });
  
  // Facebook Pixel
  ReactPixel.pageView();
};

// Conversion Tracking (for affiliate link clicks)
export const trackConversion = (product, conversionValue) => {
  // Google Analytics Enhanced Ecommerce
  gtag('event', 'purchase', {
    transaction_id: `affiliate_${product.id}_${Date.now()}`,
    value: conversionValue,
    currency: 'USD',
    items: [{
      item_id: product.id,
      item_name: product.name,
      category: product.category,
      quantity: 1,
      price: conversionValue,
    }],
  });
  
  // Facebook Pixel Conversion
  trackPixelEvent('Purchase', {
    content_name: product.name,
    content_ids: [product.id],
    content_type: 'product',
    value: conversionValue,
    currency: 'USD',
  });
};
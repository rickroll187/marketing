// Google Analytics 4 - Direct Implementation (No external packages needed)
const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;

// Load Google Analytics script
export const initGA = () => {
  if (GA_MEASUREMENT_ID) {
    // Add Google Analytics script to head
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script1);

    // Add gtag configuration
    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_MEASUREMENT_ID}');
    `;
    document.head.appendChild(script2);
    
    // Make gtag available globally
    window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
    
    console.log('✅ Google Analytics initialized:', GA_MEASUREMENT_ID);
  } else {
    console.warn('⚠️ Google Analytics ID not found in environment variables');
  }
};

// Initialize Facebook Pixel (simplified - no external package)
export const initFacebookPixel = () => {
  // Skip Facebook for now since it's causing issues
  console.log('🚫 Facebook Pixel skipped');
};

// Google Analytics Event Tracking
export const trackEvent = (action, category, label, value) => {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Simplified tracking functions
export const trackProductView = (product) => {
  trackEvent('view_item', 'product', product.name, product.price);
};

export const trackProductClick = (product) => {
  trackEvent('click', 'affiliate_link', product.name, product.price);
};

export const trackContentGeneration = (contentType, productName) => {
  trackEvent('generate_content', 'ai', `${contentType}_${productName}`);
};

export const trackEmailCampaign = (campaignName, recipientCount) => {
  trackEvent('email_sent', 'marketing', campaignName, recipientCount);
};

export const trackSocialPost = (platform, contentType) => {
  trackEvent('social_post', 'marketing', `${platform}_${contentType}`);
};

export const trackPriceAlert = (productName, oldPrice, newPrice) => {
  const savings = oldPrice - newPrice;
  trackEvent('price_alert', 'automation', productName, savings);
};

export const trackCompetitorAnalysis = (competitorCount) => {
  trackEvent('competitor_analysis', 'intelligence', 'analysis_complete', competitorCount);
};

export const trackPageView = (pageName) => {
  if (window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_title: pageName,
      page_location: window.location.href,
    });
  }
};

export const trackConversion = (product, conversionValue) => {
  if (window.gtag) {
    window.gtag('event', 'purchase', {
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
  }
};
import React, { useState, useCallback, memo } from 'react';

/**
 * IsolatedScraperInput - Isolated scraper input component
 * Uses its own internal state to prevent React reconciliation issues
 */
const IsolatedScraperInput = memo(({ 
  onScrapeSubmit,
  placeholder = '',
  rows = 10 
}) => {
  // Internal state completely isolated from parent
  const [internalUrls, setInternalUrls] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Stable internal handlers
  const handleUrlsChange = useCallback((e) => {
    setInternalUrls(e.target.value);
  }, []);
  
  const handleCategoryChange = useCallback((value) => {
    setCategory(value);
  }, []);
  
  const handleSubmit = useCallback(async () => {
    if (!internalUrls.trim() || !category.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const urls = internalUrls.split('\n').filter(url => url.trim());
      
      if (onScrapeSubmit) {
        await onScrapeSubmit({
          urls,
          category
        });
        
        // Clear form on success
        setInternalUrls('');
        setCategory('');
      }
    } catch (error) {
      console.error('Failed to scrape URLs:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [internalUrls, category, onScrapeSubmit, isSubmitting]);
  
  const urlCount = internalUrls.split('\n').filter(url => url.trim()).length;
  
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Product URLs (one per line)</label>
        <textarea
          placeholder={placeholder}
          value={internalUrls}
          onChange={handleUrlsChange}
          rows={rows}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
        />
        <p className="text-xs text-gray-600 mt-1">
          URLs to scrape: {urlCount}
        </p>
      </div>
      
      <div>
        <label className="text-sm font-medium mb-2 block">Category</label>
        <select 
          value={category} 
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">Select category</option>
          <option value="smartphones">Smartphones</option>
          <option value="laptops">Laptops</option>
          <option value="headphones">Headphones</option>
          <option value="gaming">Gaming</option>
          <option value="software">Software</option>
          <option value="accessories">Accessories</option>
          <option value="tablets">Tablets</option>
          <option value="smartwatches">Smart Watches</option>
          <option value="cameras">Cameras</option>
        </select>
      </div>
      
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !internalUrls.trim() || !category}
        className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? (
          `Scraping ${urlCount} URLs...`
        ) : (
          `🔍 Scrape ${urlCount} Products`
        )}
      </button>
    </div>
  );
}, () => true); // Never re-render from parent

IsolatedScraperInput.displayName = 'IsolatedScraperInput';

export default IsolatedScraperInput;
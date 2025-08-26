import React, { useState, useCallback, memo } from 'react';

/**
 * IsolatedUrlInput - Completely isolated from parent App state management
 * Uses its own internal state and communicates via callbacks only when needed
 */
const IsolatedUrlInput = memo(({ 
  onUrlsSubmit, 
  initialValue = '',
  placeholder = '',
  rows = 6 
}) => {
  // Internal state completely isolated from parent
  const [internalValue, setInternalValue] = useState(initialValue);
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Stable internal handlers
  const handleTextChange = useCallback((e) => {
    setInternalValue(e.target.value);
  }, []);
  
  const handleCategoryChange = useCallback((e) => {
    setCategory(e.target.value);
  }, []);
  
  const handlePriorityChange = useCallback((e) => {
    setPriority(e.target.value);
  }, []);
  
  const handleNotesChange = useCallback((e) => {
    setNotes(e.target.value);
  }, []);
  
  const handleSubmit = useCallback(async () => {
    if (!internalValue.trim() || !category.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const urls = internalValue.split('\n').filter(url => url.trim());
      
      if (onUrlsSubmit) {
        await onUrlsSubmit({
          urls,
          category,
          priority,
          notes: notes || null
        });
        
        // Clear form on success
        setInternalValue('');
        setCategory('');
        setPriority('medium');
        setNotes('');
      }
    } catch (error) {
      console.error('Failed to submit URLs:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [internalValue, category, priority, notes, onUrlsSubmit, isSubmitting]);
  
  const urlCount = internalValue.split('\n').filter(url => url.trim()).length;
  
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      <h3 className="font-semibold text-lg">📝 Add URLs to Queue (Isolated Input)</h3>
      
      <div>
        <label className="text-sm font-medium mb-2 block">Product URLs (one per line)</label>
        <textarea
          placeholder={placeholder}
          value={internalValue}
          onChange={handleTextChange}
          rows={rows}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
        />
        <p className="text-xs text-gray-600 mt-1">
          URLs detected: {urlCount}
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Category</label>
          <select 
            value={category} 
            onChange={handleCategoryChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Select category</option>
            <option value="smartphones">Smartphones</option>
            <option value="laptops">Laptops</option>
            <option value="headphones">Headphones</option>
            <option value="gaming">Gaming</option>
            <option value="software">Software</option>
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Priority</label>
          <select 
            value={priority} 
            onChange={handlePriorityChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
        <input
          type="text"
          placeholder="Black Friday deals, trending products, etc."
          value={notes}
          onChange={handleNotesChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>
      
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !internalValue.trim() || !category}
        className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? (
          `Saving ${urlCount} URLs...`
        ) : (
          `💾 Save ${urlCount} URLs to Queue`
        )}
      </button>
    </div>
  );
}, () => true); // Never re-render from parent

IsolatedUrlInput.displayName = 'IsolatedUrlInput';

export default IsolatedUrlInput;
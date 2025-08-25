import { useEffect, useRef, useState } from 'react';

/**
 * ExternalTextarea - A textarea that exists completely outside React's control
 * This component creates a textarea using direct DOM manipulation that React never touches
 */
const ExternalTextarea = ({ 
  initialValue = '', 
  onValueChange,
  placeholder = '',
  className = '',
  rows = 6 
}) => {
  const containerRef = useRef(null);
  const textareaRef = useRef(null);
  const callbackRef = useRef(onValueChange);
  const mountedRef = useRef(false);
  
  // Update callback without causing re-renders
  callbackRef.current = onValueChange;
  
  useEffect(() => {
    if (mountedRef.current || !containerRef.current) return;
    
    console.log('🚀 ExternalTextarea: Creating DOM element');
    
    // Create textarea element completely outside React
    const textarea = document.createElement('textarea');
    
    // Set basic properties
    textarea.value = initialValue;
    textarea.placeholder = placeholder;
    textarea.rows = rows;
    
    // Apply Shadcn UI classes directly
    const classes = [
      'flex', 'min-h-[80px]', 'w-full', 'rounded-md', 'border', 'border-input', 
      'bg-background', 'px-3', 'py-2', 'text-sm', 'ring-offset-background', 
      'placeholder:text-muted-foreground', 'focus-visible:outline-none', 
      'focus-visible:ring-2', 'focus-visible:ring-ring', 'focus-visible:ring-offset-2', 
      'disabled:cursor-not-allowed', 'disabled:opacity-50', 'font-mono'
    ];
    textarea.className = `${classes.join(' ')} ${className}`.trim();
    
    // Add persistent event listeners
    const handleInput = (e) => {
      console.log('📝 Input event:', e.target.value.slice(-10));
      if (callbackRef.current) {
        // Delay callback to prevent interference
        requestAnimationFrame(() => {
          callbackRef.current({ target: { value: e.target.value } });
        });
      }
    };
    
    const handleFocus = () => {
      console.log('🎯 Focus gained');
      textarea.style.outline = '2px solid hsl(var(--ring))';
      textarea.style.outlineOffset = '2px';
    };
    
    const handleBlur = () => {
      console.log('😴 Focus lost');
      textarea.style.outline = 'none';
    };
    
    // Add event listeners that will NEVER be removed
    textarea.addEventListener('input', handleInput);
    textarea.addEventListener('focus', handleFocus);  
    textarea.addEventListener('blur', handleBlur);
    
    // Insert into DOM
    containerRef.current.appendChild(textarea);
    textareaRef.current = textarea;
    mountedRef.current = true;
    
    console.log('✅ ExternalTextarea: Mounted successfully');
    
    // No cleanup function - let it live forever!
  }, []); // Empty deps - run once only
  
  // This component never re-renders after initial mount
  return <div ref={containerRef} />;
};

export default ExternalTextarea;
import { useEffect, useRef } from 'react';

/**
 * PortalTextarea - A textarea that exists outside React's component tree entirely
 * This component uses a React Portal to a separate DOM container that React never touches
 */
const PortalTextarea = ({ 
  initialValue = '', 
  onValueChange,
  placeholder = '',
  className = '',
  rows = 6 
}) => {
  const containerRef = useRef(null);
  const textareaRef = useRef(null);
  const portalContainerRef = useRef(null);
  const valueRef = useRef(initialValue);
  const callbackRef = useRef(onValueChange);
  
  // Update refs without causing re-renders
  callbackRef.current = onValueChange;
  
  useEffect(() => {
    // Create a completely separate DOM container outside React's root
    const portalContainer = document.createElement('div');
    portalContainer.id = 'textarea-portal-' + Math.random().toString(36).substr(2, 9);
    
    // Insert it where the component should be
    if (containerRef.current) {
      containerRef.current.appendChild(portalContainer);
      portalContainerRef.current = portalContainer;
    }
    
    // Create textarea in the portal container  
    const textarea = document.createElement('textarea');
    textarea.value = initialValue;
    textarea.placeholder = placeholder;
    textarea.rows = rows;
    
    // Apply styling
    const classes = [
      'flex', 'min-h-[80px]', 'w-full', 'rounded-md', 'border', 'border-input', 
      'bg-background', 'px-3', 'py-2', 'text-sm', 'ring-offset-background', 
      'placeholder:text-muted-foreground', 'focus-visible:outline-none', 
      'focus-visible:ring-2', 'focus-visible:ring-ring', 'focus-visible:ring-offset-2', 
      'disabled:cursor-not-allowed', 'disabled:opacity-50', 'font-mono'
    ];
    textarea.className = `${classes.join(' ')} ${className}`.trim();
    
    // Add persistent event handlers that bypass React entirely
    const handleInput = (e) => {
      valueRef.current = e.target.value;
      console.log('🔥 PortalTextarea input:', e.target.value.slice(-10));
      
      // Call React callback on next frame to avoid conflicts
      if (callbackRef.current) {
        requestAnimationFrame(() => {
          callbackRef.current({ target: { value: valueRef.current } });
        });
      }
    };
    
    const handleFocus = () => {
      console.log('🎯 PortalTextarea focused');
    };
    
    const handleBlur = () => {
      console.log('😴 PortalTextarea blurred'); 
    };
    
    // Attach event listeners
    textarea.addEventListener('input', handleInput);
    textarea.addEventListener('focus', handleFocus);
    textarea.addEventListener('blur', handleBlur);
    
    // Insert textarea into portal
    portalContainer.appendChild(textarea);
    textareaRef.current = textarea;
    
    console.log('🚀 PortalTextarea created with portal:', portalContainer.id);
    
    // Cleanup function
    return () => {
      if (textareaRef.current) {
        textareaRef.current.removeEventListener('input', handleInput);
        textareaRef.current.removeEventListener('focus', handleFocus);
        textareaRef.current.removeEventListener('blur', handleBlur);
      }
      if (portalContainerRef.current && portalContainerRef.current.parentNode) {
        portalContainerRef.current.parentNode.removeChild(portalContainerRef.current);
      }
      console.log('🗑️ PortalTextarea cleaned up');
    };
  }, [initialValue, placeholder, rows, className]); // Only recreate if these props change
  
  // Update value when initialValue changes, but don't recreate component
  useEffect(() => {
    if (textareaRef.current && textareaRef.current.value !== initialValue) {
      // Only update if user isn't actively typing
      if (document.activeElement !== textareaRef.current) {
        textareaRef.current.value = initialValue;
        valueRef.current = initialValue;
      }
    }
  }, [initialValue]);
  
  return <div ref={containerRef} />;
};

export default PortalTextarea;
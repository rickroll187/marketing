import { useEffect, useRef } from 'react';

// NUCLEAR OPTION: Pure DOM input that completely bypasses React
const PureInput = ({ 
  placeholder, 
  onValueChange,
  defaultValue = "",
  className = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  type = "text"
}) => {
  const containerRef = useRef(null);
  const callbackRef = useRef(onValueChange);
  
  // Update callback ref without causing re-renders
  callbackRef.current = onValueChange;
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create pure DOM input
    const input = document.createElement('input');
    input.type = type;
    input.className = className;
    input.placeholder = placeholder || '';
    input.value = defaultValue || '';
    
    // Store current value in DOM element itself
    let currentValue = defaultValue || '';
    
    // Pure DOM event handler - never changes
    const handleInput = (e) => {
      currentValue = e.target.value;
      
      // Call React callback without triggering re-render
      if (callbackRef.current) {
        setTimeout(() => {
          callbackRef.current({ target: { value: currentValue } });
        }, 0);
      }
    };
    
    input.addEventListener('input', handleInput, { passive: true });
    
    // Add focus/blur handlers
    input.addEventListener('focus', () => {
      input.style.outline = '2px solid hsl(var(--ring))';
      input.style.outlineOffset = '2px';
    });
    
    input.addEventListener('blur', () => {
      input.style.outline = 'none';
    });
    
    // Insert into container
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(input);
    
    // Store input reference for external access
    containerRef.current._pureInput = input;
    
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []); // Only run once - NEVER re-render
  
  return <div ref={containerRef} />;
};

export default PureInput;
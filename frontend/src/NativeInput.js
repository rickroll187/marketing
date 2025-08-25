import React, { useEffect, useRef } from 'react';

// RADICAL FIX: Native DOM input that bypasses React rendering completely
const NativeInput = ({ 
  value, 
  onChange, 
  placeholder, 
  type = "text",
  className = "",
  ...props 
}) => {
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create native DOM input element
    const input = document.createElement('input');
    
    // Apply styles to match Shadcn UI Input component
    input.className = `flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`;
    
    // Set attributes
    input.type = type;
    input.placeholder = placeholder || '';
    input.value = value || '';
    
    // Add native event listener that NEVER loses focus
    input.addEventListener('input', (e) => {
      if (onChange) {
        onChange({
          target: {
            value: e.target.value
          }
        });
      }
    });
    
    // Handle focus/blur for better UX
    input.addEventListener('focus', () => {
      input.style.outline = '2px solid hsl(var(--ring))';
      input.style.outlineOffset = '2px';
    });
    
    input.addEventListener('blur', () => {
      input.style.outline = 'none';
    });
    
    // Clear container and add input
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(input);
    inputRef.current = input;
    
    // Cleanup function
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []); // Only run once on mount
  
  // Update value without losing focus
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== (value || '')) {
      const activeElement = document.activeElement;
      const hadFocus = activeElement === inputRef.current;
      inputRef.current.value = value || '';
      if (hadFocus) {
        inputRef.current.focus();
      }
    }
  }, [value]);
  
  return <div ref={containerRef} />;
};

export default NativeInput;
import { useEffect, useRef } from 'react';

// RADICAL FIX: Completely isolated input that NEVER loses focus
const IsolatedInput = ({ 
  value, 
  onChange, 
  placeholder, 
  type = "text",
  className = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  ...props 
}) => {
  const inputRef = useRef(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  
  // Update refs without causing re-renders
  valueRef.current = value;
  onChangeRef.current = onChange;
  
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    
    // Set initial value
    input.value = value || '';
    
    // Create isolated event handler that never changes
    const handleInput = (e) => {
      const newValue = e.target.value;
      if (onChangeRef.current) {
        onChangeRef.current({ target: { value: newValue } });
      }
    };
    
    // Add event listener once and never remove it
    input.addEventListener('input', handleInput);
    
    // Handle other events
    const handleFocus = () => {
      input.style.outline = '2px solid hsl(var(--ring))';
      input.style.outlineOffset = '2px';
    };
    
    const handleBlur = () => {
      input.style.outline = 'none';
    };
    
    input.addEventListener('focus', handleFocus);
    input.addEventListener('blur', handleBlur);
    
    // Cleanup function
    return () => {
      input.removeEventListener('input', handleInput);
      input.removeEventListener('focus', handleFocus);
      input.removeEventListener('blur', handleBlur);
    };
  }, []); // Empty dependency array - only run once!
  
  // Update value ONLY when it actually changes, without losing focus
  useEffect(() => {
    const input = inputRef.current;
    if (input && input.value !== value) {
      // Only update if user isn't currently typing
      if (document.activeElement !== input) {
        input.value = value || '';
      }
    }
  }, [value]);
  
  return (
    <input
      ref={inputRef}
      type={type}
      placeholder={placeholder}
      className={className}
      {...props}
    />
  );
};

export default IsolatedInput;
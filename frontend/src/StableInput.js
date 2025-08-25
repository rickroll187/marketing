import React, { memo, useRef, useEffect } from 'react';
import { Input } from './components/ui/input';

// Ultra-stable input component that NEVER re-renders and maintains focus
const StableInput = memo(({ 
  value, 
  onChange, 
  placeholder, 
  type = "text",
  className = "",
  ...props 
}) => {
  const inputRef = useRef(null);
  
  // Handle value changes without losing focus
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      const currentFocus = document.activeElement === inputRef.current;
      inputRef.current.value = value || '';
      if (currentFocus) {
        inputRef.current.focus();
      }
    }
  }, [value]);
  
  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };
  
  return (
    <Input
      ref={inputRef}
      type={type}
      placeholder={placeholder}
      defaultValue={value || ''}
      onChange={handleChange}
      className={className}
      {...props}
    />
  );
}, () => true); // Never re-render this component

StableInput.displayName = 'StableInput';

export default StableInput;
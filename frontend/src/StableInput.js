import React, { memo } from 'react';
import { Input } from './components/ui/input';

// Memoized input component to prevent re-renders that cause focus loss
const StableInput = memo(({ 
  value, 
  onChange, 
  placeholder, 
  type = "text",
  className = "",
  ...props 
}) => {
  return (
    <Input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
      {...props}
    />
  );
});

StableInput.displayName = 'StableInput';

export default StableInput;
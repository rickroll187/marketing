import React, { useRef, useEffect, memo, forwardRef } from 'react';

/**
 * UniversalStableInput - Completely eliminates bouncing by using refs directly
 * This is the ultimate solution for all input bouncing issues
 */
const UniversalStableInput = memo(forwardRef(({ 
  type = "text",
  placeholder = "",
  defaultValue = "",
  onChange,
  onBlur,
  className = "",
  disabled = false,
  multiline = false,
  rows = 4,
  ...props 
}, forwardedRef) => {
  const internalRef = useRef(null);
  const ref = forwardedRef || internalRef;

  // Set initial value using direct DOM manipulation
  useEffect(() => {
    if (ref.current && defaultValue) {
      ref.current.value = defaultValue;
    }
  }, [defaultValue, ref]);

  // Handle change using direct DOM access
  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  // Handle blur
  const handleBlur = (e) => {
    if (onBlur) {
      onBlur(e);
    }
  };

  if (multiline) {
    return (
      <textarea
        ref={ref}
        placeholder={placeholder}
        defaultValue={defaultValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={className}
        disabled={disabled}
        rows={rows}
        {...props}
      />
    );
  }

  return (
    <input
      ref={ref}
      type={type}
      placeholder={placeholder}
      defaultValue={defaultValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
      disabled={disabled}
      {...props}
    />
  );
}));

UniversalStableInput.displayName = 'UniversalStableInput';

export default UniversalStableInput;
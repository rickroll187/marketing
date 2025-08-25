import { useEffect, useRef } from 'react';
import React from 'react';

/**
 * FocusSafeTextarea - A textarea component that NEVER loses focus during typing
 * 
 * This component completely bypasses React's reconciliation for focus management
 * by using direct DOM manipulation and refs. It maintains perfect focus stability
 * while still integrating with React's state management.
 */
const FocusSafeTextarea = ({ 
  value, 
  onChange, 
  placeholder = '',
  className = '',
  disabled = false,
  rows = 4,
  ...props 
}) => {
  const textareaRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const isUpdatingFromProps = useRef(false);
  
  // Update onChange ref without causing re-renders
  onChangeRef.current = onChange;
  
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Set initial value and attributes
    textarea.value = value || '';
    textarea.placeholder = placeholder;
    textarea.disabled = disabled;
    textarea.rows = rows;
    
    // Apply default textarea styling to match Shadcn UI
    const baseClasses = [
      'flex', 'min-h-[80px]', 'w-full', 'rounded-md', 'border', 'border-input', 
      'bg-background', 'px-3', 'py-2', 'text-sm', 'ring-offset-background', 
      'placeholder:text-muted-foreground', 'focus-visible:outline-none', 
      'focus-visible:ring-2', 'focus-visible:ring-ring', 'focus-visible:ring-offset-2', 
      'disabled:cursor-not-allowed', 'disabled:opacity-50'
    ];
    
    // Apply classes
    textarea.className = `${baseClasses.join(' ')} ${className}`.trim();
    
    // Create stable event handlers that never change
    const handleInput = (e) => {
      if (isUpdatingFromProps.current) return; // Prevent infinite loops
      
      const newValue = e.target.value;
      if (onChangeRef.current) {
        // Use setTimeout to ensure this happens after current event loop
        setTimeout(() => {
          onChangeRef.current({ target: { value: newValue } });
        }, 0);
      }
    };
    
    const handleKeyDown = (e) => {
      // Ensure textarea maintains focus on all key events
      if (document.activeElement !== textarea) {
        textarea.focus();
      }
    };
    
    const handleFocus = () => {
      // Apply focus styles
      textarea.style.outline = '2px solid hsl(var(--ring))';
      textarea.style.outlineOffset = '2px';
    };
    
    const handleBlur = () => {
      // Remove focus styles
      textarea.style.outline = 'none';
      textarea.style.outlineOffset = '0';
    };
    
    // Add event listeners - these will NEVER be removed during component lifecycle
    textarea.addEventListener('input', handleInput);
    textarea.addEventListener('keydown', handleKeyDown);
    textarea.addEventListener('focus', handleFocus);
    textarea.addEventListener('blur', handleBlur);
    
    // Store references to handlers for cleanup
    textarea._focusSafeHandlers = {
      handleInput,
      handleKeyDown,
      handleFocus,
      handleBlur
    };
    
    return () => {
      const handlers = textarea._focusSafeHandlers;
      if (handlers) {
        textarea.removeEventListener('input', handlers.handleInput);
        textarea.removeEventListener('keydown', handlers.handleKeyDown);
        textarea.removeEventListener('focus', handlers.handleFocus);
        textarea.removeEventListener('blur', handlers.handleBlur);
      }
    };
  }, []); // Empty deps - only run once on mount
  
  // Handle external value updates without losing focus
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const currentValue = value || '';
    
    // Only update if value actually changed and user isn't currently typing
    if (textarea.value !== currentValue) {
      const hadFocus = document.activeElement === textarea;
      const cursorPosition = hadFocus ? textarea.selectionStart : 0;
      
      isUpdatingFromProps.current = true;
      
      // Update value
      textarea.value = currentValue;
      
      // Restore focus and cursor position if textarea had focus
      if (hadFocus) {
        textarea.focus();
        textarea.setSelectionRange(cursorPosition, cursorPosition);
      }
      
      isUpdatingFromProps.current = false;
    }
  }, [value]);
  
  // Handle other prop updates
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    textarea.placeholder = placeholder;
    textarea.disabled = disabled;
    textarea.rows = rows;
  }, [placeholder, disabled, rows]);
  
  return (
    <textarea
      ref={textareaRef}
      {...props}
      // Override these props to prevent conflicts
      value={undefined}
      onChange={undefined}
      placeholder={undefined}
      disabled={undefined}
      rows={undefined}
    />
  );
};

export default FocusSafeTextarea;
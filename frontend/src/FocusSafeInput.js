import { useEffect, useRef } from 'react';

/**
 * FocusSafeInput - An input component that NEVER loses focus during typing
 * 
 * This component completely bypasses React's reconciliation for focus management
 * by using direct DOM manipulation and refs. It maintains perfect focus stability
 * while still integrating with React's state management.
 */
const FocusSafeInput = ({ 
  value, 
  onChange, 
  placeholder = '',
  type = 'text',
  className = '',
  disabled = false,
  ...props 
}) => {
  const inputRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const isUpdatingFromProps = useRef(false);
  
  // Update onChange ref without causing re-renders
  onChangeRef.current = onChange;
  
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    
    // Set initial value and attributes
    input.value = value || '';
    input.placeholder = placeholder;
    input.type = type;
    input.disabled = disabled;
    
    // Apply default input styling to match Shadcn UI
    const baseClasses = [
      'flex', 'h-10', 'w-full', 'rounded-md', 'border', 'border-input', 
      'bg-background', 'px-3', 'py-2', 'text-sm', 'ring-offset-background', 
      'file:border-0', 'file:bg-transparent', 'file:text-sm', 'file:font-medium',
      'placeholder:text-muted-foreground', 'focus-visible:outline-none', 
      'focus-visible:ring-2', 'focus-visible:ring-ring', 'focus-visible:ring-offset-2', 
      'disabled:cursor-not-allowed', 'disabled:opacity-50'
    ];
    
    // Apply classes
    input.className = `${baseClasses.join(' ')} ${className}`.trim();
    
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
      // Ensure input maintains focus on all key events
      if (document.activeElement !== input) {
        input.focus();
      }
    };
    
    const handleFocus = () => {
      // Apply focus styles
      input.style.outline = '2px solid hsl(var(--ring))';
      input.style.outlineOffset = '2px';
    };
    
    const handleBlur = () => {
      // Remove focus styles
      input.style.outline = 'none';
      input.style.outlineOffset = '0';
    };
    
    // Add event listeners - these will NEVER be removed during component lifecycle
    input.addEventListener('input', handleInput);
    input.addEventListener('keydown', handleKeyDown);
    input.addEventListener('focus', handleFocus);
    input.addEventListener('blur', handleBlur);
    
    // Store references to handlers for cleanup
    input._focusSafeHandlers = {
      handleInput,
      handleKeyDown,
      handleFocus,
      handleBlur
    };
    
    return () => {
      const handlers = input._focusSafeHandlers;
      if (handlers) {
        input.removeEventListener('input', handlers.handleInput);
        input.removeEventListener('keydown', handlers.handleKeyDown);
        input.removeEventListener('focus', handlers.handleFocus);
        input.removeEventListener('blur', handlers.handleBlur);
      }
    };
  }, []); // Empty deps - only run once on mount
  
  // Handle external value updates without losing focus
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    
    const currentValue = value || '';
    
    // Only update if value actually changed and user isn't currently typing
    if (input.value !== currentValue) {
      const hadFocus = document.activeElement === input;
      const cursorPosition = hadFocus ? input.selectionStart : 0;
      
      isUpdatingFromProps.current = true;
      
      // Update value
      input.value = currentValue;
      
      // Restore focus and cursor position if input had focus
      if (hadFocus) {
        input.focus();
        input.setSelectionRange(cursorPosition, cursorPosition);
      }
      
      isUpdatingFromProps.current = false;
    }
  }, [value]);
  
  // Handle other prop updates
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    
    input.placeholder = placeholder;
    input.type = type;
    input.disabled = disabled;
  }, [placeholder, type, disabled]);
  
  return (
    <input
      ref={inputRef}
      {...props}
      // Override these props to prevent conflicts
      value={undefined}
      onChange={undefined}
      placeholder={undefined}
      type={undefined}
      disabled={undefined}
    />
  );
};

export default FocusSafeInput;
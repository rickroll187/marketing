import { useEffect, useRef, useCallback } from 'react';

/**
 * AutoFocusTextarea - A workaround for the critical focus bug
 * Automatically refocuses the textarea when focus is lost during typing
 */
const AutoFocusTextarea = ({ 
  value, 
  onChange, 
  placeholder = '',
  className = '',
  rows = 6,
  ...props 
}) => {
  const textareaRef = useRef(null);
  const lastCursorPosition = useRef(0);
  const isTyping = useRef(false);
  const refocusTimeout = useRef(null);
  
  // Track when user is actively typing
  const handleKeyDown = useCallback((e) => {
    isTyping.current = true;
    
    // Clear any pending refocus
    if (refocusTimeout.current) {
      clearTimeout(refocusTimeout.current);
    }
    
    // Store cursor position for restoration
    if (textareaRef.current) {
      lastCursorPosition.current = textareaRef.current.selectionStart;
    }
  }, []);
  
  const handleInput = useCallback((e) => {
    // Update cursor position
    lastCursorPosition.current = e.target.selectionStart;
    
    // Call parent onChange
    if (onChange) {
      onChange(e);
    }
    
    // Set up auto-refocus mechanism
    refocusTimeout.current = setTimeout(() => {
      if (textareaRef.current && isTyping.current) {
        const activeElement = document.activeElement;
        
        // If focus was lost and we're still typing, restore it
        if (activeElement !== textareaRef.current) {
          console.log('🔄 Auto-refocusing textarea');
          textareaRef.current.focus();
          
          // Restore cursor position
          try {
            textareaRef.current.setSelectionRange(
              lastCursorPosition.current, 
              lastCursorPosition.current
            );
          } catch (e) {
            // Ignore cursor position errors
          }
        }
      }
    }, 10); // Very short delay
  }, [onChange]);
  
  const handleFocus = useCallback(() => {
    console.log('🎯 Textarea focused');
    isTyping.current = false;
  }, []);
  
  const handleBlur = useCallback(() => {
    console.log('😴 Textarea blurred');
    
    // If we were typing and lost focus, try to regain it quickly
    if (isTyping.current && textareaRef.current) {
      setTimeout(() => {
        if (textareaRef.current && isTyping.current) {
          console.log('🚀 Emergency refocus after blur');
          textareaRef.current.focus();
          try {
            textareaRef.current.setSelectionRange(
              lastCursorPosition.current, 
              lastCursorPosition.current
            );
          } catch (e) {
            // Ignore cursor position errors
          }
        }
      }, 5);
    }
  }, []);
  
  const handleClick = useCallback(() => {
    isTyping.current = false;
    if (textareaRef.current) {
      lastCursorPosition.current = textareaRef.current.selectionStart;
    }
  }, []);
  
  // Stop typing detection after a pause
  useEffect(() => {
    const stopTypingTimeout = setTimeout(() => {
      isTyping.current = false;
    }, 1000);
    
    return () => clearTimeout(stopTypingTimeout);
  }, [value]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (refocusTimeout.current) {
        clearTimeout(refocusTimeout.current);
      }
    };
  }, []);
  
  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleInput}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={handleClick}
      placeholder={placeholder}
      rows={rows}
      className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono ${className}`}
      {...props}
    />
  );
};

export default AutoFocusTextarea;
// Global input focus fix
// This runs once and fixes ALL input/textarea elements in the app

let isFixApplied = false;

export const applyGlobalInputFix = () => {
  if (isFixApplied) return;
  
  console.log('🔧 Applying global input focus fix...');
  
  // Override the input event to prevent focus loss
  const originalAddEventListener = HTMLElement.prototype.addEventListener;
  
  HTMLElement.prototype.addEventListener = function(type, listener, options) {
    if ((type === 'input' || type === 'keydown') && (this.tagName === 'INPUT' || this.tagName === 'TEXTAREA')) {
      const wrappedListener = function(event) {
        const element = event.target;
        const hadFocus = document.activeElement === element;
        const cursorPosition = element.selectionStart;
        
        // Call original listener
        const result = listener.call(this, event);
        
        // Restore focus if it was lost
        if (hadFocus && document.activeElement !== element) {
          requestAnimationFrame(() => {
            element.focus();
            try {
              element.setSelectionRange(cursorPosition, cursorPosition);
            } catch (e) {
              // Ignore cursor position errors
            }
          });
        }
        
        return result;
      };
      
      return originalAddEventListener.call(this, type, wrappedListener, options);
    }
    
    return originalAddEventListener.call(this, type, listener, options);
  };
  
  // Also set up a global document listener to catch focus loss
  document.addEventListener('focusout', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
      const element = e.target;
      
      // If the focus loss happened right after typing, restore it
      setTimeout(() => {
        if (document.activeElement !== element && element.value !== element.defaultValue) {
          console.log('🔄 Restoring focus to', element.tagName.toLowerCase());
          element.focus();
        }
      }, 5);
    }
  });
  
  // Set up mutation observer to apply fix to dynamically created inputs
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          const inputs = node.querySelectorAll ? node.querySelectorAll('input, textarea') : [];
          inputs.forEach(applyInputFix);
          
          if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
            applyInputFix(node);
          }
        }
      });
    });
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Apply fix to existing inputs
  document.querySelectorAll('input, textarea').forEach(applyInputFix);
  
  isFixApplied = true;
  console.log('✅ Global input focus fix applied successfully');
};

const applyInputFix = (element) => {
  if (element._focusFixApplied) return;
  
  element.addEventListener('blur', (e) => {
    const target = e.target;
    setTimeout(() => {
      if (document.activeElement !== target && target.matches(':focus-within') === false) {
        target.focus();
      }
    }, 1);
  });
  
  element._focusFixApplied = true;
};
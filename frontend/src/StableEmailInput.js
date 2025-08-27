import React, { useRef, useCallback, memo } from 'react';

/**
 * StableEmailInput - Ultra-stable email input with minimal re-renders
 * Uses refs for all state management to prevent focus bouncing
 */
const StableEmailInput = memo(({ 
  onEmailSubmit
}) => {
  // Use refs instead of state to prevent re-renders
  const subjectRef = useRef(null);
  const contentRef = useRef(null);
  const recipientsRef = useRef(null);
  const scheduleDateRef = useRef(null);
  const isSubmittingRef = useRef(false);
  
  // Get current values from DOM directly
  const getCurrentValues = () => ({
    subject: subjectRef.current?.value || '',
    content: contentRef.current?.value || '',
    recipients: recipientsRef.current?.value || '',
    scheduleDate: scheduleDateRef.current?.value || ''
  });
  
  const updateRecipientCount = () => {
    if (recipientsRef.current) {
      const count = recipientsRef.current.value.split(',').filter(email => email.trim()).length;
      const countDisplay = document.getElementById('recipient-count');
      if (countDisplay) {
        countDisplay.textContent = `Recipients: ${count}`;
      }
    }
  };
  
  const updateSubmitButton = () => {
    const values = getCurrentValues();
    const button = document.getElementById('email-submit-btn');
    const countElement = document.getElementById('submit-btn-count');
    
    if (button && countElement) {
      const isValid = values.subject.trim() && values.content.trim() && values.recipients.trim();
      const count = values.recipients.split(',').filter(email => email.trim()).length;
      
      button.disabled = !isValid || isSubmittingRef.current;
      countElement.textContent = `(${count} recipients)`;
      
      if (isSubmittingRef.current) {
        button.innerHTML = `<span>Sending to ${count} recipients...</span>`;
      } else if (isValid) {
        button.innerHTML = `📧 Send Email Campaign <span id="submit-btn-count">(${count} recipients)</span>`;
      } else {
        button.innerHTML = `📧 Send Email Campaign <span id="submit-btn-count">(0 recipients)</span>`;
      }
    }
  };
  
  const handleSubmit = useCallback(async () => {
    const values = getCurrentValues();
    
    if (!values.subject.trim() || !values.content.trim() || !values.recipients.trim() || isSubmittingRef.current) {
      return;
    }
    
    isSubmittingRef.current = true;
    updateSubmitButton();
    
    try {
      const recipientList = values.recipients.split(',').map(email => email.trim()).filter(email => email);
      
      if (onEmailSubmit) {
        await onEmailSubmit({
          subject: values.subject,
          content: values.content,
          recipients: recipientList,
          scheduleDate: values.scheduleDate || null
        });
        
        // Clear form on success
        if (subjectRef.current) subjectRef.current.value = '';
        if (contentRef.current) contentRef.current.value = '';
        if (recipientsRef.current) recipientsRef.current.value = '';
        if (scheduleDateRef.current) scheduleDateRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to send email campaign:', error);
    } finally {
      isSubmittingRef.current = false;
      updateSubmitButton();
      updateRecipientCount();
    }
  }, [onEmailSubmit]);
  
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      <h3 className="font-semibold text-lg">📧 Create Email Campaign (Ultra-Stable)</h3>
      
      <div>
        <label className="text-sm font-medium mb-2 block">Subject Line</label>
        <input
          ref={subjectRef}
          type="text"
          placeholder="Amazing deals on tech products!"
          onChange={updateSubmitButton}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium mb-2 block">Email Content</label>
        <textarea
          ref={contentRef}
          placeholder="Your email content here..."
          onChange={updateSubmitButton}
          rows={8}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium mb-2 block">Recipients (comma-separated)</label>
        <textarea
          ref={recipientsRef}
          placeholder="user1@example.com, user2@example.com"
          onChange={() => {
            updateRecipientCount();
            updateSubmitButton();
          }}
          rows={3}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <p className="text-xs text-gray-600 mt-1">
          <span id="recipient-count">Recipients: 0</span>
        </p>
      </div>
      
      <div>
        <label className="text-sm font-medium mb-2 block">Schedule (optional)</label>
        <input
          ref={scheduleDateRef}
          type="datetime-local"
          onChange={updateSubmitButton}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>
      
      <button
        id="email-submit-btn"
        onClick={handleSubmit}
        disabled={true}
        className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        📧 Send Email Campaign <span id="submit-btn-count">(0 recipients)</span>
      </button>
    </div>
  );
}, () => true); // Never re-render this component

StableEmailInput.displayName = 'StableEmailInput';

export default StableEmailInput;
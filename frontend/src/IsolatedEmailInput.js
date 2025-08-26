import React, { useState, useCallback, memo } from 'react';

/**
 * IsolatedEmailInput - Isolated email input component
 * Uses its own internal state to prevent React reconciliation issues
 */
const IsolatedEmailInput = memo(({ 
  onEmailSubmit
}) => {
  // Internal state completely isolated from parent
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [recipients, setRecipients] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Stable internal handlers
  const handleSubjectChange = useCallback((e) => {
    setSubject(e.target.value);
  }, []);
  
  const handleContentChange = useCallback((e) => {
    setContent(e.target.value);
  }, []);
  
  const handleRecipientsChange = useCallback((e) => {
    setRecipients(e.target.value);
  }, []);
  
  const handleScheduleDateChange = useCallback((e) => {
    setScheduleDate(e.target.value);
  }, []);
  
  const handleSubmit = useCallback(async () => {
    if (!subject.trim() || !content.trim() || !recipients.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const recipientList = recipients.split(',').map(email => email.trim()).filter(email => email);
      
      if (onEmailSubmit) {
        await onEmailSubmit({
          subject,
          content,
          recipients: recipientList,
          scheduleDate: scheduleDate || null
        });
        
        // Clear form on success
        setSubject('');
        setContent('');
        setRecipients('');
        setScheduleDate('');
      }
    } catch (error) {
      console.error('Failed to send email campaign:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [subject, content, recipients, scheduleDate, onEmailSubmit, isSubmitting]);
  
  const recipientCount = recipients.split(',').filter(email => email.trim()).length;
  
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      <h3 className="font-semibold text-lg">📧 Create Email Campaign (Isolated Input)</h3>
      
      <div>
        <label className="text-sm font-medium mb-2 block">Subject Line</label>
        <input
          type="text"
          placeholder="Amazing deals on tech products!"
          value={subject}
          onChange={handleSubjectChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium mb-2 block">Email Content</label>
        <textarea
          placeholder="Your email content here..."
          value={content}
          onChange={handleContentChange}
          rows={8}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium mb-2 block">Recipients (comma-separated)</label>
        <textarea
          placeholder="user1@example.com, user2@example.com"
          value={recipients}
          onChange={handleRecipientsChange}
          rows={3}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <p className="text-xs text-gray-600 mt-1">
          Recipients: {recipientCount}
        </p>
      </div>
      
      <div>
        <label className="text-sm font-medium mb-2 block">Schedule (optional)</label>
        <input
          type="datetime-local"
          value={scheduleDate}
          onChange={handleScheduleDateChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>
      
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !subject.trim() || !content.trim() || !recipients.trim()}
        className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? (
          `Sending to ${recipientCount} recipients...`
        ) : (
          `📧 Send Email Campaign (${recipientCount} recipients)`
        )}
      </button>
    </div>
  );
}, () => true); // Never re-render from parent

IsolatedEmailInput.displayName = 'IsolatedEmailInput';

export default IsolatedEmailInput;
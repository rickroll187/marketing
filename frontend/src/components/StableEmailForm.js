import React, { useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Send, Clock, Users } from 'lucide-react';

const StableEmailForm = React.memo(({ onSubmit, loading }) => {
  const subjectRef = useRef(null);
  const contentRef = useRef(null);
  const recipientsRef = useRef(null);
  const scheduleDateRef = useRef(null);

  const handleSubmit = useCallback(() => {
    const subject = subjectRef.current?.value || '';
    const content = contentRef.current?.value || '';
    const recipients = recipientsRef.current?.value || '';
    const scheduleDate = scheduleDateRef.current?.value || '';

    if (!subject.trim() || !content.trim() || !recipients.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const recipientList = recipients.split(',').map(email => email.trim()).filter(email => email);
    
    onSubmit({
      subject,
      content,
      recipients: recipientList,
      scheduleDate: scheduleDate ? new Date(scheduleDate) : null
    });

    // Clear form after submission
    if (subjectRef.current) subjectRef.current.value = '';
    if (contentRef.current) contentRef.current.value = '';
    if (recipientsRef.current) recipientsRef.current.value = '';
    if (scheduleDateRef.current) scheduleDateRef.current.value = '';
  }, [onSubmit]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Create Email Campaign
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Subject Line *</label>
          <Input
            ref={subjectRef}
            placeholder="Enter email subject..."
            className="w-full"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Email Content *</label>
          <textarea
            ref={contentRef}
            placeholder="Write your email content here..."
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] resize-y"
            rows={6}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Recipients (comma-separated) *</label>
          <Input
            ref={recipientsRef}
            placeholder="email1@example.com, email2@example.com"
            className="w-full"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Schedule Date (Optional)</label>
          <Input
            ref={scheduleDateRef}
            type="datetime-local"
            className="w-full"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Email Campaign
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
});

StableEmailForm.displayName = 'StableEmailForm';

export default StableEmailForm;
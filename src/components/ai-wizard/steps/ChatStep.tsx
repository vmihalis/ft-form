'use client';

import { useState, useRef, useEffect } from 'react';
import type { UIMessage, ChatStatus } from 'ai';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ChatMessage } from '../ChatMessage';
import { ChatInput } from '../ChatInput';
import { TypingIndicator } from '../TypingIndicator';
import type { FormType, Audience } from '../AIFormWizard';

interface ChatStepProps {
  messages: UIMessage[];
  status: ChatStatus;
  error: Error | undefined;
  onSendMessage: (options: { text: string }) => void;
  onStop: () => void;
  onRegenerate: () => void;
  onBack: () => void;
  formType: FormType;
  audience: Audience;
  directToDraft: boolean;
  onDirectToDraftChange: (value: boolean) => void;
}

/**
 * Chat conversation step with AI assistant
 *
 * Features:
 * - Context banner showing form type and audience
 * - Scrollable message history
 * - Typing indicator during AI processing
 * - Error state with retry option
 * - Input with stop/submit buttons
 */
export function ChatStep({
  messages,
  status,
  error,
  onSendMessage,
  onStop,
  onRegenerate,
  onBack,
  formType,
  audience,
  directToDraft,
  onDirectToDraftChange,
}: ChatStepProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Derived state
  const isProcessing = status === 'submitted' || status === 'streaming';
  const isStreaming = status === 'streaming';
  const lastMessage = messages[messages.length - 1];
  const showTypingIndicator =
    isProcessing && (!lastMessage || lastMessage.role !== 'assistant');

  // Format labels
  const formTypeLabels: Record<FormType, string> = {
    application: 'Application',
    feedback: 'Feedback',
    registration: 'Registration',
    survey: 'Survey',
    other: 'Other',
  };
  const audienceLabels: Record<Audience, string> = {
    external: 'External/Public',
    internal: 'Internal/Team',
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showTypingIndicator]);

  const handleSubmit = () => {
    if (input.trim()) {
      onSendMessage({ text: input.trim() });
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      {/* Header with back button and context */}
      <div className="flex items-center justify-between pb-4 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          disabled={isProcessing}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2 text-sm text-muted-foreground">
          <span className="px-2 py-1 bg-muted rounded">
            {formTypeLabels[formType]}
          </span>
          <span className="px-2 py-1 bg-muted rounded">
            {audienceLabels[audience]}
          </span>
        </div>
      </div>

      {/* Direct-to-draft toggle (PRV-05) */}
      <div className="flex items-center justify-end gap-2 py-2 text-sm">
        <Label htmlFor="direct-draft" className="text-muted-foreground cursor-pointer">
          Skip preview
        </Label>
        <Switch
          id="direct-draft"
          checked={directToDraft}
          onCheckedChange={onDirectToDraftChange}
        />
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-2">Describe what you want in your form.</p>
            <p className="text-sm">
              The AI will ask a few clarifying questions before generating.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isStreaming={
                  isStreaming &&
                  message.id === lastMessage?.id &&
                  message.role === 'assistant'
                }
              />
            ))}
          </>
        )}
        {showTypingIndicator && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Error state */}
      {error && status === 'error' && (
        <div className="flex items-center gap-3 p-3 mb-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-destructive">Something went wrong</p>
            <p className="text-muted-foreground">
              {error.message || 'Failed to get AI response'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onRegenerate}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      )}

      {/* Input area */}
      <div className="pt-4 border-t">
        <ChatInput
          input={input}
          setInput={setInput}
          onSubmit={handleSubmit}
          disabled={isProcessing}
          onStop={onStop}
          isProcessing={isProcessing}
        />
      </div>
    </div>
  );
}

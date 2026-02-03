'use client';

import type { UIMessage } from 'ai';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: UIMessage;
  isStreaming?: boolean;
}

/**
 * Individual chat message display
 *
 * Renders user messages right-aligned with primary background,
 * assistant messages left-aligned with muted background.
 * Shows blinking cursor when streaming an assistant message.
 */
export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === 'user';

  // Extract text content from message parts
  const textContent = message.parts
    ?.filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join('') || '';

  return (
    <div
      className={cn(
        'flex',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'px-4 py-2 rounded-lg max-w-[80%] whitespace-pre-wrap',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        )}
      >
        {textContent}
        {isStreaming && !isUser && (
          <span className="inline-block w-1.5 h-4 ml-0.5 bg-current animate-pulse" />
        )}
      </div>
    </div>
  );
}

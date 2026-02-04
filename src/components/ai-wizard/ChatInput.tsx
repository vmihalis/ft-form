'use client';

import { useRef, useEffect } from 'react';
import { Send, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  onStop?: () => void;
  isProcessing?: boolean;
}

/**
 * Chat message input with submit and stop buttons
 *
 * Features:
 * - Auto-resizing textarea
 * - Enter (without Shift) submits
 * - Submit disabled when empty or disabled
 * - Stop button visible during processing
 */
export function ChatInput({
  input,
  setInput,
  onSubmit,
  disabled,
  onStop,
  isProcessing,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(80, textarea.scrollHeight)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && input.trim()) {
        onSubmit();
      }
    }
  };

  const handleSubmit = () => {
    if (!disabled && input.trim()) {
      onSubmit();
    }
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe what you want in your form..."
        disabled={disabled}
        className="resize-none min-h-[60px] sm:min-h-[80px] text-base"
      />
      <div className="flex justify-end gap-2">
        {isProcessing && onStop && (
          <Button
            type="button"
            variant="outline"
            onClick={onStop}
            className="h-11 sm:h-10"
          >
            <StopCircle className="mr-2 h-4 w-4" />
            Stop
          </Button>
        )}
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !input.trim()}
          className="h-11 sm:h-10"
        >
          <Send className="mr-2 h-4 w-4" />
          Send
        </Button>
      </div>
    </div>
  );
}

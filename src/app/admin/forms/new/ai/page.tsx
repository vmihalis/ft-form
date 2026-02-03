'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AIFormWizard } from '@/components/ai-wizard/AIFormWizard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ExternalLink, Sparkles } from 'lucide-react';

/**
 * AI Form Creation Page
 *
 * Two-phase flow:
 * 1. API key entry - User provides their OpenRouter API key
 * 2. AI Wizard - Guided form creation with AI assistance
 */
export default function AIFormPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [hasEnteredKey, setHasEnteredKey] = useState(false);

  const isValidKeyFormat = apiKey.trim().startsWith('sk-or-');

  const handleContinue = () => {
    if (isValidKeyFormat) {
      setHasEnteredKey(true);
    }
  };

  const handleComplete = (schema: unknown) => {
    // Phase 27 will handle form preview and creation
    console.log('Generated schema:', schema);
  };

  const handleCancel = () => {
    router.push('/admin/forms');
  };

  // Phase 2: Show AI Wizard after key entry
  if (hasEnteredKey) {
    return (
      <main className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <Link
              href="/admin/forms"
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              &larr; Back to Forms
            </Link>
          </div>
        </header>

        {/* Wizard */}
        <div className="mx-auto max-w-3xl px-6 py-12">
          <AIFormWizard
            apiKey={apiKey}
            onComplete={handleComplete}
            onCancel={handleCancel}
          />
        </div>
      </main>
    );
  }

  // Phase 1: API Key Entry
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <Link
            href="/admin/forms"
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            &larr; Back to Forms
          </Link>
        </div>
      </header>

      {/* API Key Entry */}
      <div className="mx-auto max-w-md px-6 py-12">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Create Form with AI</CardTitle>
            <CardDescription>
              Enter your OpenRouter API key to get started. Your key is used
              only for this session and is never stored.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="apiKey"
                className="text-sm font-medium leading-none"
              >
                OpenRouter API Key
              </label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isValidKeyFormat) {
                    handleContinue();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Your API key starts with &quot;sk-or-&quot;
              </p>
            </div>

            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              Get an API key at openrouter.ai
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleContinue}
                disabled={!isValidKeyFormat}
                className="flex-1"
              >
                Continue
              </Button>
              <Link href="/admin/forms">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

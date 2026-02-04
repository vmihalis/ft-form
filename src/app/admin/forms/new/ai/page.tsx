'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AIFormWizard } from '@/components/ai-wizard/AIFormWizard';
import type { AIFormSchemaOutput } from '@/lib/ai/schemas';
import { CreateFormModal } from '@/components/ai-wizard/CreateFormModal';

/**
 * AI Form Creation Page
 *
 * Two-phase flow:
 * 1. AI Wizard - Guided form creation with AI assistance
 * 2. Form Creation Modal - User names the form and creates it as draft
 */
export default function AIFormPage() {
  const router = useRouter();
  const [completedSchema, setCompletedSchema] = useState<AIFormSchemaOutput | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleComplete = (schema: AIFormSchemaOutput) => {
    // Store the completed schema and open the creation modal
    setCompletedSchema(schema);
    setShowCreateModal(true);
  };

  const handleCancel = () => {
    router.push('/admin/forms');
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4">
          <Link
            href="/admin/forms"
            className="text-muted-foreground hover:text-foreground text-sm inline-flex items-center h-10"
          >
            &larr; Back to Forms
          </Link>
        </div>
      </header>

      {/* Wizard */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-12">
        <AIFormWizard
          onComplete={handleComplete}
          onCancel={handleCancel}
        />
      </div>

      {/* Form Creation Modal */}
      {completedSchema && (
        <CreateFormModal
          open={showCreateModal}
          onOpenChange={(open) => {
            setShowCreateModal(open);
            // User can click "Use This Form" again if they close without completing
          }}
          schema={completedSchema}
        />
      )}
    </main>
  );
}

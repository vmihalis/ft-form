'use client';

import {
  FileText,
  MessageSquare,
  Calendar,
  ClipboardList,
  PlusCircle,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { FormType } from '../AIFormWizard';

interface FormTypeOption {
  id: FormType;
  label: string;
  icon: LucideIcon;
  description: string;
}

const FORM_TYPES: FormTypeOption[] = [
  {
    id: 'application',
    label: 'Application',
    icon: FileText,
    description: 'Collect applications for opportunities',
  },
  {
    id: 'feedback',
    label: 'Feedback',
    icon: MessageSquare,
    description: 'Gather feedback and opinions',
  },
  {
    id: 'registration',
    label: 'Registration',
    icon: Calendar,
    description: 'Event or program sign-ups',
  },
  {
    id: 'survey',
    label: 'Survey',
    icon: ClipboardList,
    description: 'Research and data collection',
  },
  {
    id: 'other',
    label: 'Other',
    icon: PlusCircle,
    description: 'Something different',
  },
];

interface FormTypeStepProps {
  value: FormType | null;
  onSelect: (type: FormType) => void;
  onCancel: () => void;
}

export function FormTypeStep({ value, onSelect, onCancel }: FormTypeStepProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold">What type of form do you need?</h2>
        <p className="text-muted-foreground mt-1">
          Select the category that best matches your form
        </p>
      </div>

      {/* Form type grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FORM_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = value === type.id;

          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onSelect(type.id)}
              className={cn(
                'flex items-start gap-3 p-4 rounded-lg border text-left transition-colors',
                'hover:border-primary hover:bg-accent',
                isSelected && 'border-primary bg-accent'
              )}
            >
              <Icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">{type.label}</div>
                <div className="text-sm text-muted-foreground">
                  {type.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => value && onSelect(value)} disabled={!value}>
          Continue
        </Button>
      </div>
    </div>
  );
}

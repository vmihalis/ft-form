'use client';

import { Globe, Users, ArrowLeft, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Audience } from '../AIFormWizard';

interface AudienceOption {
  id: Audience;
  label: string;
  icon: LucideIcon;
  description: string;
}

const AUDIENCES: AudienceOption[] = [
  {
    id: 'external',
    label: 'External / Public',
    icon: Globe,
    description: 'Anyone can fill out this form (visitors, applicants)',
  },
  {
    id: 'internal',
    label: 'Internal / Team',
    icon: Users,
    description: 'Only team members or logged-in users',
  },
];

interface AudienceStepProps {
  value: Audience | null;
  onSelect: (audience: Audience) => void;
  onBack: () => void;
}

export function AudienceStep({ value, onSelect, onBack }: AudienceStepProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold">Who will fill out this form?</h2>
        <p className="text-muted-foreground mt-1">
          This helps us tailor the form experience
        </p>
      </div>

      {/* Audience options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {AUDIENCES.map((audience) => {
          const Icon = audience.icon;
          const isSelected = value === audience.id;

          return (
            <button
              key={audience.id}
              type="button"
              onClick={() => onSelect(audience.id)}
              className={cn(
                'flex flex-col items-center gap-4 p-6 rounded-lg border text-center transition-colors',
                'hover:border-primary hover:bg-accent',
                isSelected && 'border-primary bg-accent'
              )}
            >
              <Icon className="w-10 h-10 text-primary" />
              <div>
                <div className="font-semibold text-lg">{audience.label}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {audience.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <Button onClick={() => value && onSelect(value)} disabled={!value}>
          Continue
        </Button>
      </div>
    </div>
  );
}

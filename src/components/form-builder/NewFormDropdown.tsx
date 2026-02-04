'use client';

import Link from 'next/link';
import { Plus, Sparkles, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * NewFormDropdown - Entry point for creating new forms
 *
 * Provides two options:
 * - Create Manually: Traditional form builder at /admin/forms/new
 * - Create with AI: AI-assisted form creation at /admin/forms/new/ai
 */
export function NewFormDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Form
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href="/admin/forms/new">
            <FileText className="h-4 w-4 mr-2" />
            Create Manually
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/forms/new/ai">
            <Sparkles className="h-4 w-4 mr-2" />
            Create with AI
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

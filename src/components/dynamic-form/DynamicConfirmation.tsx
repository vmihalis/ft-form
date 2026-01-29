"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface DynamicConfirmationProps {
  message?: string;
}

/**
 * DynamicConfirmation - Success step after form submission
 *
 * Displays success icon, message, and link to Frontier Tower.
 * Message comes from form schema settings.successMessage.
 */
export function DynamicConfirmation({ message }: DynamicConfirmationProps) {
  return (
    <div className="text-center py-8 sm:py-12">
      {/* Logo */}
      <div className="mx-auto mb-8 w-20 h-20 sm:w-24 sm:h-24 relative">
        <Image
          src="/logo.jpg"
          alt="Frontier Tower"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Success icon */}
      <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
      </div>

      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display">
        Submission Complete!
      </h2>

      <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
        {message || "Thank you for your submission. We will review it and get back to you soon."}
      </p>

      <div className="mt-10">
        <Button asChild variant="outline" size="lg">
          <a href="https://frontiertower.io" target="_blank" rel="noopener noreferrer">
            Visit Frontier Tower
          </a>
        </Button>
      </div>
    </div>
  );
}

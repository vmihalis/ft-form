"use client";

import Image from "next/image";

interface DynamicWelcomeProps {
  formName: string;
}

/**
 * DynamicWelcome - Generic welcome step for dynamic forms
 *
 * Displays logo, form name as headline, and generic welcome text.
 * Follows existing WelcomeStep.tsx pattern.
 */
export function DynamicWelcome({ formName }: DynamicWelcomeProps) {
  return (
    <div className="text-center py-8 sm:py-12">
      {/* Logo */}
      <div className="mx-auto mb-10 w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 relative">
        <Image
          src="/logo.jpg"
          alt="Frontier Tower"
          fill
          className="object-contain"
          priority
        />
      </div>

      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight font-display">
        {formName}
      </h1>

      <p className="mt-8 text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto px-4 leading-relaxed">
        Please complete this form to submit your application.
        Your progress is automatically saved.
      </p>
    </div>
  );
}

"use client";

import Image from "next/image";

/**
 * WelcomeStep - FORM-01
 *
 * Hero section with FT logo, headline, and introduction.
 * No form fields - just branding and context setting.
 * Navigation handled by NavigationButtons "Begin" button.
 */
export function WelcomeStep() {
  return (
    <div className="text-center py-8 sm:py-12">
      {/* FT Logo - BRAND-02 */}
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
        Submit Your Floor Proposal
      </h1>

      <p className="mt-8 text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto px-4 leading-relaxed">
        Shape the future of Frontier Tower by proposing a themed floor initiative.
        Tell us about your vision for building community at the intersection
        of frontier technology and human flourishing.
      </p>

      <p className="mt-6 text-base sm:text-lg text-muted-foreground">
        This application takes about 10-15 minutes to complete.
        Your progress is automatically saved.
      </p>
    </div>
  );
}

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
      <div className="mx-auto mb-8 w-20 h-20 sm:w-24 sm:h-24 relative">
        <Image
          src="/logo.jpg"
          alt="Frontier Tower"
          fill
          className="object-contain"
          priority
        />
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight lg:text-4xl">
        Become a Floor Lead
      </h1>

      <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
        Shape the future of Frontier Tower by leading a themed floor.
        Tell us about your vision for building community at the intersection
        of frontier technology and human flourishing.
      </p>

      <p className="mt-4 text-sm text-muted-foreground">
        This application takes about 10-15 minutes to complete.
        Your progress is automatically saved.
      </p>
    </div>
  );
}

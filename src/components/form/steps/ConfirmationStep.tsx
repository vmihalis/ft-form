"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

/**
 * ConfirmationStep - FORM-08
 *
 * Thank you message after successful form submission.
 * Shows next steps and expectations for the applicant.
 */
export function ConfirmationStep() {
  return (
    <div className="text-center py-8 sm:py-12">
      {/* FT Logo */}
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

      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display">Application Submitted!</h2>

      <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
        Thank you for submitting your proposal to Frontier Tower.
        We&apos;ve received it and will review it carefully.
      </p>

      {/* Next steps */}
      <div className="mt-10 p-6 sm:p-8 bg-muted/50 rounded-xl max-w-lg mx-auto text-left">
        <h3 className="font-semibold text-lg mb-4">What happens next?</h3>
        <ol className="space-y-3 text-base text-muted-foreground list-decimal list-inside">
          <li>Our team will review your application within 5-7 business days</li>
          <li>We may reach out with follow-up questions</li>
          <li>You&apos;ll receive a decision via email</li>
        </ol>
      </div>

      {/* External link */}
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

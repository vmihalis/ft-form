"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * ConfirmationStep - FORM-08
 *
 * Thank you message after successful form submission.
 * Shows next steps and expectations for the applicant.
 */
export function ConfirmationStep() {
  return (
    <div className="text-center py-8 sm:py-12">
      {/* Success icon */}
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
      </div>

      <h2 className="text-xl sm:text-2xl font-semibold">Application Submitted!</h2>

      <p className="mt-4 text-muted-foreground max-w-md mx-auto">
        Thank you for your interest in leading a floor at Frontier Tower.
        We&apos;ve received your application and will review it carefully.
      </p>

      {/* Next steps */}
      <div className="mt-8 p-6 bg-muted/50 rounded-lg max-w-md mx-auto text-left">
        <h3 className="font-medium mb-3">What happens next?</h3>
        <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
          <li>Our team will review your application within 5-7 business days</li>
          <li>We may reach out with follow-up questions</li>
          <li>You&apos;ll receive a decision via email</li>
        </ol>
      </div>

      {/* External link */}
      <div className="mt-8">
        <Button asChild variant="outline">
          <a href="https://frontiertower.io" target="_blank" rel="noopener noreferrer">
            Visit Frontier Tower
          </a>
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useFormContext } from "react-hook-form";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMobileKeyboard } from "@/hooks/useMobileKeyboard";
import type { ApplicationFormData } from "@/types/form";

/**
 * ApplicantInfoStep - FORM-02
 *
 * Collects applicant identity information:
 * - fullName (required)
 * - email (required, validated)
 * - linkedIn (optional URL)
 * - role (required)
 * - bio (required, min 50 chars)
 */
export function ApplicantInfoStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ApplicationFormData>();
  const { onFocus } = useMobileKeyboard();

  return (
    <div className="space-y-6">
      {/* Step header */}
      <div className="text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold">Tell us about yourself</h2>
        <p className="text-muted-foreground mt-2">
          We want to know who&apos;s behind this proposal
        </p>
      </div>

      {/* Full Name */}
      <Field data-invalid={!!errors.fullName}>
        <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
        <Input
          id="fullName"
          {...register("fullName")}
          aria-invalid={!!errors.fullName}
          placeholder="Your full name"
          onFocus={onFocus}
        />
        <FieldError>{errors.fullName?.message}</FieldError>
      </Field>

      {/* Email */}
      <Field data-invalid={!!errors.email}>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input
          id="email"
          type="email"
          {...register("email")}
          aria-invalid={!!errors.email}
          placeholder="you@example.com"
          onFocus={onFocus}
        />
        <FieldDescription>We&apos;ll use this to contact you about your application</FieldDescription>
        <FieldError>{errors.email?.message}</FieldError>
      </Field>

      {/* LinkedIn (optional) */}
      <Field data-invalid={!!errors.linkedIn}>
        <FieldLabel htmlFor="linkedIn">
          LinkedIn Profile <span className="text-muted-foreground font-normal">(optional)</span>
        </FieldLabel>
        <Input
          id="linkedIn"
          type="url"
          {...register("linkedIn")}
          aria-invalid={!!errors.linkedIn}
          placeholder="https://linkedin.com/in/yourprofile"
          onFocus={onFocus}
        />
        <FieldError>{errors.linkedIn?.message}</FieldError>
      </Field>

      {/* Role */}
      <Field data-invalid={!!errors.role}>
        <FieldLabel htmlFor="role">Current Role</FieldLabel>
        <Input
          id="role"
          {...register("role")}
          aria-invalid={!!errors.role}
          placeholder="e.g., Founder at TechCo, Research Scientist"
          onFocus={onFocus}
        />
        <FieldDescription>Your current professional role or title</FieldDescription>
        <FieldError>{errors.role?.message}</FieldError>
      </Field>

      {/* Bio */}
      <Field data-invalid={!!errors.bio}>
        <FieldLabel htmlFor="bio">Bio</FieldLabel>
        <Textarea
          id="bio"
          {...register("bio")}
          aria-invalid={!!errors.bio}
          placeholder="Tell us about your background, expertise, and what drives you..."
          rows={5}
          className="resize-none"
          onFocus={onFocus}
        />
        <FieldDescription>Tell us what makes you uniquely qualified</FieldDescription>
        <FieldError>{errors.bio?.message}</FieldError>
      </Field>
    </div>
  );
}

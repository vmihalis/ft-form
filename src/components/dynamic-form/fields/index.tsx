"use client";

import type { FormField } from "@/types/form-schema";
import { TextField } from "./TextField";
import { TextareaField } from "./TextareaField";
import { EmailField } from "./EmailField";
import { NumberField } from "./NumberField";
import { DateField } from "./DateField";
import { SelectField } from "./SelectField";
import { CheckboxField } from "./CheckboxField";
import { FileUploadField } from "./FileUploadField";

interface DynamicFieldProps {
  field: FormField;
}

export function DynamicField({ field }: DynamicFieldProps) {
  switch (field.type) {
    case "text":
      return <TextField field={field} />;
    case "url":
      // URL fields use TextField with type="text" because browser URL validation
      // is too strict (requires protocol). Zod schema handles URL validation.
      return <TextField field={field} />;
    case "email":
      return <EmailField field={field} />;
    case "textarea":
      return <TextareaField field={field} />;
    case "number":
      return <NumberField field={field} />;
    case "date":
      return <DateField field={field} />;
    case "select":
      return <SelectField field={field} />;
    case "radio":
      // Radio renders same as select for now (can enhance later)
      return <SelectField field={field} />;
    case "checkbox":
      return <CheckboxField field={field} />;
    case "file":
      return <FileUploadField field={field} />;
    default:
      // Fallback to text field for unknown types
      return <TextField field={field} />;
  }
}

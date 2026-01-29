// Form schema types for dynamic form builder

export interface FormSchema {
  steps: FormStep[];
  settings: FormSettings;
}

export interface FormStep {
  id: string;                     // Unique step identifier (e.g., "step_1")
  title: string;
  description?: string;
  fields: FormField[];
}

export interface FormField {
  id: string;                     // Unique field identifier (key for responses)
  type: FieldType;
  label: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  validation?: FieldValidation;
  options?: FieldOption[];        // For select, radio, checkbox
}

export type FieldType =
  | "text"
  | "email"
  | "url"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "radio"
  | "checkbox"
  | "file";

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;                   // For number fields
  max?: number;                   // For number fields
  pattern?: string;               // Regex pattern
  customMessage?: string;         // Custom error message
}

export interface FieldOption {
  value: string;
  label: string;
}

export interface FormSettings {
  submitButtonText: string;
  successMessage: string;
}

// Convex document types (what comes from database queries)
export interface FormDoc {
  _id: string;
  _creationTime: number;
  name: string;
  slug: string;
  description?: string;
  status: "draft" | "published" | "archived";
  draftSchema: string;            // JSON.stringify(FormSchema)
  currentVersionId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface FormVersionDoc {
  _id: string;
  _creationTime: number;
  formId: string;
  version: number;
  schema: string;                 // JSON.stringify(FormSchema) - IMMUTABLE
  publishedAt: number;
}

export interface SubmissionDoc {
  _id: string;
  _creationTime: number;
  formVersionId: string;
  data: string;                   // JSON.stringify({ [fieldId]: value })
  status: "new" | "under_review" | "accepted" | "rejected";
  submittedAt: number;
}

export interface SubmissionEditHistoryDoc {
  _id: string;
  _creationTime: number;
  submissionId: string;
  fieldId: string;                // Field ID from schema
  fieldLabel: string;             // Human-readable label at edit time
  oldValue: string;
  newValue: string;
  editedAt: number;
}

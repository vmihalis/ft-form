# Phase 22: WYSIWYG Form Builder - Research

**Researched:** 2026-01-29
**Domain:** React WYSIWYG form builder with inline editing, floating toolbar, and drag-and-drop
**Confidence:** HIGH

## Summary

Phase 22 transforms the existing three-panel form builder (Phase 14) into a true WYSIWYG experience where the builder canvas IS the form preview. The current implementation uses a `FieldPreview` component showing field metadata (icon, label, type badge) rather than actual rendered form fields. The key transformation is rendering actual `DynamicField` components in the canvas with click-to-select behavior and floating toolbars for field actions.

The existing infrastructure is solid: `@dnd-kit` for drag-and-drop, Zustand for state management, and `DynamicField` components from Phase 13 for form rendering. The main additions are:
1. **Floating Toolbar** - Using `@floating-ui/react` or `@radix-ui/react-popover` for selection-based toolbars
2. **Plus Button Insert UI** - Hover-triggered plus buttons between fields for adding new fields
3. **Inline Editing** - Click-to-edit field labels and properties directly in the canvas
4. **No Preview Toggle** - Builder canvas renders actual form fields, eliminating the preview/edit mode split

**Primary recommendation:** Transform `FormCanvas` to render `DynamicField` components wrapped in selectable containers with floating toolbars. Add "add field" buttons between fields that open a field type picker popover. Use `@radix-ui/react-popover` (already partially in project) for floating elements.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already in Project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @dnd-kit/core | ^6.3.1 | Drag-and-drop reordering | Already in use, React 19 compatible |
| @dnd-kit/sortable | ^10.0.0 | Sortable list preset | Already in use for field reordering |
| zustand | ^5.0.10 | Builder state management | Already in use for form builder state |
| react-hook-form | ^7.71.1 | Form validation context | Already in use for DynamicField components |
| motion | ^12.29.2 | Animations | Already in use for transitions |

### New Dependencies Required
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @radix-ui/react-popover | ^1.1.x | Floating toolbar, field type picker | Matches project's Radix pattern, accessible |
| @floating-ui/react | ^0.26.x | Alternative positioning (optional) | Used by Radix internally, lower-level control |

### Supporting (Already in Project)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | 0.563.0 | Icons (Edit, Trash, Copy, Plus, GripVertical) | Field toolbar actions |
| @radix-ui/react-dialog | ^1.1.15 | Already in project | Modal field type picker (alternative to popover) |
| @radix-ui/react-dropdown-menu | ^2.1.16 | Already in project | Field action menus |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @radix-ui/react-popover | @floating-ui/react directly | More control, but Radix is simpler and matches project pattern |
| Floating toolbar | Context menu (right-click) | Less discoverable, not WYSIWYG pattern |
| Plus button between fields | Drag from palette only | Less intuitive, Notion/Linear pattern is superior |
| Inline label editing | Property panel only | Breaks WYSIWYG principle, slower workflow |

**Installation:**
```bash
npx shadcn@latest add popover tooltip
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  components/
    form-builder/
      FormBuilder.tsx              # Main container (simplified: no preview toggle)
      WysiwygCanvas.tsx            # NEW: WYSIWYG form canvas replacing FormCanvas
      WysiwygField.tsx             # NEW: Selectable field wrapper with toolbar
      FieldToolbar.tsx             # NEW: Floating toolbar (edit/delete/duplicate)
      AddFieldButton.tsx           # NEW: Plus button between fields
      FieldTypePicker.tsx          # NEW: Popover with field type grid
      InlineFieldLabel.tsx         # NEW: Click-to-edit label component
      PropertyPanel.tsx            # Existing: side panel for advanced properties
      FieldPalette.tsx             # SIMPLIFIED: reference only, main add via plus buttons
      StepTabs.tsx                 # Existing: step navigation
      FormStatusActions.tsx        # Existing: save/publish actions
```

### Pattern 1: WYSIWYG Field Wrapper

**What:** Wrap each `DynamicField` in a selectable container that shows toolbar on click/hover
**When to use:** Every field in the WYSIWYG canvas

```typescript
// src/components/form-builder/WysiwygField.tsx
import { useFormBuilderStore } from "@/lib/stores/form-builder-store";
import { DynamicField } from "@/components/dynamic-form/fields";
import { FieldToolbar } from "./FieldToolbar";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import type { FormField } from "@/types/form-schema";

interface WysiwygFieldProps {
  field: FormField;
  stepIndex: number;
}

export function WysiwygField({ field, stepIndex }: WysiwygFieldProps) {
  const { selectedFieldId, selectField } = useFormBuilderStore();
  const isSelected = field.id === selectedFieldId;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group rounded-lg transition-all",
        "hover:ring-2 hover:ring-primary/30",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={(e) => {
        e.stopPropagation();
        selectField(field.id);
      }}
    >
      {/* Drag handle - absolute positioned */}
      <button
        {...attributes}
        {...listeners}
        className={cn(
          "absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100",
          "cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted"
        )}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Actual form field - WYSIWYG rendering */}
      <div className="pointer-events-none">
        <DynamicField field={field} />
      </div>

      {/* Floating toolbar on selection */}
      {isSelected && (
        <FieldToolbar
          fieldId={field.id}
          stepIndex={stepIndex}
        />
      )}
    </div>
  );
}
```

### Pattern 2: Floating Toolbar with Radix Popover

**What:** Position-aware toolbar that appears above/below selected field
**When to use:** When a field is selected, show edit/delete/duplicate actions

```typescript
// src/components/form-builder/FieldToolbar.tsx
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Copy, GripVertical } from "lucide-react";
import { useFormBuilderStore } from "@/lib/stores/form-builder-store";

interface FieldToolbarProps {
  fieldId: string;
  stepIndex: number;
}

export function FieldToolbar({ fieldId, stepIndex }: FieldToolbarProps) {
  const { removeField, getFieldById, addField, updateField } = useFormBuilderStore();
  const field = getFieldById(fieldId);

  if (!field) return null;

  const handleDuplicate = () => {
    // Create copy with new ID
    addField(stepIndex, field.type);
    // Note: would need to copy field properties to the new field
  };

  const handleDelete = () => {
    removeField(fieldId);
  };

  const handleEdit = () => {
    // Open property panel or inline editing
    // Could trigger a popover with field properties
  };

  return (
    <Popover open={true}>
      <PopoverAnchor asChild>
        <div className="absolute inset-0" />
      </PopoverAnchor>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={8}
        className="w-auto p-1 flex gap-1"
      >
        <Button variant="ghost" size="icon" onClick={handleEdit}>
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleDuplicate}>
          <Copy className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </PopoverContent>
    </Popover>
  );
}
```

### Pattern 3: Add Field Button Between Elements

**What:** Plus button that appears on hover between fields
**When to use:** Notion/Linear-style insert UI for adding fields at specific positions

```typescript
// src/components/form-builder/AddFieldButton.tsx
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FieldTypePicker } from "./FieldTypePicker";
import type { FieldType } from "@/types/form-schema";

interface AddFieldButtonProps {
  onAddField: (type: FieldType) => void;
}

export function AddFieldButton({ onAddField }: AddFieldButtonProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (type: FieldType) => {
    onAddField(type);
    setOpen(false);
  };

  return (
    <div className="relative h-4 group">
      {/* Horizontal line indicator */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-transparent group-hover:bg-primary/30 transition-colors" />

      {/* Plus button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
              "h-6 w-6 rounded-full opacity-0 group-hover:opacity-100",
              "transition-opacity shadow-sm",
              open && "opacity-100"
            )}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2">
          <FieldTypePicker onSelect={handleSelect} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
```

### Pattern 4: Field Type Picker Grid

**What:** Grid of field types for quick selection
**When to use:** Inside the plus button popover

```typescript
// src/components/form-builder/FieldTypePicker.tsx
import { Button } from "@/components/ui/button";
import {
  Type, Mail, AlignLeft, Hash, Calendar,
  ChevronDown, Circle, CheckSquare, Upload, Link
} from "lucide-react";
import type { FieldType } from "@/types/form-schema";

const FIELD_TYPES: { type: FieldType; label: string; icon: React.ElementType }[] = [
  { type: "text", label: "Text", icon: Type },
  { type: "email", label: "Email", icon: Mail },
  { type: "url", label: "URL", icon: Link },
  { type: "textarea", label: "Long Text", icon: AlignLeft },
  { type: "number", label: "Number", icon: Hash },
  { type: "date", label: "Date", icon: Calendar },
  { type: "select", label: "Dropdown", icon: ChevronDown },
  { type: "radio", label: "Radio", icon: Circle },
  { type: "checkbox", label: "Checkbox", icon: CheckSquare },
  { type: "file", label: "File", icon: Upload },
];

interface FieldTypePickerProps {
  onSelect: (type: FieldType) => void;
}

export function FieldTypePicker({ onSelect }: FieldTypePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-1">
      {FIELD_TYPES.map(({ type, label, icon: Icon }) => (
        <Button
          key={type}
          variant="ghost"
          className="h-auto py-2 justify-start gap-2"
          onClick={() => onSelect(type)}
        >
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{label}</span>
        </Button>
      ))}
    </div>
  );
}
```

### Pattern 5: Inline Label Editing

**What:** Click on field label to edit it directly
**When to use:** WYSIWYG inline editing of field label text

```typescript
// src/components/form-builder/InlineFieldLabel.tsx
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface InlineFieldLabelProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function InlineFieldLabel({ value, onChange, className }: InlineFieldLabelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue.trim()) {
      onChange(editValue.trim());
    } else {
      setEditValue(value); // Reset to original if empty
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn("h-auto py-0 px-1 text-sm font-medium", className)}
      />
    );
  }

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      className={cn(
        "cursor-text hover:bg-muted/50 rounded px-1 -mx-1",
        className
      )}
    >
      {value}
    </span>
  );
}
```

### Pattern 6: WYSIWYG Canvas Integration

**What:** The main canvas that renders fields with add buttons between them
**When to use:** Replaces current FormCanvas with WYSIWYG approach

```typescript
// src/components/form-builder/WysiwygCanvas.tsx
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useFormBuilderStore } from "@/lib/stores/form-builder-store";
import { WysiwygField } from "./WysiwygField";
import { AddFieldButton } from "./AddFieldButton";
import { FormProvider, useForm } from "react-hook-form";
import type { FieldType } from "@/types/form-schema";

export function WysiwygCanvas() {
  const {
    schema,
    selectedStepIndex,
    reorderFields,
    addFieldAtIndex,
    selectField,
  } = useFormBuilderStore();

  const currentStep = schema.steps[selectedStepIndex];
  const fields = currentStep?.fields ?? [];

  // Mock form context for DynamicField rendering
  const methods = useForm({ defaultValues: {}, mode: "onChange" });

  const handleAddField = (index: number) => (type: FieldType) => {
    addFieldAtIndex(selectedStepIndex, type, index);
  };

  // Click on canvas background deselects field
  const handleCanvasClick = () => {
    selectField(null);
  };

  if (fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 rounded-lg border-2 border-dashed">
        <p className="text-muted-foreground mb-4">
          Add your first field to get started
        </p>
        <AddFieldButton onAddField={handleAddField(0)} />
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div
          className="space-y-1"
          onClick={handleCanvasClick}
        >
          {/* Add button at top */}
          <AddFieldButton onAddField={handleAddField(0)} />

          <SortableContext
            items={fields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            {fields.map((field, index) => (
              <div key={field.id}>
                <WysiwygField
                  field={field}
                  stepIndex={selectedStepIndex}
                />
                {/* Add button after each field */}
                <AddFieldButton onAddField={handleAddField(index + 1)} />
              </div>
            ))}
          </SortableContext>
        </div>
      </DndContext>
    </FormProvider>
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      reorderFields(selectedStepIndex, oldIndex, newIndex);
    }
  }
}
```

### Anti-Patterns to Avoid

- **Separate preview mode:** The whole point of WYSIWYG is builder = preview. Don't maintain two render paths.
- **Modal-heavy field editing:** Inline/floating panels are faster than modal dialogs for WYSIWYG.
- **Showing field metadata instead of actual field:** The current `FieldPreview` shows icons/labels - WYSIWYG must show actual inputs.
- **Complex nested popovers:** Keep toolbar actions flat; use property panel for complex settings.
- **Blocking pointer events on fields:** Need careful balance - fields render but don't capture actual input during editing.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Floating positioning | Manual absolute positioning | @radix-ui/react-popover or @floating-ui/react | Handles edge cases, viewport collision |
| Click outside detection | Custom event handlers | Radix Popover `onInteractOutside` | Accessible, handles portals correctly |
| Inline text editing | contenteditable | Controlled input with edit state | More predictable, React-friendly |
| Field reordering | Manual array manipulation | @dnd-kit/sortable with arrayMove | Proven, animated, accessible |
| Toolbar positioning | CSS transforms | Floating UI middleware (flip, shift) | Handles viewport edges |

**Key insight:** The existing `DynamicField` components from Phase 13 handle all field rendering. WYSIWYG means wrapping them in selectable containers, not re-implementing field rendering.

## Common Pitfalls

### Pitfall 1: Pointer Events Blocking Form Input

**What goes wrong:** WYSIWYG fields are actual inputs, but users accidentally type into them while editing form structure.
**Why it happens:** Fields capture focus and input events.
**How to avoid:**
- Use `pointer-events-none` on field content in builder mode
- Intercept clicks on the wrapper, not the field
- Clear indication of edit vs. fill modes
**Warning signs:** Users accidentally filling in form fields while building.

### Pitfall 2: Floating Toolbar Flickering

**What goes wrong:** Toolbar appears/disappears erratically when hovering between field and toolbar.
**Why it happens:** Mouse leaves field before entering toolbar.
**How to avoid:**
- Keep toolbar open while field is selected (not just hovered)
- Use Radix Popover with proper `onOpenChange` handling
- Consider small delay before closing
**Warning signs:** Toolbar impossible to click.

### Pitfall 3: Drag Handle vs Selection Conflict

**What goes wrong:** Clicking drag handle selects field instead of initiating drag.
**Why it happens:** Click propagates to parent.
**How to avoid:**
- `e.stopPropagation()` on drag handle
- Use dnd-kit's activation constraint (distance: 8)
- Separate click and drag interactions clearly
**Warning signs:** Accidental drags, inability to select fields.

### Pitfall 4: Lost State on Add Field

**What goes wrong:** Adding field at index causes wrong insertion position.
**Why it happens:** Index calculation during array mutation.
**How to avoid:**
- Add `addFieldAtIndex(stepIndex, type, insertIndex)` to store
- Use splice for insertion, not push
- Update selectedFieldId to newly added field
**Warning signs:** Fields added at wrong position.

### Pitfall 5: Form Context Missing for DynamicField

**What goes wrong:** `DynamicField` components crash without FormProvider.
**Why it happens:** They use `useFormContext()` internally.
**How to avoid:**
- Wrap WYSIWYG canvas in `FormProvider` with mock form methods
- Mock form values don't need to persist (builder mode)
**Warning signs:** "useFormContext must be used within a FormProvider" error.

### Pitfall 6: Property Panel Desync with Inline Edits

**What goes wrong:** Inline label edit doesn't reflect in property panel or vice versa.
**Why it happens:** Two sources of truth for field data.
**How to avoid:**
- Single source: Zustand store
- Both inline and panel read/write to store
- Debounce updates to prevent conflicts
**Warning signs:** Stale data in one view.

## Code Examples

Verified patterns from official sources:

### Floating UI useFloating Hook (Context7)

```typescript
// Source: Context7 - floating-ui/floating-ui
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
} from '@floating-ui/react';

function FieldToolbar() {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'top',
    middleware: [offset(8), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  return (
    <>
      <div ref={refs.setReference}>
        {/* Field content */}
      </div>
      {isOpen && (
        <div ref={refs.setFloating} style={floatingStyles}>
          {/* Toolbar content */}
        </div>
      )}
    </>
  );
}
```

### dnd-kit Sortable with Insert Position (Context7)

```typescript
// Source: Context7 - dnd-kit
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';

function handleDragEnd(event) {
  const { active, over } = event;

  if (active.id !== over.id) {
    setItems((items) => {
      const oldIndex = items.indexOf(active.id);
      const newIndex = items.indexOf(over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  }
}
```

### Radix Popover for Toolbar (Project Pattern)

```typescript
// Based on existing @radix-ui usage in project
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function AddFieldPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="center" className="w-64">
        <FieldTypePicker onSelect={handleSelect} />
      </PopoverContent>
    </Popover>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate preview mode | WYSIWYG (builder = preview) | 2023+ (Notion, Linear influence) | Better UX, faster iteration |
| Side panel only editing | Inline + floating panel hybrid | 2024+ | More intuitive, WYSIWYG-native |
| Drag from palette to canvas | Plus buttons between elements | 2023+ (Notion pattern) | More precise insertion |
| Modal dialogs for field config | Floating panels/popovers | 2024+ | Less disruptive workflow |
| Icon-based field cards | Actual rendered fields | WYSIWYG standard | True preview while editing |

**Deprecated/outdated:**
- Separate "Preview" button/mode - anti-pattern for WYSIWYG
- Modal-first field editing - prefer inline/floating panels
- react-beautiful-dnd - use @dnd-kit instead

## Open Questions

Things that couldn't be fully resolved:

1. **Inline property editing scope**
   - What we know: Label should be inline editable
   - What's unclear: Should placeholder, description also be inline? Or property panel only?
   - Recommendation: Start with label only inline, other properties in floating panel

2. **Mobile WYSIWYG experience**
   - What we know: Floating toolbars can be challenging on mobile
   - What's unclear: Touch-friendly toolbar positioning
   - Recommendation: Consider bottom sheet pattern for mobile toolbar

3. **Validation feedback in builder**
   - What we know: BUILD-08 requires real-time validation feedback
   - What's unclear: Show validation errors during builder editing or only in preview?
   - Recommendation: Show warnings (not blocking errors) in builder for invalid config

4. **Multi-field selection**
   - What we know: Current design is single-field selection
   - What's unclear: Should bulk actions (delete, duplicate) be supported?
   - Recommendation: Defer to future enhancement, single selection for MVP

## Store Enhancements Required

The existing `form-builder-store.ts` needs these additions for WYSIWYG:

```typescript
interface FormBuilderState {
  // Existing...

  // New for WYSIWYG
  addFieldAtIndex: (stepIndex: number, type: FieldType, insertIndex: number) => void;
  duplicateField: (fieldId: string) => void;
}
```

## Sources

### Primary (HIGH confidence)
- Context7: /floating-ui/floating-ui - useFloating hook, middleware patterns
- Context7: /websites/next_dndkit - Sortable patterns, arrayMove
- Existing codebase: `/home/memehalis/ft-form/src/components/form-builder/*` - Current implementation
- Existing codebase: `/home/memehalis/ft-form/src/components/dynamic-form/fields/*` - DynamicField components

### Secondary (MEDIUM confidence)
- [Tiptap Floating Element](https://tiptap.dev/docs/ui-components/utils-components/floating-element) - Floating toolbar patterns
- [Radix UI Popover](https://www.radix-ui.com/primitives/docs/components/popover) - Popover implementation
- [Inline Edit Form Pattern](https://devrecipes.net/building-a-simple-inline-edit-form-with-react/) - Inline editing approach

### Tertiary (LOW confidence - for validation)
- Notion, Linear app patterns - WYSIWYG builder UX (observational)
- react-form-builder2 npm package - Alternative approach reference

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project or Radix ecosystem
- Architecture: HIGH - Clear transformation path from existing Phase 14 implementation
- Patterns: HIGH - Based on official docs (Context7, Radix) and existing codebase
- Pitfalls: MEDIUM - Some based on common React patterns, some inferred from WYSIWYG requirements

**Research date:** 2026-01-29
**Valid until:** 45 days (patterns stable, may need review if @floating-ui or @dnd-kit major versions release)

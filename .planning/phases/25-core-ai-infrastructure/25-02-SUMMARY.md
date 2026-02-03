---
phase: 25-core-ai-infrastructure
plan: 02
subsystem: ai-infrastructure
tags: [system-prompt, error-handling, openrouter, frontier-tower]
dependency-graph:
  requires: []
  provides:
    - System prompt with Frontier Tower context
    - Error transformation utilities for API errors
  affects:
    - 25-03 (streaming API route will use system prompt)
    - 25-04 (chat UI will use error handling)
tech-stack:
  added: []
  patterns:
    - Error transformation pattern (raw -> actionable)
    - System prompt composition with embedded context
key-files:
  created:
    - src/lib/ai/system-prompt.ts
    - src/lib/ai/error-handling.ts
  modified: []
decisions: []
metrics:
  duration: 2m 16s
  completed: 2026-02-03
---

# Phase 25 Plan 02: System Prompt and Error Handling Summary

**One-liner:** System prompt with complete Frontier Tower context (floors, members, use cases) and error transformation that maps API errors to actionable user messages.

## What Was Built

### Task 1: System Prompt with Frontier Tower Context
Created `src/lib/ai/system-prompt.ts` exporting `FORM_CREATION_SYSTEM_PROMPT` constant.

**Content includes:**
- Role definition (form creation assistant for FT)
- All 10 available field types with descriptions (text, email, url, textarea, number, date, select, radio, checkbox, file)
- Explicit "NOT AVAILABLE" section listing unsupported features (conditional logic, multi-column layouts, rating scales, signature fields, rich text, field branching, phone/address field types)
- Complete Frontier Tower context:
  - What FT is (vertical village, innovation hub, 16 stories)
  - Floor specializations (Floors 4-13 with domains)
  - Community model (Floor Leads, member types table)
  - Typical form use cases (applications, registrations, feedback, admin)
- Floor selection options with exact values for compatibility
- Output format specification (JSON schema structure)
- 7 rules for form generation (IDs, options, validation, email, floors, brand voice)

### Task 2: Error Transformation Utilities
Created `src/lib/ai/error-handling.ts` exporting `transformAIError` function.

**Error cases handled:**
| Error Type | Status | Message | Actionable |
|------------|--------|---------|------------|
| OpenRouter auth (401) | 401 | Invalid API key | Check API key and retry |
| Rate limiting (429) | 429 | Rate limited | Wait and retry |
| Credit depletion (402) | 402 | Insufficient credits | Add credits to account |
| Schema validation | 422 | Could not generate valid form | Rephrase request |
| Network/timeout | 503 | Connection error | Check connection |
| Service unavailable | 503 | Service temporarily unavailable | Wait and retry |
| Model not found | 404 | Model unavailable | Try again later |
| Unknown | 500 | Generation failed | Try again |

**Helper functions:**
- `isRetryableError(error)` - Returns true for 429/503 errors
- `getRetryDelay(error)` - Returns suggested delay (5s for 429, 2s for 503)

## Technical Decisions

None - executed exactly as planned.

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

1. **Build passes:** `pnpm build` compiled successfully without type errors
2. **System prompt content verified:**
   - 7 mentions of "Frontier Tower"
   - 11 floor options (floor-4 through floor-13)
   - All 10 field types listed
   - "NOT AVAILABLE" section present
3. **Error handling coverage verified:**
   - 401, 429, 402 status codes handled
   - NoObjectGeneratedError pattern detected
   - Network/connection errors caught
   - Safe fallback for unknown errors

## Commits

| Commit | Description | Files |
|--------|-------------|-------|
| e8565e6 | feat(25-02): create system prompt with Frontier Tower context | src/lib/ai/system-prompt.ts |
| 6769b71 | feat(25-02): create error transformation utilities | src/lib/ai/error-handling.ts |

## Files Changed

**Created:**
- `src/lib/ai/system-prompt.ts` (193 lines) - System prompt constant with FT context
- `src/lib/ai/error-handling.ts` (171 lines) - Error transformation utilities

## Next Phase Readiness

Plan 25-02 complete. The AI infrastructure now has:
- System prompt ready for streaming API route (25-03)
- Error handling ready for API route and chat UI (25-03, 25-04)

Ready to proceed with Plan 25-03 (Streaming API route).

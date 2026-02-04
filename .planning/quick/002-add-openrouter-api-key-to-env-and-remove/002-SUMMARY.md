---
quick: 002
subsystem: ai-wizard
tags: [openrouter, api-key, environment, ux]
files:
  created: []
  modified:
    - .env.local
    - src/app/api/ai/generate/route.ts
    - src/app/admin/forms/new/ai/page.tsx
    - src/components/ai-wizard/AIFormWizard.tsx
metrics:
  duration: 2m
  completed: 2026-02-04
---

# Quick Task 002: Add OpenRouter API Key to Env and Remove UI

**One-liner:** Server-side OpenRouter API key with simplified wizard UX (no user key entry).

## What Was Done

### Task 1: Add OpenRouter API key to .env.local
- Added `OPENROUTER_API_KEY` environment variable to `.env.local`
- Note: `.env.local` is gitignored (correct security practice)

### Task 2: Update API route to use server-side key
- Modified `/api/ai/generate` to read key from `process.env.OPENROUTER_API_KEY`
- Removed `apiKey` from request body destructuring
- Changed error response to 500 (server config error) instead of 401 (auth required)
- **Commit:** c2f3d48

### Task 3: Remove API key entry UI
- Removed API key state, validation, and entry screen from AI wizard page
- Removed apiKey prop from AIFormWizard component interface
- Removed apiKey from transport body in useMemo
- Page now loads directly to form type selection step
- **Commit:** 1971a84

## Deviations from Plan

None - plan executed exactly as written.

## Key Files Changed

| File | Change |
|------|--------|
| `.env.local` | Added OPENROUTER_API_KEY (not committed - gitignored) |
| `src/app/api/ai/generate/route.ts` | Reads key from env instead of request body |
| `src/app/admin/forms/new/ai/page.tsx` | Removed API key entry phase entirely |
| `src/components/ai-wizard/AIFormWizard.tsx` | Removed apiKey prop |

## Verification

- [x] `pnpm build` passes
- [x] Lint warnings are pre-existing (not introduced by changes)
- [x] API route uses server-side key
- [x] No user-facing API key input in wizard

## Impact

Users no longer need to provide their own OpenRouter API key. The AI form wizard now:
1. Goes directly to form type selection
2. Uses the server-configured API key for all AI requests
3. Provides simpler, faster UX for form creation

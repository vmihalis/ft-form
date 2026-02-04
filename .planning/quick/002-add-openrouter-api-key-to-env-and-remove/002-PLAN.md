---
quick: 002
type: execute
autonomous: true
files_modified:
  - .env.local
  - src/app/admin/forms/new/ai/page.tsx
  - src/components/ai-wizard/AIFormWizard.tsx
  - src/app/api/ai/generate/route.ts
---

<objective>
Add OpenRouter API key to environment variables and remove the UI prompt that asks users for their API key.

Purpose: Simplify the AI form wizard by using a server-side API key instead of requiring users to provide their own.
Output: API key stored in .env.local, AI wizard skips API key entry step, API route reads key from env.
</objective>

<context>
@.planning/STATE.md
@src/app/admin/forms/new/ai/page.tsx
@src/components/ai-wizard/AIFormWizard.tsx
@src/app/api/ai/generate/route.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add OpenRouter API key to .env.local</name>
  <files>.env.local</files>
  <action>
    Add the following line to .env.local:

    OPENROUTER_API_KEY=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

    Add it after the existing environment variables with a comment indicating its purpose.
  </action>
  <verify>grep "OPENROUTER_API_KEY" .env.local returns the key</verify>
  <done>OPENROUTER_API_KEY is present in .env.local</done>
</task>

<task type="auto">
  <name>Task 2: Update API route to use server-side API key</name>
  <files>src/app/api/ai/generate/route.ts</files>
  <action>
    Modify the API route to read the API key from process.env.OPENROUTER_API_KEY instead of from the request body:

    1. At the top of the POST handler, read the key from environment:
       const serverApiKey = process.env.OPENROUTER_API_KEY;

    2. Update the validation to check for the server key:
       if (!serverApiKey || !isValidOpenRouterKeyFormat(serverApiKey)) {
         return Response.json(
           { error: "Server configuration error", actionable: "OpenRouter API key not configured." },
           { status: 500 }
         );
       }

    3. Update the createOpenRouter call to use serverApiKey instead of apiKey from body.

    4. Remove apiKey from the destructured request body (keep messages, formType, audience).
  </action>
  <verify>Read the updated file and confirm it reads from process.env.OPENROUTER_API_KEY</verify>
  <done>API route uses server-side API key, no longer accepts apiKey from request body</done>
</task>

<task type="auto">
  <name>Task 3: Remove API key entry UI and simplify page/wizard</name>
  <files>src/app/admin/forms/new/ai/page.tsx, src/components/ai-wizard/AIFormWizard.tsx</files>
  <action>
    In src/app/admin/forms/new/ai/page.tsx:
    1. Remove the apiKey state and hasEnteredKey state
    2. Remove isValidKeyFormat check
    3. Remove handleContinue function
    4. Remove the entire "Phase 1: API Key Entry" section (the Card with API key input)
    5. Remove the conditional if (hasEnteredKey) - always show the wizard directly
    6. Remove the apiKey prop from AIFormWizard usage
    7. Remove unused imports: Input, ExternalLink (keep Sparkles if used elsewhere, otherwise remove)

    In src/components/ai-wizard/AIFormWizard.tsx:
    1. Remove apiKey from AIFormWizardProps interface
    2. Remove apiKey from component destructuring
    3. Remove apiKey from the transport body object (only keep formType and audience)
    4. Update useMemo dependencies to remove apiKey
  </action>
  <verify>
    - pnpm lint passes
    - pnpm build passes
    - Read both files to confirm API key UI and props are removed
  </verify>
  <done>
    - AI wizard page goes directly to form type selection (no API key prompt)
    - AIFormWizard component no longer requires apiKey prop
    - No client-side API key handling anywhere in the code
  </done>
</task>

</tasks>

<verification>
1. pnpm lint - no errors
2. pnpm build - successful build
3. Manual verification: Navigate to /admin/forms/new/ai - should show form type selection immediately without API key prompt
</verification>

<success_criteria>
- OpenRouter API key is stored in .env.local
- API route reads key from environment, not request body
- AI wizard page loads directly to form type selection
- No user-facing API key input anywhere
- Build and lint pass
</success_criteria>

<output>
After completion, create `.planning/quick/002-add-openrouter-api-key-to-env-and-remove/002-SUMMARY.md`
</output>

---
phase: 26-chat-ui-conversation-flow
plan: 02
subsystem: ui
tags: [react, ai-sdk, useChat, streaming, chat-ui, motion]

# Dependency graph
requires:
  - phase: 25-core-ai-infrastructure
    provides: AI streaming API route, system prompt
  - phase: 26-01
    provides: Wizard container, FormType/Audience types
provides:
  - Chat conversation UI with streaming responses
  - Contextual system prompt with form type and audience
  - Typing indicator, message rendering, input with stop/submit
  - Error state with retry option
affects: [26-03, form-generation-step]

# Tech tracking
tech-stack:
  added: []
  patterns: [useChat-hook, DefaultChatTransport, streaming-cursor, auto-scroll]

key-files:
  created:
    - src/components/ai-wizard/steps/ChatStep.tsx
    - src/components/ai-wizard/ChatMessage.tsx
    - src/components/ai-wizard/ChatInput.tsx
    - src/components/ai-wizard/TypingIndicator.tsx
  modified:
    - src/app/api/ai/generate/route.ts
    - src/components/ai-wizard/AIFormWizard.tsx

key-decisions:
  - "Use DefaultChatTransport from ai package to pass api/body (AI SDK v6 pattern)"
  - "Memoize transport to prevent re-creation on every render"
  - "Extract text from message.parts (not message.content) per AI SDK v6 UIMessage structure"

patterns-established:
  - "Chat input pattern: auto-resize textarea with Enter submit, stop button during processing"
  - "Streaming indicator pattern: bouncing dots animation with motion/react"
  - "Context banner pattern: pill-style labels showing form type and audience"

# Metrics
duration: 4min
completed: 2026-02-03
---

# Phase 26 Plan 02: Chat Step with useChat Summary

**Chat conversation UI using AI SDK useChat hook with streaming responses, contextual system prompts, and error handling**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-03T20:27:37Z
- **Completed:** 2026-02-03T20:31:37Z
- **Tasks:** 3
- **Files created:** 4
- **Files modified:** 2

## Accomplishments

- Updated API route to build contextual system prompt with form type and audience
- System prompt now instructs AI to ask 2-3 clarifying questions maximum (HYB-04)
- Created TypingIndicator with motion/react bouncing dots animation
- Created ChatMessage component handling user/assistant messages with streaming cursor
- Created ChatInput with auto-resize textarea, Enter submit, stop button
- Created ChatStep orchestrating the full chat experience with context banner, auto-scroll, error recovery
- Integrated useChat hook in AIFormWizard with DefaultChatTransport (AI SDK v6 pattern)
- Wired form type and audience to API request body for contextual prompt building

## Task Commits

Each task was committed atomically:

1. **Task 1: Update API Route for Structured Context** - `973914a` (feat)
2. **Task 2: Create Chat UI Components** - `2f9fea3` (feat)
3. **Task 3: Integrate useChat in AIFormWizard** - `117d72c` (feat)

## Files Created/Modified

**Created:**
- `src/components/ai-wizard/steps/ChatStep.tsx` (161 lines) - Chat conversation UI with streaming
- `src/components/ai-wizard/ChatMessage.tsx` (49 lines) - Individual message rendering
- `src/components/ai-wizard/ChatInput.tsx` (94 lines) - Message input with submit/stop
- `src/components/ai-wizard/TypingIndicator.tsx` (36 lines) - Animated typing dots

**Modified:**
- `src/app/api/ai/generate/route.ts` - Added buildContextualPrompt(), extracts formType/audience from body
- `src/components/ai-wizard/AIFormWizard.tsx` - Added useChat with DefaultChatTransport, wired ChatStep

## Decisions Made

- **DefaultChatTransport vs api option:** AI SDK v6 requires using transport prop with DefaultChatTransport class instead of direct api/body options on useChat
- **Memoized transport:** Wrapped transport creation in useMemo to prevent unnecessary re-creation when formType/audience/apiKey change
- **Message parts extraction:** AI SDK v6 UIMessage uses `.parts` array with `{type: 'text', text: string}` objects, not `.content` string

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- **AI SDK v6 API change:** Initial implementation used `api` and `body` options directly on useChat, which worked in earlier versions but not in v6. Fixed by using DefaultChatTransport class.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Ready for Plan 03 (Generation Step):
- useChat hook already providing messages, status, error, and control functions
- Form type and audience successfully reaching API route
- Chat step provides natural transition to form generation

Blockers: None

---
*Phase: 26-chat-ui-conversation-flow*
*Completed: 2026-02-03*

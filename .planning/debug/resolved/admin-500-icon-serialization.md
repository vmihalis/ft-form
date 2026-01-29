---
status: resolved
trigger: "/admin route returns 500 on Vercel production due to Server Component serialization error"
created: 2026-01-29T12:00:00Z
updated: 2026-01-29T12:00:00Z
---

## Current Focus

hypothesis: CONFIRMED - Server Component passes Lucide icon components to Client Component, which fails serialization
test: Verified both components' directives and confirmed root cause
expecting: N/A - root cause found
next_action: Implement fix - pass icon names as strings, let ModuleCard resolve icons internally

## Symptoms

expected: Admin dashboard loads with all ModuleCards displaying properly
actual: 500 Internal Server Error on Vercel production
errors: "Only plain objects can be passed to Client Components from Server Components. Classes or other objects with methods are not supported." at src/app/admin/page.tsx line 47 - passing icon={FileText} (Lucide icon component) to ModuleCard
reproduction: Access /admin on Vercel deployment
started: After recent deploy - worked before, broke after deploying changes

## Eliminated

## Evidence

- timestamp: 2026-01-29T12:00:00Z
  checked: src/app/admin/page.tsx
  found: No "use client" directive - this is a Server Component. It imports Lucide icons (FileText, Inbox, Users, etc.) and passes them directly as icon prop to ModuleCard
  implication: Confirms the server side of the serialization issue

- timestamp: 2026-01-29T12:01:00Z
  checked: src/components/admin/ModuleCard.tsx
  found: Has "use client" directive - this IS a Client Component. Accepts `icon: LucideIcon` prop and renders it as `<Icon ... />`
  implication: Confirms client side of serialization issue - LucideIcon components cannot be serialized from server to client

- timestamp: 2026-01-29T12:02:00Z
  checked: SidebarNav.tsx and DashboardStats.tsx
  found: Both are Client Components that import icons internally, not receiving them from Server Components
  implication: Confirms the pattern that works - icons must be imported within the client component, not passed from server

- timestamp: 2026-01-29T12:03:00Z
  checked: page.tsx server-only usage
  found: Uses `cookies()` from `next/headers` and exports `metadata` - both require Server Component
  implication: Cannot convert page to client component; must change how icons are passed

## Resolution

root_cause: Server Component (page.tsx) passes Lucide React icon components (FileText, Inbox, etc.) as props to Client Component (ModuleCard). Next.js cannot serialize function/class components across the server/client boundary.
fix: Changed ModuleCard to accept icon names as strings (e.g., "FileText" instead of FileText component) and resolve icons internally using a lookup map. Updated page.tsx to pass string icon names.
verification: TypeScript type check passes. Next.js production build succeeds. Server/client serialization boundary no longer crossed with component references.
files_changed:
  - src/components/admin/ModuleCard.tsx: Added iconMap lookup, changed icon prop type from LucideIcon to string
  - src/app/admin/page.tsx: Removed Lucide imports, changed icon props to strings

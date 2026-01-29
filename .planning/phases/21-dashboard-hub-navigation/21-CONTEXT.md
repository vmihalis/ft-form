# Phase 21: Dashboard Hub & Navigation - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Dashboard hub as landing page after login with module cards (Forms + 4 placeholders) displaying stats and quick actions. Collapsible sidebar for navigation with persistent state. Mobile-responsive layout. This phase establishes the FrontierOS navigation structure — module functionality beyond Forms is out of scope.

</domain>

<decisions>
## Implementation Decisions

### Module card design
- Minimal content: icon and label only, no stats displayed on cards
- No quick action buttons on cards — cards just navigate to the module
- Glass cards with subtle glow on hover, matching design system
- Large hero cards (~200-250px height) for prominent, spacious feel

### Dashboard hub layout
- Flexible grid: 2-3 columns based on viewport width
- Simple page title header ("Dashboard" or "FrontierOS") — no personalized greeting
- Spacious/airy spacing with generous padding and gaps for premium feel
- All module cards equal size and treatment — no visual hierarchy favoring Forms

### Sidebar behavior
- Dual interaction: click to pin open, hover for quick peek when collapsed
- Glass panel with blur matching design system
- Default state: expanded (labels visible) for new users
- Collapse toggle button positioned at bottom of sidebar
- State persists across sessions (localStorage or similar)

### Placeholder modules
- Four placeholders: Members, Events, Spaces, Wellness
- Context: Frontier Tower is a 16-floor vertical tech village in SF with themed labs, coworking, events, and wellness amenities
- Placeholder appearance: subtle "Coming Soon" badge with muted/dimmed styling
- Non-interactive: clicks do nothing, purely visual placeholders

### Claude's Discretion
- Exact icons for each module (Forms, Members, Events, Spaces, Wellness)
- Sidebar animation timing and easing
- Mobile breakpoint and responsive behavior
- Exact spacing values within design system constraints
- Hover animation details for cards

</decisions>

<specifics>
## Specific Ideas

- Frontier Tower context: 16-floor tech hub in San Francisco's Mid-Market, themed labs (AI, crypto, biotech, neuroscience, longevity, deep-tech, coordination, arts & music), coworking/coliving, events spaces, wellness amenities (gym, meditation, rooftop, biohacking clinic)
- Module names reflect building management needs: Members (member management), Events (event scheduling), Spaces (room bookings), Wellness (wellness amenities)
- Premium feel: glassmorphism throughout, spacious layout, large hero cards

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 21-dashboard-hub-navigation*
*Context gathered: 2026-01-29*

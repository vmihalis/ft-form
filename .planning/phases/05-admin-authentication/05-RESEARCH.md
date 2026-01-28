# Phase 5: Admin Authentication - Research

**Researched:** 2026-01-28
**Domain:** Next.js App Router authentication, JWT sessions, route protection
**Confidence:** HIGH

## Summary

This phase implements password-protected admin routes using a single shared password stored in an environment variable. The approach uses stateless JWT sessions stored in HttpOnly cookies with Next.js middleware for route protection.

The standard approach for this use case (single password, no individual user accounts) is to use **iron-session** or direct **jose** JWT handling. Given the project requirements specify JWT session management (AUTH-04), and we want to minimize dependencies while maintaining security, I recommend using **jose directly** following the official Next.js authentication documentation patterns.

The implementation follows the layered security model: middleware for optimistic route protection (fast, cookie-based checks), plus server-side verification in protected components/actions as a defense-in-depth measure.

**Primary recommendation:** Use jose for JWT session management with Next.js middleware for /admin/* route protection. No password hashing needed since we're comparing against a plain environment variable (not storing user passwords in a database).

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| jose | 6.x | JWT signing/verification | Official Next.js docs recommendation, zero dependencies, Edge-compatible |
| next/headers | built-in | Cookie management | Native Next.js API for server-side cookies |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| iron-session | 8.x | Encrypted session cookies | Alternative if you prefer higher-level API |
| zod | 4.3.6 (installed) | Form validation | Already in project, use for login form validation |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| jose (manual JWT) | iron-session | Simpler API but adds dependency, uses non-standard encryption |
| jose | NextAuth.js/Auth.js | Massive overkill for single-password auth, complex setup |
| jose | Convex Auth | Designed for individual user accounts, not single shared password |
| Middleware | Page-level checks only | Middleware catches unauthenticated requests before rendering |

**Installation:**
```bash
npm install jose
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   └── auth/
│       ├── session.ts       # JWT encrypt/decrypt functions
│       └── dal.ts           # Data Access Layer (verifySession)
├── app/
│   ├── admin/
│   │   ├── login/
│   │   │   ├── page.tsx     # Login form UI
│   │   │   └── actions.ts   # Server action for login
│   │   ├── page.tsx         # Admin dashboard (protected)
│   │   └── layout.tsx       # Optional: admin layout
│   └── middleware.ts        # Route protection (in src/ folder)
```

### Pattern 1: Stateless JWT Sessions
**What:** Store minimal session data in signed JWT, stored in HttpOnly cookie
**When to use:** Always for this project (stateless, no database session storage)
**Example:**
```typescript
// src/lib/auth/session.ts
// Source: https://nextjs.org/docs/app/guides/authentication
import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

interface SessionPayload {
  isAuthenticated: boolean
  expiresAt: Date
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey)
}

export async function decrypt(session: string | undefined = ''): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function createSession(): Promise<void> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const session = await encrypt({ isAuthenticated: true, expiresAt })
  const cookieStore = await cookies()

  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
```

### Pattern 2: Middleware Route Protection
**What:** Next.js middleware intercepts requests before rendering
**When to use:** Protect all /admin/* routes except /admin/login
**Example:**
```typescript
// src/middleware.ts
// Source: https://nextjs.org/docs/app/guides/authentication
import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/auth/session'
import { cookies } from 'next/headers'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Skip login page - it's public
  if (path === '/admin/login') {
    return NextResponse.next()
  }

  // Check session for all other /admin/* routes
  const cookie = request.cookies.get('session')?.value
  const session = await decrypt(cookie)

  if (!session?.isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/login', request.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

### Pattern 3: Server Action for Login
**What:** Form submission handled by server action
**When to use:** Login form submission
**Example:**
```typescript
// src/app/admin/login/actions.ts
'use server'

import { createSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const loginSchema = z.object({
  password: z.string().min(1, 'Password is required'),
})

export async function login(prevState: unknown, formData: FormData) {
  const result = loginSchema.safeParse({
    password: formData.get('password'),
  })

  if (!result.success) {
    return { error: 'Password is required' }
  }

  const { password } = result.data

  // Simple comparison - no hashing needed for env var password
  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: 'Invalid password' }
  }

  await createSession()
  redirect('/admin')
}
```

### Anti-Patterns to Avoid
- **Using localStorage for auth tokens:** Vulnerable to XSS attacks. Always use HttpOnly cookies.
- **Hashing the env var password:** Unnecessary complexity. The password is already secure in the environment, just compare directly.
- **Checking auth only in middleware:** Defense in depth - also verify in protected components.
- **Using bcrypt in middleware:** bcrypt requires Node.js runtime, middleware runs at Edge. Use jose instead.
- **Storing sensitive data in JWT:** JWT payloads are signed but NOT encrypted. Store only `isAuthenticated: boolean`.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JWT signing/verification | Custom crypto | jose library | Crypto is hard, jose is Edge-compatible |
| Session cookie encryption | Manual encryption | jose OR iron-session | Proper crypto, HttpOnly, Secure flags |
| Route protection | Multiple if checks | Next.js middleware | Centralized, runs before rendering |
| Form state/errors | useState + fetch | useActionState | Built-in React 19 pattern for forms |

**Key insight:** For simple password auth, the "rolling your own" complexity is mainly in getting JWT and cookie handling right. jose + cookies() API handles this cleanly.

## Common Pitfalls

### Pitfall 1: bcrypt in Edge Runtime
**What goes wrong:** Build fails with "edge runtime does not support Node.js 'crypto' module"
**Why it happens:** bcrypt uses native Node.js bindings, Edge runtime uses web APIs
**How to avoid:** Use jose for JWT (web-API compatible). No password hashing needed for this use case.
**Warning signs:** Import errors mentioning 'crypto' module

### Pitfall 2: Middleware Matcher Too Broad
**What goes wrong:** Login page becomes inaccessible (infinite redirect loop)
**Why it happens:** Matcher includes /admin/login, which requires auth to view
**How to avoid:** Explicitly skip /admin/login in middleware logic OR use more specific matcher
**Warning signs:** Browser shows "too many redirects" error

### Pitfall 3: Cookies() Without Await
**What goes wrong:** "cookies() returns a Promise" error
**Why it happens:** Next.js 15+ changed cookies() to be async
**How to avoid:** Always `const cookieStore = await cookies()` before accessing
**Warning signs:** TypeScript type errors about cookies returning Promise

### Pitfall 4: Missing 'server-only' Import
**What goes wrong:** Session secret exposed to client bundle
**Why it happens:** Module is accidentally imported in client component
**How to avoid:** Add `import 'server-only'` at top of session.ts
**Warning signs:** SECRET visible in browser dev tools, or "server-only" error during build

### Pitfall 5: Redirect After Setting Cookie
**What goes wrong:** redirect() throws NEXT_REDIRECT error (expected behavior, but confusing)
**Why it happens:** Next.js redirect() throws to interrupt execution
**How to avoid:** Call redirect() as last line, don't wrap in try/catch
**Warning signs:** Unhandled error logs mentioning NEXT_REDIRECT

### Pitfall 6: CVE-2025-29927 - Middleware Bypass
**What goes wrong:** Middleware can be bypassed via x-middleware-subrequest header
**Why it happens:** Vulnerability in Next.js 11.1.4 through 15.2.2
**How to avoid:** Ensure Next.js 16.x (this project uses 16.1.5 - safe). Also verify auth in protected components, not just middleware.
**Warning signs:** Running older Next.js version

## Code Examples

Verified patterns from official sources:

### Complete Login Page
```typescript
// src/app/admin/login/page.tsx
'use client'

import { useActionState } from 'react'
import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="text-muted-foreground mt-2">
            Enter password to access dashboard
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </main>
  )
}
```

### Logout Action
```typescript
// src/app/admin/actions.ts
'use server'

import { deleteSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'

export async function logout() {
  await deleteSession()
  redirect('/admin/login')
}
```

### Protected Admin Page with Logout
```typescript
// src/app/admin/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { decrypt } from '@/lib/auth/session'
import { logout } from './actions'
import { Button } from '@/components/ui/button'

export default async function AdminPage() {
  // Defense in depth: verify session even though middleware checked
  const cookieStore = await cookies()
  const session = await decrypt(cookieStore.get('session')?.value)

  if (!session?.isAuthenticated) {
    redirect('/admin/login')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Admin Dashboard</h1>
      <p className="mt-4 text-muted-foreground">
        Manage floor lead applications
      </p>
      <form action={logout}>
        <Button variant="outline" className="mt-8">
          Logout
        </Button>
      </form>
    </main>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Middleware file named `middleware.ts` | Next.js 16+ uses `proxy.ts` (but `middleware.ts` still works) | Next.js 16 | Use either filename, code is identical |
| `cookies()` sync | `await cookies()` async | Next.js 15+ | Must await before accessing cookie store |
| useFormState | useActionState | React 19 | Renamed hook, same functionality |
| Custom session storage | jose + cookies | 2024+ | Official Next.js recommendation |

**Deprecated/outdated:**
- **next-iron-session**: Old package, use `iron-session@8` instead
- **bcrypt in middleware**: Never worked, use jose
- **NextAuth.js for simple password**: Overkill, designed for OAuth/user accounts

## Environment Variables

Required for this phase:

```bash
# .env.local
ADMIN_PASSWORD=your-secure-password-here
SESSION_SECRET=your-32-character-minimum-secret-key-here
```

**Generation commands:**
```bash
# Generate a secure SESSION_SECRET
openssl rand -base64 32
```

**Important:**
- `ADMIN_PASSWORD`: Can be any string, shared with admin team
- `SESSION_SECRET`: Must be at least 32 characters for HS256, keep private
- Neither should have `NEXT_PUBLIC_` prefix (server-only)

## Open Questions

Things that couldn't be fully resolved:

1. **Session Expiry UX**
   - What we know: Sessions expire after 7 days by default
   - What's unclear: Should we show a "session expired" message or just redirect?
   - Recommendation: For v1, simple redirect to login is sufficient

2. **Rate Limiting**
   - What we know: Login endpoints should be rate-limited to prevent brute force
   - What's unclear: Whether to implement in middleware or defer to Vercel's edge protection
   - Recommendation: Defer to Phase 7 (deployment) - Vercel has built-in DDoS protection

## Sources

### Primary (HIGH confidence)
- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication) - Official patterns for JWT sessions, middleware
- [jose GitHub](https://github.com/panva/jose) - JWT library, v6.x, Edge-compatible
- [iron-session GitHub](https://github.com/vvo/iron-session) - Alternative session library

### Secondary (MEDIUM confidence)
- [Password Protecting Routes in Next.js](https://www.alexchantastic.com/revisiting-password-protecting-next) - Complete iron-session implementation example
- [JWT Middleware in Next.js](https://dev.to/leapcell/implementing-jwt-middleware-in-nextjs-a-complete-guide-to-auth-1b2d) - Middleware patterns
- [WorkOS: Top Auth Solutions 2026](https://workos.com/blog/top-authentication-solutions-nextjs-2026) - Current landscape overview

### Tertiary (LOW confidence)
- [bcrypt Edge Runtime Issue](https://github.com/vercel/next.js/issues/69002) - Why bcrypt doesn't work in middleware

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Next.js docs recommend jose for JWT
- Architecture: HIGH - Patterns directly from Next.js authentication guide
- Pitfalls: HIGH - Verified through GitHub issues and official docs

**Research date:** 2026-01-28
**Valid until:** 2026-02-28 (30 days - stable domain)

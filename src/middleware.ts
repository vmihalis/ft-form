import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/auth/decrypt'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Skip auth check for the login page itself
  if (path === '/admin/login') {
    return NextResponse.next()
  }

  // Get session cookie and verify it
  const cookie = request.cookies.get('session')?.value
  const session = await decrypt(cookie)

  // Redirect to login if not authenticated
  if (!session || !session.isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/login', request.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}

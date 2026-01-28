import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { decrypt } from '@/lib/auth/session'
import { logout } from './actions'
import { Button } from '@/components/ui/button'

export default async function AdminPage() {
  // Defense in depth: verify session even though middleware checks too
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
      <div className="mt-8 flex gap-4">
        <Button variant="outline">View Applications</Button>
        <form action={logout}>
          <Button type="submit" variant="outline">
            Logout
          </Button>
        </form>
      </div>
    </main>
  )
}

'use server'

import { deleteSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'

export async function logout() {
  await deleteSession()
  redirect('/admin/login')
}

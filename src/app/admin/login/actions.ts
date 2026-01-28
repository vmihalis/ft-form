'use server'

import { createSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const loginSchema = z.object({
  password: z.string().min(1, 'Password is required'),
})

export async function login(
  prevState: unknown,
  formData: FormData
): Promise<{ error: string } | never> {
  const result = loginSchema.safeParse({
    password: formData.get('password'),
  })

  if (!result.success) {
    return { error: 'Password is required' }
  }

  const { password } = result.data

  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: 'Invalid password' }
  }

  await createSession()
  redirect('/admin')
}

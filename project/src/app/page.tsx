'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser } from '@/lib/auth'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    // redirect based on auth state: we never show the root page directly
    const user = getUser()
    router.replace(user ? '/dashboard' : '/login')
  }, [router])

  return null
}

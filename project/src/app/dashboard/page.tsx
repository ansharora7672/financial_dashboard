'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser } from '@/lib/auth'

export default function DashboardRoot() {
  const router = useRouter()

  useEffect(() => {
    const user = getUser()
    if (user) {
      // redirect to the first tab the user is allowed to see
      router.replace(`/dashboard/${user.allowedTabs[0]}`)
    }
  }, [router])

  return null
}

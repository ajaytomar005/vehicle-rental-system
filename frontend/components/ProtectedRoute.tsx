'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../store/auth'
import type { Role } from '../types'
import Loader from './Loader'

export default function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const { user, hydrated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!hydrated) return
    if (!user) {
      router.replace('/login')
    } else if (roles && !roles.includes(user.role)) {
      router.replace('/')
    }
  }, [hydrated, user, roles, router])

  if (!hydrated || !user || (roles && !roles.includes(user.role))) {
    return <Loader label="Checking access" />
  }

  return <>{children}</>
}

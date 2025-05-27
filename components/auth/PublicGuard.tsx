'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChange } from '@/lib/auth'

interface PublicGuardProps {
  children: React.ReactNode
}

export default function PublicGuard({ children }: PublicGuardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        // Redirect to dashboard if already authenticated
        router.push('/auth/dashboard')
      } else {
        setIsLoading(false)
      }
    })

    // Cleanup subscription
    return () => unsubscribe()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return <>{children}</>
} 
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { completeLoginWithEmailLink } from '@/lib/auth'

export default function EmailLinkPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const completeSignIn = async () => {
      // Get the stored name if this was a registration
      const storedName = typeof window !== 'undefined' 
        ? window.localStorage.getItem('nameForRegistration')
        : null

      const { user, error } = await completeLoginWithEmailLink()
      
      if (error) {
        setError(error.message)
        return
      }

      if (user) {
        // Clear the stored name
        if (storedName) {
          window.localStorage.removeItem('nameForRegistration')
        }
        router.push('/auth/dashboard')
      }
    }

    completeSignIn()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Authentication Error
            </h2>
            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>
            <button
              onClick={() => router.push('/noauth/login')}
              className="mt-4 text-indigo-600 hover:text-indigo-500"
            >
              Return to sign in
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Completing authentication...
          </h2>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  )
} 
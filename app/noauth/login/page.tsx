'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loginWithEmail, loginWithGoogle, sendLoginLink } from '@/lib/auth'
import { getAuthErrorMessage } from '@/lib/utils/auth-errors'
import PublicGuard from '@/components/auth/PublicGuard'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPasswordless, setIsPasswordless] = useState(false)
  const [linkSent, setLinkSent] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError(null)
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    
    setIsLoading(true)
    setError(null)

    try {
      if (isPasswordless) {
        const { error } = await sendLoginLink(formData.email)
        if (error) {
          setError(getAuthErrorMessage(error))
          return
        }
        setLinkSent(true)
        return
      }

      const { user, error } = await loginWithEmail(formData.email, formData.password)
      if (error) {
        setError(getAuthErrorMessage(error))
        return
      }

      router.push('/auth/dashboard')
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (isLoading) return
    
    setIsLoading(true)
    setError(null)

    try {
      const { user, error } = await loginWithGoogle()
      if (error) {
        setError(getAuthErrorMessage(error))
        return
      }

      if (user) {
        router.push('/auth/dashboard')
        return
      }
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  if (linkSent) {
    return (
      <PublicGuard>
        <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 flex flex-col">
          <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <Link href="/" className="flex items-center">
                  <span className="text-2xl font-bold text-indigo-600">WalkieCheck</span>
                </Link>
              </div>
            </div>
          </nav>

          <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900">
                  Check your email
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  We've sent a sign-in link to {formData.email}. Click the link to sign in to your account.
                </p>
                <button
                  onClick={() => {
                    setLinkSent(false)
                    setFormData(prev => ({ ...prev, email: '' }))
                  }}
                  className="mt-6 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Use a different email
                </button>
              </div>
            </div>
          </div>
        </div>
      </PublicGuard>
    )
  }

  return (
    <PublicGuard>
      <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 flex flex-col">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold text-indigo-600">WalkieCheck</span>
              </Link>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Don't have an account?</span>
                <Link
                  href="/noauth/register"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Login Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
                <p className="mt-3 text-lg text-gray-600">Sign in to your account to continue</p>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="mt-2 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>

                {!isPasswordless && (
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="mt-2 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    id="passwordless"
                    name="passwordless"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={isPasswordless}
                    onChange={(e) => {
                      setIsPasswordless(e.target.checked)
                      if (error) setError(null)
                    }}
                    disabled={isLoading}
                  />
                  <label htmlFor="passwordless" className="ml-2 block text-sm text-gray-700">
                    Sign in with email link instead
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Signing in...' : isPasswordless ? 'Send sign-in link' : 'Sign in'}
                </button>
              </form>

              {error && (
                <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-100">
                  <p className="text-sm text-red-600" role="alert">{error}</p>
                </div>
              )}

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="mt-6 w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                    <path fill="none" d="M1 1h22v22H1z" />
                  </svg>
                  {isLoading ? 'Signing in...' : 'Continue with Google'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicGuard>
  )
}

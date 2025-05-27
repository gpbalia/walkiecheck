type FirebaseErrorCode = 
  | 'auth/invalid-credential'
  | 'auth/user-not-found'
  | 'auth/wrong-password'
  | 'auth/invalid-email'
  | 'auth/email-already-in-use'
  | 'auth/weak-password'
  | 'auth/network-request-failed'
  | 'auth/too-many-requests'
  | 'auth/popup-closed-by-user'
  | 'auth/requires-recent-login'
  | 'auth/user-disabled'
  | 'auth/operation-not-allowed'
  | 'auth/invalid-action-code'
  | 'auth/expired-action-code'
  | string // for any other errors

interface FirebaseError {
  code: FirebaseErrorCode
  message: string
}

export function getAuthErrorMessage(error: FirebaseError | Error | unknown): string {
  // If it's not a Firebase error, return a generic message
  if (!error || typeof error !== 'object' || !('code' in error)) {
    return 'An unexpected error occurred. Please try again.'
  }

  const errorCode = error.code as FirebaseErrorCode

  switch (errorCode) {
    // Login related errors
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password. Please check your credentials and try again.'

    case 'auth/invalid-email':
      return 'Please enter a valid email address.'

    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in instead.'

    case 'auth/weak-password':
      return 'Password is too weak. Please use a stronger password with at least 6 characters.'

    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.'

    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Please try again later or reset your password.'

    case 'auth/popup-closed-by-user':
      return 'Sign in was cancelled. Please try again.'

    case 'auth/requires-recent-login':
      return 'For security reasons, please sign in again to continue.'

    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support for assistance.'

    case 'auth/operation-not-allowed':
      return 'This operation is not allowed. Please contact support if you think this is a mistake.'

    case 'auth/invalid-action-code':
    case 'auth/expired-action-code':
      return 'This link has expired or is invalid. Please request a new one.'

    default:
      // Log unexpected errors for debugging
      console.error('Unhandled auth error:', error)
      return 'An unexpected error occurred. Please try again.'
  }
} 
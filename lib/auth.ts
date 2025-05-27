import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  getRedirectResult,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  EmailAuthProvider,
  linkWithCredential,
  reauthenticateWithCredential,
  User as FirebaseUser,
  signInWithRedirect
} from 'firebase/auth'
import { auth } from './firebase'
import { createUser } from './firestore'

export interface AuthError {
  code: string
  message: string
}

// Email link authentication settings
const actionCodeSettings = {
  // URL you want to redirect back to. The domain (www.example.com) for this
  // URL must be whitelisted in the Firebase Console.
  url: typeof window !== 'undefined' ? `${window.location.origin}/noauth/login/email-link` : '',
  // This must be true for email link sign-in
  handleCodeInApp: true,
  // iOS: {
  //   bundleId: 'com.example.ios'
  // },
  // android: {
  //   packageName: 'com.example.android',
  //   installApp: true,
  //   minimumVersion: '12'
  // },
  // Optional dynamic link parameters
  dynamicLinkDomain: process.env.NEXT_PUBLIC_FIREBASE_DYNAMIC_LINK_DOMAIN
}

// Initialize Google Auth Provider with required scopes
const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('profile')
googleProvider.addScope('email')
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

// Helper function to get standardized error messages
const getErrorMessage = (error: AuthError): string => {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No account found with this email'
    case 'auth/wrong-password':
      return 'Invalid password'
    case 'auth/invalid-email':
      return 'Invalid email address'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists'
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completion'
    case 'auth/cancelled-popup-request':
      return 'Another sign-in popup is already open'
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by the browser'
    case 'auth/invalid-link':
      return 'The login link is invalid or has expired'
    default:
      return 'An error occurred. Please try again'
  }
}

// Helper function to create user document with retry
const createUserDocumentWithRetry = async (userData: {
  uid: string
  email: string
  name: string
  photoURL: string | null
  provider: string
}) => {
  try {
    const createResult = await createUser(userData)
    if (createResult.error) {
      console.error('Error creating user document:', createResult.error)
      // Try one more time after a short delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      const retryResult = await createUser(userData)
      if (retryResult.error) {
        console.error('Error on retry of user document creation:', retryResult.error)
        return { error: retryResult.error }
      }
    }
    return { error: null }
  } catch (error) {
    console.error('Error handling user document:', error)
    return { error }
  }
}

export const sendLoginLink = async (email: string) => {
  try {
    // Save the email for later use
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('emailForSignIn', email)
    }
    
    await sendSignInLinkToEmail(auth, email, actionCodeSettings)
    return { error: null }
  } catch (error) {
    return { error: error as AuthError }
  }
}

export const completeLoginWithEmailLink = async (email?: string) => {
  try {
    // Verify we have a sign-in link
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      return { 
        user: null, 
        error: { 
          code: 'auth/invalid-link', 
          message: getErrorMessage({ code: 'auth/invalid-link', message: '' })
        } as AuthError 
      }
    }

    // Get the email if not provided
    let emailToUse = email
    if (!emailToUse) {
      const storedEmail = window.localStorage.getItem('emailForSignIn')
      if (!storedEmail) {
        return { 
          user: null, 
          error: { 
            code: 'auth/missing-email', 
            message: 'Email is required to complete sign-in' 
          } as AuthError 
        }
      }
      emailToUse = storedEmail
    }

    // Complete the sign-in
    const userCredential = await signInWithEmailLink(auth, emailToUse, window.location.href)
    
    // Clear the email from storage
    window.localStorage.removeItem('emailForSignIn')
    
    // Check if this is a new user
    if (userCredential.user.metadata.creationTime === userCredential.user.metadata.lastSignInTime) {
      try {
        // Get the stored name for registration
        const storedName = typeof window !== 'undefined' 
          ? window.localStorage.getItem('nameForRegistration')
          : null

        // Create the user document in Firestore for new users
        await createUserDocumentWithRetry({
          uid: userCredential.user.uid,
          email: userCredential.user.email!,
          name: storedName || userCredential.user.email!.split('@')[0],
          photoURL: null,
          provider: 'email'
        })
      } catch (firestoreError) {
        console.error('Error creating Firestore user document:', firestoreError)
        // Don't return error here - the user is still authenticated
        // We'll handle Firestore document creation later if needed
      }
    }
    
    return { user: userCredential.user, error: null }
  } catch (error) {
    // If the user is actually signed in despite the error, return success
    if (auth.currentUser) {
      return { user: auth.currentUser, error: null }
    }
    return { user: null, error: error as AuthError }
  }
}

// Function to link email link auth to existing account
export const linkWithEmailLink = async (email: string) => {
  try {
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      return { error: { code: 'auth/invalid-link', message: 'Invalid sign-in link' } as AuthError }
    }

    const credential = EmailAuthProvider.credentialWithLink(email, window.location.href)
    
    if (!auth.currentUser) {
      return { error: { code: 'auth/no-user', message: 'No user is currently signed in' } as AuthError }
    }

    const result = await linkWithCredential(auth.currentUser, credential)
    return { user: result.user, error: null }
  } catch (error) {
    return { error: error as AuthError }
  }
}

// Function to reauthenticate with email link
export const reauthenticateWithEmailLink = async (email: string) => {
  try {
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      return { error: { code: 'auth/invalid-link', message: 'Invalid sign-in link' } as AuthError }
    }

    const credential = EmailAuthProvider.credentialWithLink(email, window.location.href)
    
    if (!auth.currentUser) {
      return { error: { code: 'auth/no-user', message: 'No user is currently signed in' } as AuthError }
    }

    const result = await reauthenticateWithCredential(auth.currentUser, credential)
    return { user: result.user, error: null }
  } catch (error) {
    return { error: error as AuthError }
  }
}

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { user: userCredential.user, error: null }
  } catch (error) {
    return { user: null, error: error as AuthError }
  }
}

export const registerWithEmail = async (email: string, password: string, name: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    // Create the user document in Firestore
    await createUser({
      uid: userCredential.user.uid,
      email: userCredential.user.email!,
      name
    })
    
    return { user: userCredential.user, error: null }
  } catch (error) {
    return { user: null, error: error as AuthError }
  }
}

export const loginWithGoogle = async () => {
  try {
    console.log('Starting Google sign-in process')
    
    // Clear any stored email/registration data to prevent conflicts
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('emailForSignIn')
      window.localStorage.removeItem('nameForRegistration')
    }
    
    // Use signInWithPopup instead of redirect for better error handling
    const result = await signInWithPopup(auth, googleProvider)
    console.log('Google sign-in successful:', result.user.email)
    
    // Create/update user document
    await createUserDocumentWithRetry({
      uid: result.user.uid,
      email: result.user.email!,
      name: result.user.displayName || result.user.email!.split('@')[0],
      photoURL: result.user.photoURL,
      provider: 'google'
    })
    
    return { user: result.user, error: null }
  } catch (error) {
    console.error('Google sign-in error:', error)
    return { user: null, error: error as AuthError }
  }
}

export const handleRedirectResult = async () => {
  try {
    console.log('Checking for redirect result')
    const result = await getRedirectResult(auth)
    console.log('Redirect result:', result)
    
    if (!result) {
      console.log('No redirect result found')
      // If we have a current user but no result, they might have been signed in already
      if (auth.currentUser) {
        console.log('User already signed in:', auth.currentUser)
        return { user: auth.currentUser, error: null }
      }
      return { user: null, error: null }
    }

    // We have a result, let's process it
    console.log('Processing successful sign-in for user:', result.user.email)
    
    try {
      // Always try to create/update the user document
      const userData = {
        uid: result.user.uid,
        email: result.user.email!,
        name: result.user.displayName || result.user.email!.split('@')[0],
        photoURL: result.user.photoURL || null,
        provider: 'google'
      }
      console.log('Creating/updating user with data:', userData)
      
      const createResult = await createUser(userData)
      if (createResult.error) {
        console.error('Error creating/updating user document:', createResult.error)
        // Try one more time after a short delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        const retryResult = await createUser(userData)
        if (retryResult.error) {
          console.error('Error on retry of user document creation:', retryResult.error)
        } else {
          console.log('User document created successfully on retry')
        }
      } else {
        console.log('User document created/updated successfully')
      }
      
      return { user: result.user, error: null }
    } catch (error) {
      console.error('Error processing sign-in result:', error)
      // If we have a user despite the error, return success
      if (result.user) {
        return { user: result.user, error: null }
      }
      throw error // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error('Error handling redirect result:', error)
    return { user: null, error: error as AuthError }
  }
}

export const logout = async () => {
  try {
    await signOut(auth)
    return { error: null }
  } catch (error) {
    return { error: error as AuthError }
  }
}

export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback)
}

// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!auth.currentUser
}

// Helper function to get current user
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser
}

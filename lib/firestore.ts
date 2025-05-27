import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  DocumentReference
} from 'firebase/firestore'
import { db } from './firebase'

export type UserPlan = 'free' | 'premium'

export interface User {
  uid: string
  email: string
  name: string
  plan: UserPlan
  stripeCustomerId?: string
  activeSubscription: boolean
  subscriptionId?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserData {
  uid: string
  email: string
  name: string
}

export interface UserData {
  uid: string
  email: string
  name: string
  photoURL?: string | null
  provider?: string
  plan?: UserPlan
  stripeCustomerId?: string
  activeSubscription?: boolean
  subscriptionId?: string
  createdAt?: Date
  updatedAt?: Date
}

export const createUser = async (userData: UserData) => {
  try {
    console.log('Creating user document with data:', userData)
    const userRef = doc(db, 'users', userData.uid)
    
    // Check if user already exists
    const userDoc = await getDoc(userRef)
    if (userDoc.exists()) {
      console.log('User document already exists, updating instead')
      const updateData = {
        ...userData,
        updatedAt: serverTimestamp()
      }
      console.log('Updating with data:', updateData)
      await updateDoc(userRef, updateData)
      return { error: null }
    }

    // Set default values for new user
    const userDataWithDefaults = {
      ...userData,
      plan: userData.plan || 'free',
      activeSubscription: userData.activeSubscription || false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    console.log('Setting user document with data:', userDataWithDefaults)
    await setDoc(userRef, userDataWithDefaults)
    
    // Verify the document was created
    const verifyDoc = await getDoc(userRef)
    if (!verifyDoc.exists()) {
      console.error('Document was not created successfully')
      return { error: new Error('Document creation failed verification') }
    }
    
    console.log('User document created and verified successfully')
    return { error: null }
  } catch (error: any) {
    console.error('Error in createUser:', error)
    // Add more error details
    const errorDetails = {
      message: error?.message || 'Unknown error',
      code: error?.code || 'unknown',
      stack: error?.stack || '',
      userData: userData
    }
    console.error('Error details:', errorDetails)
    return { error }
  }
}

export const getUser = async (uid: string): Promise<User | null> => {
  const userRef = doc(db, 'users', uid)
  const userSnap = await getDoc(userRef)
  
  if (!userSnap.exists()) {
    return null
  }
  
  return userSnap.data() as User
}

export const updateUser = async (
  uid: string, 
  data: Partial<Omit<User, 'uid' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  const userRef = doc(db, 'users', uid)
  
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp()
  })
}

export const updateUserSubscription = async (
  uid: string,
  stripeCustomerId: string,
  subscriptionId: string,
  plan: UserPlan
): Promise<void> => {
  const userRef = doc(db, 'users', uid)
  
  await updateDoc(userRef, {
    stripeCustomerId,
    subscriptionId,
    plan,
    activeSubscription: true,
    updatedAt: serverTimestamp()
  })
}

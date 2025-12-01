import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getMessaging } from 'firebase-admin/messaging'
import { getFirestore } from 'firebase-admin/firestore'

export const useFirebaseAdmin = () => {
  const config = useRuntimeConfig()

  if (getApps().length === 0) {
    // Ensure we have the required credentials
    if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      console.warn('Firebase Admin credentials not found in environment variables.')
      return { messaging: null, firestore: null }
    }

    const serviceAccount = {
      projectId: config.public.firebaseProjectId,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }

    initializeApp({
      credential: cert(serviceAccount)
    })
  }

  return { messaging: getMessaging(), firestore: getFirestore() }
}

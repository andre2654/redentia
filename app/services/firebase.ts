import { initializeApp, getApps, getApp } from 'firebase/app'
import { getMessaging } from 'firebase/messaging'

export const useFirebase = () => {
    const config = useRuntimeConfig()

    const firebaseConfig = {
        apiKey: config.public.firebaseApiKey,
        authDomain: config.public.firebaseAuthDomain,
        projectId: config.public.firebaseProjectId,
        storageBucket: config.public.firebaseStorageBucket,
        messagingSenderId: config.public.firebaseMessagingSenderId,
        appId: config.public.firebaseAppId,
    }

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

    let messaging = null
    if (process.client) {
        messaging = getMessaging(app)
    }

    return { app, messaging }
}

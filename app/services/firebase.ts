import { initializeApp, getApps, getApp } from 'firebase/app'
import { getMessaging } from 'firebase/messaging'

// Environments where Firebase Messaging unconditionally throws on init:
//   - Instagram in-app browser (no serviceWorker, no PushManager)
//   - Facebook/Messenger in-app browsers
//   - iOS Safari private mode (partial)
//   - Older Android WebView shells
//
// `getMessaging(app)` calls `navigator.serviceWorker.addEventListener`
// synchronously during init. If serviceWorker is absent, it throws
// TypeError and crashes Vue hydration, which used to flip the page to
// `error.vue` ("500 Erro interno"). Feature-detect BEFORE calling so
// the page just renders without push notifications in those clients.
function supportsMessaging(): boolean {
    if (typeof window === 'undefined') return false
    if (typeof navigator === 'undefined') return false
    if (!('serviceWorker' in navigator)) return false
    if (!('PushManager' in window)) return false
    if (!('Notification' in window)) return false
    return true
}

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

    let messaging: ReturnType<typeof getMessaging> | null = null
    if (process.client && supportsMessaging()) {
        try {
            messaging = getMessaging(app)
        } catch {
            // Defensive: even with feature-detect, some embedded browsers
            // report `serviceWorker in navigator` true but error on actual
            // add/register. Swallow and continue without messaging.
            messaging = null
        }
    }

    return { app, messaging }
}

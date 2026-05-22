/**
 * useFirebaseNotifications — Web Push via FCM (PWA Sprint 1, 2026-05-22).
 *
 * Substitui o stub no-op que tinha vivido desde 2026-05-04 (PWA kill
 * switch). Fluxo:
 *   1. enable() — pede permission do browser → registra SW FCM →
 *      pega token via getToken(VAPID) → persiste no backend
 *   2. disable() — apaga token no backend e local state
 *   3. Foreground message listener — quando user tá com PWA aberto,
 *      mostra toast in-app via UToast (não duplica com SW notification)
 *
 * NÃO chamar no first paint — UX horrível. Sempre via botão "Receber
 * alertas" em /settings/notifications ou banner discreto na carteira.
 *
 * Veja Obsidian-Vault/Redentia/PWA-Widgets/08 - Day 5 — Web Push + Badge.md
 */
import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging'
import { ref } from 'vue'

const LOCAL_STORAGE_KEY = 'redentia:push:state'

interface EnableResult {
  ok: boolean
  reason?:
    | 'unsupported'
    | 'denied'
    | 'no_token'
    | 'no_sw'
    | 'config_missing'
    | 'register_failed'
    | 'fcm_failed'
  message?: string
}

export const useFirebaseNotifications = () => {
  const token = ref<string | null>(null)
  const permissionStatus = ref<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default',
  )

  /**
   * Pede permission + registra device token no backend.
   * Idempotente: chamar 2x consecutivos não duplica nada (FCM dedupe
   * por token, backend faz updateOrCreate).
   */
  async function enable(): Promise<EnableResult> {
    if (typeof window === 'undefined') {
      return { ok: false, reason: 'unsupported' }
    }
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      return { ok: false, reason: 'unsupported' }
    }

    // 1. Confirma suporte FCM no browser (iOS Safari < 16.4 falha aqui).
    const supported = await isSupported().catch(() => false)
    if (!supported) return { ok: false, reason: 'unsupported' }

    // 2. Pede permissão (no-op se já foi concedida).
    const perm = await Notification.requestPermission()
    permissionStatus.value = perm
    if (perm !== 'granted') return { ok: false, reason: 'denied' }

    const config = useRuntimeConfig()
    const pub = config.public as Record<string, string | undefined>

    const firebaseConfig = {
      apiKey: pub.firebaseApiKey ?? '',
      authDomain: pub.firebaseAuthDomain ?? '',
      projectId: pub.firebaseProjectId ?? '',
      storageBucket: pub.firebaseStorageBucket ?? '',
      messagingSenderId: pub.firebaseMessagingSenderId ?? '',
      appId: pub.firebaseAppId ?? '',
    }
    const vapidKey = pub.firebaseVapidKey

    if (!firebaseConfig.apiKey || !vapidKey) {
      return { ok: false, reason: 'config_missing' }
    }

    // 3. Inicializa Firebase (idempotente — checa se já tem app).
    const app = getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig)

    // 4. Registra o SW FCM (path fixo na public/).
    let registration: ServiceWorkerRegistration
    try {
      registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/',
      })
      // Espera o SW ativo antes de mandar config.
      await navigator.serviceWorker.ready
    } catch (err) {
      console.error('[useWebPush] SW register failed', err)
      return { ok: false, reason: 'register_failed', message: String(err) }
    }

    // 5. Envia config Firebase pro SW. O SW precisa pra hidratar
    // `firebase.initializeApp()` no scope de background. Sem isso o
    // SW só ouve postMessage e ignora pushes.
    if (registration.active) {
      registration.active.postMessage({
        type: 'FIREBASE_CONFIG',
        config: firebaseConfig,
      })
    }

    // 6. Get FCM token (negocia VAPID).
    let fcmToken: string | null = null
    try {
      const messaging = getMessaging(app)
      fcmToken = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: registration,
      })
    } catch (err) {
      console.error('[useWebPush] getToken failed', err)
      return { ok: false, reason: 'fcm_failed', message: String(err) }
    }

    if (!fcmToken) return { ok: false, reason: 'no_token' }
    token.value = fcmToken

    // 7. Persiste no backend.
    try {
      await $fetch('/push/register', {
        baseURL: config.public.apiBaseUrl as string,
        method: 'POST',
        credentials: 'include',
        body: {
          token: fcmToken,
          kind: 'web',
          user_agent: navigator.userAgent,
        },
      })
    } catch (err) {
      // Falhou persistir → push não vai chegar mas permission tá OK
      // (não bloqueia o resto, só loga).
      console.warn('[useWebPush] register backend failed', err)
    }

    // 8. Foreground listener: PWA aberto → toast in-app em vez de SW notif
    // (sem isso o user veria notif duplicada na barra do sistema).
    try {
      const messaging = getMessaging(app)
      onMessage(messaging, (payload) => {
        const toast = (window as unknown as { $useToast?: () => { add?: (n: unknown) => void } }).$useToast?.()
        if (toast?.add) {
          toast.add({
            title: payload.notification?.title ?? 'Redentia',
            description: payload.notification?.body ?? '',
            icon: 'i-lucide-bell',
            timeout: 8000,
          })
        }
      })
    } catch {
      // foreground listener falhou — não bloqueia o resto
    }

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, 'enabled')
    } catch { /* private mode */ }

    return { ok: true }
  }

  async function disable(): Promise<void> {
    const config = useRuntimeConfig()
    try {
      await $fetch('/push/unregister', {
        baseURL: config.public.apiBaseUrl as string,
        method: 'POST',
        credentials: 'include',
        body: token.value ? { token: token.value } : {},
      })
    } catch {
      // backend down ok — local state já reflete
    }
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
    } catch { /* private mode */ }
    token.value = null
  }

  function isEnabled(): boolean {
    if (typeof window === 'undefined') return false
    if (typeof Notification === 'undefined') return false
    if (Notification.permission !== 'granted') return false
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEY) === 'enabled'
    } catch {
      return false
    }
  }

  return {
    token,
    permissionStatus,
    enable,
    disable,
    isEnabled,
    // Aliases pra compat com o stub antigo (callers em app.vue, footer.vue, etc).
    requestPermission: enable,
    checkPermission: async () => {
      if (typeof Notification !== 'undefined') {
        permissionStatus.value = Notification.permission
      }
    },
    listen: async () => { /* setup já feito dentro de enable() */ },
    cleanup: () => { /* no-op — SW persiste entre sessões */ },
  }
}

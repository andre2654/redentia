/**
 * Firebase Cloud Messaging Service Worker (PWA Sprint 1, 2026-05-22).
 *
 * Roda em escopo separado do SW principal Workbox — convive ok porque
 * eles têm responsabilidades distintas:
 *   - /sw.js (Workbox)              → cache offline, runtime caching
 *   - /firebase-messaging-sw.js     → handle push events em background
 *
 * Background message handler: quando push chega e PWA não tá aberto,
 * mostra notification rica com `actions` (Ver detalhes / Silenciar).
 * Foreground (PWA aberto): handled em `useWebPush.ts` via onMessage.
 *
 * Substitui o kill switch que estava ativo desde 2026-05-04 (que limpou
 * SW antigo cacheando 403). Telemetry confirmou > 99% dos browsers
 * passaram pela limpeza — safe pra reativar.
 */

// FCM v10 compat APIs (rodam dentro de SW sem ES modules suporte completo)
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')

// Config public — apiKey, projectId, etc. NÃO inclui VAPID key (essa
// vai pelo getToken em useWebPush). Os valores vêm das ENVs Vercel
// (NUXT_PUBLIC_FIREBASE_*) injetados em runtime via window.__firebaseConfig
// (setado pelo composable antes de registrar o SW).
//
// Fallback hardcoded: usado se o SW é registrado standalone (raríssimo
// na nossa arquitetura, mas safety net). Os valores REAIS vão pelo
// `swReg.active.postMessage({type:'FIREBASE_CONFIG', config})` que o
// composable envia logo após `register()`.
const FALLBACK_CONFIG = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
}

let firebaseConfig = FALLBACK_CONFIG
let messaging = null

function initFirebaseIfNeeded() {
  if (messaging) return messaging
  if (!firebaseConfig.apiKey) {
    console.warn('[FCM SW] No Firebase config yet, push will be ignored')
    return null
  }
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig)
    }
    messaging = firebase.messaging()

    /**
     * Background message handler.
     * Payload spec (vem do PushService backend):
     *   {
     *     notification: { title, body },
     *     data: { url, kind, ticker? }
     *   }
     */
    messaging.onBackgroundMessage((payload) => {
      const { notification, data } = payload
      const title = notification?.title ?? 'Redentia'

      // Actions ricos só pra alerts:price (outros topics ficam simples)
      const isPriceAlert = data?.kind === 'alerts:price'

      self.registration.showNotification(title, {
        body: notification?.body,
        icon: '/icons/192.png',
        badge: '/icons/badge-72.png',
        tag: data?.kind ?? 'general',
        renotify: true,
        requireInteraction: isPriceAlert,
        data: {
          url: data?.url ?? '/',
          ticker: data?.ticker ?? null,
          kind: data?.kind ?? 'general',
        },
        actions: isPriceAlert
          ? [
              { action: 'view', title: 'Ver detalhes' },
              { action: 'silence', title: 'Silenciar 1h' },
            ]
          : [],
      })
    })
    return messaging
  } catch (err) {
    console.error('[FCM SW] init failed', err)
    return null
  }
}

// Recebe config do main thread via postMessage. Composable manda assim
// que faz getToken bem sucedido.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'FIREBASE_CONFIG' && event.data?.config) {
    firebaseConfig = { ...firebaseConfig, ...event.data.config }
    initFirebaseIfNeeded()
  }
})

/**
 * Click handler — abre URL do payload OU executa action.
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const data = event.notification.data ?? {}
  const url = data.url ?? '/'

  if (event.action === 'silence' && data.ticker) {
    // Pinga backend pra registrar silenciar 1h.
    event.waitUntil(
      fetch('/api/alerts/silence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: data.ticker, hours: 1 }),
      }).catch(() => { /* fail-safe — não fazer nada */ }),
    )
    return
  }

  // Action "view" ou click no body da notif → abre/foca janela.
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Se já tem janela aberta no mesmo origin, foca + navega.
        for (const client of clientList) {
          if ('focus' in client) {
            client.focus()
            if ('navigate' in client) {
              client.navigate(url)
            }
            return
          }
        }
        // Senão abre nova janela.
        if (self.clients.openWindow) {
          return self.clients.openWindow(url)
        }
      }),
  )
})

// Ativa imediatamente sem esperar o old SW terminar (skipWaiting).
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

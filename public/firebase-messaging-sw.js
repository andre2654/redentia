/**
 * KILL SWITCH (PWA removido em 2026-05-04)
 *
 * Esse SW substitui o anterior do Firebase Messaging. Quando os browsers
 * dos usuarios atualizarem, vao pegar este SW, executar a limpeza e ficar
 * sem PWA registrado. Assim eliminamos o problema de SW zumbi servindo
 * 403 cached de versoes antigas.
 *
 * O `@vite-pwa/nuxt` no nuxt.config.ts esta com `selfDestroying: true`
 * pra gerar /sw.js que tambem se auto-desregistra. Este aqui e camada
 * extra de seguranca pra browsers que tinham firebase-messaging-sw.js
 * registrado standalone.
 */

self.addEventListener('install', () => {
  // Pula a fila de waiting e ativa imediatamente
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      // Toma controle de todos os clients abertos
      await self.clients.claim()
    } catch (e) { /* noop */ }

    try {
      // Apaga todos os caches do CacheStorage
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map((name) => caches.delete(name)))
    } catch (e) { /* noop */ }

    try {
      // Desregistra este service worker
      await self.registration.unregister()
    } catch (e) { /* noop */ }

    try {
      // Recarrega cada janela aberta para sair do controle do SW
      const clients = await self.clients.matchAll({ type: 'window' })
      clients.forEach((c) => {
        try { c.navigate(c.url) } catch (e) { /* noop */ }
      })
    } catch (e) { /* noop */ }
  })())
})

// Pass-through: nao intercepta fetches. Garante que enquanto o SW
// estiver ativo (entre install e a unregister assincrona), nao
// retornamos respostas erradas do cache anterior.
self.addEventListener('fetch', () => { /* noop */ })

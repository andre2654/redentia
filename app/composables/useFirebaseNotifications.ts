/**
 * STUB (PWA removido em 2026-05-04).
 *
 * O composable original usava `firebase/messaging` + service worker pra
 * push notifications. Removido junto com a PWA. Mantemos a API publica
 * com no-ops para nao quebrar callers em app.vue, footer.vue, index.vue.
 *
 * Quando reintroduzir push notifications no futuro, restaurar logica
 * original ou substituir por implementacao via servico de terceiros
 * (OneSignal, Pushwoosh, etc.) ou web push API direta.
 */
export const useFirebaseNotifications = () => {
  const token = ref<string | null>(null)
  const permissionStatus = ref<NotificationPermission>('default')

  const noop = async () => { /* PWA removido, no-op */ }

  return {
    token,
    permissionStatus,
    checkPermission: noop,
    requestPermission: noop,
    listen: noop,
    cleanup: () => { /* noop */ },
  }
}

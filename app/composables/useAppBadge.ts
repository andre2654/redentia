/**
 * useAppBadge — wrapper minimalista da Web Badging API.
 *
 * Suporte (2026-05):
 *   ✓ Chrome desktop, Edge, Opera
 *   ✓ Android Chrome (com PWA installed)
 *   ✗ Safari (iOS e macOS)
 *   ✗ Firefox
 *
 * Behavior: invisível em browsers sem suporte (no-op). Chamadores não
 * precisam guardar `supported` — só chamar `set(N)` e funciona onde
 * dá.
 *
 * Integração esperada:
 *   - `useAlerts.ts` chama `set(unreadCount)` quando count muda
 *   - `useFirebaseNotifications` listener foreground também atualiza
 *   - User abre /alerts → chama `clear()`
 */
export function useAppBadge() {
  const supported = typeof navigator !== 'undefined' && 'setAppBadge' in navigator

  function set(count: number): void {
    if (!supported) return
    try {
      if (count <= 0) {
        ;(navigator as unknown as { clearAppBadge?: () => Promise<void> }).clearAppBadge?.()
      } else {
        ;(navigator as unknown as { setAppBadge: (n?: number) => Promise<void> }).setAppBadge(count)
      }
    } catch {
      // Algumas implementações lançam quando count >= 2^31. Cap em 9999
      // pra ficar visual coerente e não correr risco.
      try {
        ;(navigator as unknown as { setAppBadge: (n?: number) => Promise<void> }).setAppBadge(
          Math.min(count, 9999),
        )
      } catch { /* desiste silenciosamente */ }
    }
  }

  function clear(): void {
    if (!supported) return
    try {
      ;(navigator as unknown as { clearAppBadge?: () => Promise<void> }).clearAppBadge?.()
    } catch { /* no-op */ }
  }

  return { set, clear, supported }
}

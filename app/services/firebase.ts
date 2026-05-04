/**
 * STUB (PWA removido em 2026-05-04).
 *
 * O service original inicializava Firebase + Firebase Messaging pra
 * receber push notifications via service worker. Removido junto com
 * a PWA. Mantemos a API publica com `messaging: null` pra nao quebrar
 * callers (notavelmente useFirebaseNotifications, que tambem virou
 * stub).
 *
 * Quando reintroduzir Firebase no futuro (auth, firestore, etc.),
 * restaurar inicializacao aqui. O package `firebase` continua no
 * package.json pra facilitar reativacao.
 */
export const useFirebase = () => {
  return { app: null, messaging: null }
}

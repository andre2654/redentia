/**
 * useChatClientId — stable per-browser identifier for the chat service.
 *
 * Anonymous users don't have a JWT, so the chat-service can't tell two
 * unauthenticated browsers apart. Without a client id, the
 * `/api/chat/sessions` list always returns empty (the backend won't
 * scope sessions to "no userId in particular"). That's why the
 * sidebar history was blank for logged-out users.
 *
 * Strategy:
 *   - Generate a UUID once and persist it in localStorage.
 *   - Send it on every chat request as `X-Client-Id`.
 *   - The backend tags anonymous sessions with this id and lists
 *     them back to the same browser on page reload.
 *   - Logged-in users still take precedence — server prefers
 *     `userId` from the JWT and ignores client id.
 *
 * SSR-safe: returns null on the server, the real id only after
 * mount in the browser. Callers should treat null as "skip the
 * header" — the chat will still work, just without history.
 */
const STORAGE_KEY = 'redentia_chat_client_id'

let _cached: string | null = null

function readOrCreate(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY)
    if (existing && /^[a-zA-Z0-9_-]{8,64}$/.test(existing)) {
      return existing
    }
    const fresh = crypto.randomUUID()
    window.localStorage.setItem(STORAGE_KEY, fresh)
    return fresh
  } catch {
    // Private mode / disabled storage — degrade silently. The chat
    // works, the user just doesn't get history persistence.
    return null
  }
}

/**
 * Get the chat client id. Cached after first call. Always returns
 * the same value across the app's lifetime in this tab.
 */
export function useChatClientId(): string | null {
  if (_cached) return _cached
  _cached = readOrCreate()
  return _cached
}

/**
 * Convenience: returns headers to spread into a fetch request.
 * Empty object when SSR or storage unavailable.
 */
export function chatClientIdHeaders(): Record<string, string> {
  const id = useChatClientId()
  return id ? { 'X-Client-Id': id } : {}
}

/**
 * useMetaPixel — disparo DUAL de eventos Meta (Pixel browser + CAPI server)
 * com user_data enriquecido pra match quality.
 *
 * ============ FLUXO DUAL ============
 *
 * Cada chamada de `track()` dispara em PARALELO:
 *
 *   1. fbq('track', evento, params, { eventID })   ← browser (pixel JS)
 *   2. POST /api/track/meta-event                  ← server (Nitro → Meta CAPI)
 *
 * Ambos enviam o MESMO `event_id` (uuid). Quando os 2 chegam na Meta,
 * ela dedupe automaticamente.
 *
 * ============ MATCH QUALITY ============
 *
 * O CAPI envia tambem `user_data` enriquecido pra Meta casar usuario:
 *
 *   - fbp:         cookie _fbp do browser (ID persistente)
 *   - fbc:         cookie _fbc OU construido a partir do fbclid da URL
 *                  (quando user vem de um clique em ad). +100% conversoes.
 *   - em:          sha256(email) se user logado. +100% conversoes.
 *   - fn / ln:     sha256(first_name / last_name) se user logado. +5-10%.
 *   - external_id: user_id da Redentia se logado. +17%.
 *
 * Match quality alvo: 6.0/10 (ate +120% conversoes vs 3.0/10 atual).
 */
type FbqWindow = Window & { fbq?: (...args: unknown[]) => void }

interface MetaUserData {
  fbp?: string
  fbc?: string
  em?: string[]
  fn?: string[]
  ln?: string[]
  external_id?: string[]
}

function generateEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

/** SHA-256 hex via Web Crypto API. Normalizado: lowercase + trim. */
async function sha256(text: string): Promise<string> {
  if (!text) return ''
  const normalized = text.toLowerCase().trim()
  if (typeof crypto === 'undefined' || !crypto.subtle) return ''
  const encoder = new TextEncoder()
  const data = encoder.encode(normalized)
  const buffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Le cookies _fbp e _fbc do browser. Se _fbc nao existe mas a URL
 * tem `fbclid`, constroi o fbc no formato esperado pela Meta:
 * `fb.1.{timestamp_ms}.{fbclid}`.
 *
 * IMPORTANTE: Meta exige o fbclid EXATAMENTE como veio na URL,
 * sem URL-decode. Por isso extraimos via regex do query string raw
 * em vez de URLSearchParams (que faz auto-decode silencioso).
 * Decodificar pode mudar `%2D` em `-`, `%5F` em `_`, etc, e a Meta
 * marca como "fbclid modificado" baixando match quality.
 */
function getMetaCookies(): { fbp?: string; fbc?: string } {
  if (typeof document === 'undefined') return {}
  const result: { fbp?: string; fbc?: string } = {}

  const fbpMatch = document.cookie.match(/(?:^| )_fbp=([^;]+)/)
  if (fbpMatch) result.fbp = fbpMatch[1]

  const fbcMatch = document.cookie.match(/(?:^| )_fbc=([^;]+)/)
  if (fbcMatch) {
    result.fbc = fbcMatch[1]
  } else {
    try {
      // Raw extract — NAO usar URLSearchParams (auto-decode quebra fbclid).
      const search = window.location.search || ''
      const m = search.match(/[?&]fbclid=([^&#]+)/)
      if (m && m[1]) {
        result.fbc = `fb.1.${Date.now()}.${m[1]}`
      }
    } catch {
      // location indisponivel, ignora
    }
  }

  return result
}

/**
 * Constroi o user_data do CAPI: cookies + dados hashed do user logado
 * (se houver). Tudo opcional — Meta usa o que vier.
 */
async function buildUserData(): Promise<MetaUserData> {
  if (!import.meta.client) return {}

  const cookies = getMetaCookies()
  const userData: MetaUserData = { ...cookies }

  // Tenta enriquecer com dados do user logado.
  // useAuthStore() funciona em qualquer lugar do client onde Pinia
  // esteja inicializado (que e sempre, no Nuxt 3).
  try {
    const authStore = useAuthStore()
    const me = authStore.me

    if (me?.email) {
      const hash = await sha256(me.email)
      if (hash) userData.em = [hash]
    }
    if (me?.id) {
      userData.external_id = [String(me.id)]
    }
    if (me?.name) {
      const parts = me.name.trim().split(/\s+/)
      const firstName = parts[0] || ''
      const lastName = parts.length > 1 ? parts[parts.length - 1] : ''
      if (firstName) {
        const hash = await sha256(firstName)
        if (hash) userData.fn = [hash]
      }
      if (lastName) {
        const hash = await sha256(lastName)
        if (hash) userData.ln = [hash]
      }
    }
  } catch {
    // authStore nao disponivel ou user nao logado, segue so com cookies
  }

  return userData
}

function callFbq(
  method: 'track' | 'trackCustom',
  event: string,
  params: Record<string, unknown>,
  eventId: string,
) {
  if (!import.meta.client) return
  const w = window as FbqWindow
  if (typeof w.fbq !== 'function') return
  // 4o argumento `{ eventID }` permite Meta deduplicar entre browser e server.
  const opts = { eventID: eventId }
  if (Object.keys(params).length > 0) {
    w.fbq(method, event, params, opts)
  } else {
    w.fbq(method, event, {}, opts)
  }
}

async function callCapi(
  event: string,
  params: Record<string, unknown>,
  eventId: string,
) {
  if (!import.meta.client) return

  const userData = await buildUserData()

  try {
    await $fetch('/api/track/meta-event', {
      method: 'POST',
      body: {
        event_name: event,
        event_id: eventId,
        event_source_url: window.location.href,
        user_data: userData,
        custom_data: params,
      },
      timeout: 5000,
    })
  } catch (err) {
    if (import.meta.dev) {
      console.warn('[useMetaPixel] CAPI dispatch failed:', err)
    }
  }
}

export function useMetaPixel() {
  function track(event: string, params: Record<string, unknown> = {}) {
    const eventId = generateEventId()
    callFbq('track', event, params, eventId)
    // Fire-and-forget: nao bloqueia UI nem o codigo do caller.
    callCapi(event, params, eventId).catch(() => { /* silent */ })
  }
  function trackCustom(event: string, params: Record<string, unknown> = {}) {
    const eventId = generateEventId()
    callFbq('trackCustom', event, params, eventId)
    callCapi(event, params, eventId).catch(() => { /* silent */ })
  }
  return { track, trackCustom }
}

/**
 * useMetaPixel — disparo DUAL de eventos Meta (Pixel browser + CAPI server).
 *
 * O snippet base (`fbq('init')` + PageView automatico) e injetado pelo
 * plugin `plugins/meta-pixel.client.ts`. Este composable expoe helpers
 * para eventos de conversao chamados de qualquer pagina.
 *
 * ============ FLUXO DUAL ============
 *
 * Cada chamada de `track()` dispara em PARALELO:
 *
 *   1. fbq('track', evento, params, { eventID })   ← browser (pixel JS)
 *   2. POST /api/track/meta-event                  ← server (Nitro → Meta CAPI)
 *
 * Ambos enviam o MESMO `event_id` (uuid). Quando os 2 chegam na Meta,
 * ela dedupe automaticamente. Se o pixel JS for bloqueado (adblock, iOS),
 * o CAPI ainda registra o evento. Match rate sobe de ~30% pra ~85%.
 *
 * Eventos padrao da Meta usam `track`. Eventos custom (nao listados na
 * Meta) usam `trackCustom`. Sempre passe parametros relevantes — eles
 * alimentam o Andromeda para otimizar entrega.
 */
type FbqWindow = Window & { fbq?: (...args: unknown[]) => void }

function generateEventId(): string {
  // crypto.randomUUID e padrao em browsers modernos (Chrome 92+, Safari 15.4+,
  // Firefox 95+). Fallback pra timestamp + random pra navegadores antigos.
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
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
  // O 4o argumento `{ eventID }` e o que permite Meta deduplicar
  // entre o evento browser (pixel) e o evento server (CAPI). Se nao
  // passar, Meta conta os 2 disparos como eventos distintos = inflado.
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
  // Best-effort: nao bloqueia UI se CAPI falhar. O pixel browser
  // ja foi disparado em paralelo, entao mesmo se o CAPI falhar
  // (timeout, etc), o evento ainda chega via pixel.
  try {
    await $fetch('/api/track/meta-event', {
      method: 'POST',
      body: {
        event_name: event,
        event_id: eventId,
        event_source_url: window.location.href,
        custom_data: params,
      },
      // Timeout curto pra nao segurar nada
      timeout: 5000,
    })
  } catch (err) {
    // Silencioso em prod. Loga so em dev.
    if (import.meta.dev) {
      console.warn('[useMetaPixel] CAPI dispatch failed:', err)
    }
  }
}

export function useMetaPixel() {
  function track(event: string, params: Record<string, unknown> = {}) {
    const eventId = generateEventId()
    // Disparo paralelo: pixel JS no browser + CAPI no server.
    // Ambos usam o mesmo event_id pra Meta deduplicar.
    callFbq('track', event, params, eventId)
    callCapi(event, params, eventId)
  }
  function trackCustom(event: string, params: Record<string, unknown> = {}) {
    const eventId = generateEventId()
    callFbq('trackCustom', event, params, eventId)
    callCapi(event, params, eventId)
  }
  return { track, trackCustom }
}

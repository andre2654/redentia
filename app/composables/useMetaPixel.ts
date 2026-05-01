/**
 * useMetaPixel — disparo de eventos do Meta Pixel.
 *
 * O snippet base (`fbq('init')` + PageView automatico) e injetado pelo
 * plugin `plugins/meta-pixel.client.ts`. Este composable expoe helpers
 * para eventos de conversao chamados de qualquer pagina.
 *
 * Eventos padrao da Meta usam `track`. Eventos custom (nao listados na
 * Meta) usam `trackCustom`. Sempre passe parametros relevantes — eles
 * alimentam o Andromeda para otimizar entrega.
 */
type FbqWindow = Window & { fbq?: (...args: unknown[]) => void }

function callFbq(method: 'track' | 'trackCustom', event: string, params: Record<string, unknown>) {
  if (!import.meta.client) return
  const w = window as FbqWindow
  if (typeof w.fbq !== 'function') return
  if (Object.keys(params).length > 0) {
    w.fbq(method, event, params)
  } else {
    w.fbq(method, event)
  }
}

export function useMetaPixel() {
  function track(event: string, params: Record<string, unknown> = {}) {
    callFbq('track', event, params)
  }
  function trackCustom(event: string, params: Record<string, unknown> = {}) {
    callFbq('trackCustom', event, params)
  }
  return { track, trackCustom }
}

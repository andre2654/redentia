/**
 * Meta Conversions API (CAPI) — server-side event dispatch.
 *
 * Por que existe: o pixel JS no browser e bloqueado por:
 *   - Adblockers (~50% mobile BR)
 *   - iOS 14.5+ ATT (~25% iOS)
 *   - Browsers privados (Safari ITP, Brave shields)
 *
 * Resultado real medido: 107 LPVs vs 14 ContentView (87% perda).
 *
 * CAPI bypassa tudo isso enviando o evento DIRETO do nosso server pro
 * Meta, sem depender do navegador do usuario carregar o pixel.js.
 *
 * Deduplicacao: o composable useMetaPixel envia o MESMO `event_id`
 * tanto via fbq() (browser) quanto via este endpoint (server).
 * Quando os 2 chegam, Meta dedupa automaticamente.
 *
 * Match rate antes (so pixel): ~30%
 * Match rate depois (pixel + CAPI): ~85%
 */

interface CapiUserData {
  em?: string[]      // sha256(email)
  ph?: string[]      // sha256(phone)
  fn?: string[]      // sha256(first name)
  ln?: string[]      // sha256(last name)
  ct?: string[]      // sha256(city)
  st?: string[]      // sha256(state)
  zp?: string[]      // sha256(zip)
  country?: string[] // sha256(country)
  external_id?: string[]
  fbp?: string       // _fbp cookie raw (no hash)
  fbc?: string       // fbclid raw (no hash)
}

interface CapiEventBody {
  event_name: string
  event_id: string
  event_source_url?: string
  user_data?: CapiUserData
  custom_data?: Record<string, unknown>
  test_event_code?: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const pixelId = config.metaPixelIdServer as string
  const accessToken = config.metaCapiAccessToken as string

  if (!pixelId || !accessToken) {
    // Sem token configurado, no-op silencioso (nao quebra o fluxo
    // do client). Util em dev sem .env preenchido.
    return { ok: false, reason: 'capi_not_configured' }
  }

  let body: CapiEventBody
  try {
    body = await readBody<CapiEventBody>(event)
  } catch {
    throw createError({ statusCode: 400, message: 'invalid_body' })
  }

  if (!body.event_name || !body.event_id) {
    throw createError({ statusCode: 400, message: 'event_name and event_id required' })
  }

  // Enriquecer com dados do request (nao confiar no client).
  // Vercel: o IP REAL do visitante chega em `x-vercel-forwarded-for`.
  // O `x-forwarded-for` tradicional pode trazer IP de proxy intermediario.
  // Cloudflare adiciona `cf-connecting-ip`. Tentamos na ordem de prioridade.
  const headers = getHeaders(event)
  const ip = (
    headers['x-vercel-forwarded-for']?.split(',')[0]?.trim()
    || headers['cf-connecting-ip']
    || headers['x-forwarded-for']?.split(',')[0]?.trim()
    || headers['x-real-ip']
    || headers['x-client-ip']
    || ''
  )
  const userAgent = headers['user-agent'] || ''

  const payload = {
    data: [
      {
        event_name: body.event_name,
        event_time: Math.floor(Date.now() / 1000),
        event_id: body.event_id,
        event_source_url: body.event_source_url,
        action_source: 'website',
        user_data: {
          client_ip_address: ip,
          client_user_agent: userAgent,
          ...(body.user_data || {}),
        },
        ...(body.custom_data ? { custom_data: body.custom_data } : {}),
      },
    ],
    ...(body.test_event_code ? { test_event_code: body.test_event_code } : {}),
  }

  const url = `https://graph.facebook.com/v22.0/${pixelId}/events?access_token=${accessToken}`

  try {
    const response = await $fetch<{
      events_received?: number
      messages?: string[]
      fbtrace_id?: string
      error?: { message: string; code: number }
    }>(url, {
      method: 'POST',
      body: payload,
    })

    if (response.error) {
      console.warn('[CAPI] Meta returned error:', response.error)
      return { ok: false, error: response.error.message }
    }

    return {
      ok: true,
      events_received: response.events_received,
      fbtrace_id: response.fbtrace_id,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown_error'
    console.warn('[CAPI] Request failed:', message)
    return { ok: false, error: message }
  }
})

/**
 * Leitura da agenda no servidor Nuxt. A conta mora em app/utils/agendaDividendos.ts
 * (testável sem Nitro). Aqui só entra o GET nos dois feeds da mesma base de
 * /dividendos/{TICKER}: /dividends/recent e /dividends/upcoming.
 */
import { spISODate } from '../../app/utils/format.ts'
import {
  fontesDaAgenda,
  httpDaAgenda,
  paginaDoMes,
  parseMesAgenda,
  statusDoMes,
  type FontesAgenda,
  type PaginaMes,
  type StatusMes,
} from '../../app/utils/agendaDividendos.ts'

function base(): string {
  return String(useRuntimeConfig().backendDirectBase || 'https://redentia-api.saraivada.com/api').replace(/\/+$/, '')
}

async function getJson(path: string): Promise<unknown> {
  return await $fetch(`${base()}${path}`, {
    timeout: 15_000,
    headers: { accept: 'application/json' },
  })
}

export function carregarFontesAgenda(hoje = spISODate()): Promise<FontesAgenda> {
  return fontesDaAgenda(getJson, hoje)
}

export async function responderMes(slug: string): Promise<{ status: StatusMes | 'invalido', pagina: PaginaMes | null }> {
  const alvo = parseMesAgenda(slug)
  if (!alvo) return { status: 'invalido', pagina: null }
  const fontes = await carregarFontesAgenda()
  const status = statusDoMes(alvo, fontes)
  if (status !== 'ok') return { status, pagina: null }
  return { status, pagina: paginaDoMes(fontes, alvo) }
}

export function statusHttpAgenda(status: StatusMes | 'invalido'): number {
  return httpDaAgenda(status)
}

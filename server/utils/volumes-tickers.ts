/**
 * Volume financeiro do pregão, ticker a ticker. A lista dos rankings não
 * traz volume. A leitura fica 15 min em cache: a página de FIIs não refaz
 * dezenas de pedidos a cada visita. O prazo da leva é curto de propósito.
 */
import { lerVolumeTicker, type VolumeLido } from '../../app/utils/rankingsRecorte'

const PRAZO_MS = 5_000
const PARALELO = 8

function base(): string {
  return String(useRuntimeConfig().backendDirectBase || 'https://redentia-api.saraivada.com/api').replace(/\/+$/, '')
}

async function lerLeva(tickers: string[]): Promise<Record<string, VolumeLido>> {
  const lista = [...new Set(tickers.map((t) => t.toUpperCase()).filter((t) => /^[A-Z][A-Z0-9]{3}11$/.test(t)))].slice(0, 100)
  const out: Record<string, VolumeLido> = {}
  if (!lista.length) return out
  const url = base()
  let cursor = 0
  const fim = Date.now() + PRAZO_MS
  async function um() {
    while (cursor < lista.length && Date.now() < fim) {
      const ticker = lista[cursor++]!
      try {
        const res = await $fetch<unknown>(`${url}/tickers/${ticker}`, {
          timeout: 4_000,
          headers: { accept: 'application/json', 'x-requested-with': 'XMLHttpRequest' },
        })
        const lido = lerVolumeTicker(res)
        if (lido?.priceDate) out[ticker] = lido
      } catch {
        // sem volume, a linha não entra no ranking
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(PARALELO, lista.length) }, () => um()))
  return out
}

const emCache = defineCachedFunction(lerLeva, {
  name: 'volumes-fiis',
  maxAge: 900,
  swr: true,
  getKey: (tickers: string[]) => [...tickers].sort().join(','),
})

export function volumesDeTickers(tickers: string[]): Promise<Record<string, VolumeLido>> {
  return emCache(tickers)
}

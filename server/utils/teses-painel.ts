/**
 * O painel das teses (/teses, 02/11/2026), montado e CACHEADO no Nitro. Ver
 * app/utils/tesesPainel.ts para o que cada parte é e de onde vem.
 *
 * Volume: por tese, duas chamadas (convicção e cesta) a cada hora; por papel,
 * uma cotação a cada 5 minutos, quatro de cada vez (sem rajada: ~40 papéis,
 * ~3 s com o cache frio, uma vez). O Ibovespa sai do cache da bolsa do dia, o
 * mesmo número da home. A página pede uma vez só (/api/teses-painel).
 * A chave do cache leva a base da API, como o bolsa-do-dia: dois servidores
 * locais apontando para APIs diferentes não se misturam.
 */
import { diaDaCesta, serieCompacta, type CotacaoDoPapel, type PainelDasTeses, type PainelTese } from '../../app/utils/tesesPainel'

function base(): string {
  return useRuntimeConfig().backendDirectBase || 'https://redentia-api.saraivada.com/api'
}
const chaveDaBase = () => base().replace(/[^a-z0-9]+/gi, '-')

async function pegar<T>(caminho: string): Promise<T | null> {
  const r: unknown = await $fetch(caminho, { baseURL: base(), headers: { Accept: 'application/json' }, timeout: 8_000 }).catch(() => null)
  return r != null && typeof r === 'object' ? (r as T) : null
}

interface ConviccaoApi { series?: { date: string; conviction: number }[] }
interface CestaApi { series?: number[]; deltaPct?: number | null; startLabel?: string | null }
interface PapelApi { ticker?: string; change_percent?: number | null; price_date?: string | null }

const trajetoriaDaTese = defineCachedFunction(
  async (slug: string): Promise<Pick<PainelTese, 'conviccao' | 'cesta'>> => {
    const s = encodeURIComponent(slug)
    const [c, d] = await Promise.all([
      pegar<{ data?: ConviccaoApi }>(`/theses/${s}/conviction-history`),
      pegar<{ data?: CestaApi }>(`/theses/${s}/performance`),
    ])
    const serie = Array.isArray(d?.data?.series) ? d!.data!.series!.filter((v) => Number.isFinite(v)) : []
    return {
      conviccao: serieCompacta(c?.data?.series),
      cesta: serie.length > 1 ? { serie, deltaPct: d!.data!.deltaPct ?? null, desde: d!.data!.startLabel ?? null } : null,
    }
  },
  {
    name: 'teses-painel-trajetoria',
    maxAge: 3600,
    swr: true,
    getKey: (slug: string) => `v1-${chaveDaBase()}-${slug}`,
    // as duas partes falharam (o backend dá 502 de vez em quando): não guarda
    validate: (e) => Boolean(e.value?.conviccao || e.value?.cesta),
  },
)

const cotacao = defineCachedFunction(
  async (ticker: string): Promise<CotacaoDoPapel | null> => {
    const r = await pegar<{ data?: PapelApi }>(`/tickers/${encodeURIComponent(ticker)}`)
    const d = r?.data
    if (!d) return null
    return { ticker, pct: typeof d.change_percent === 'number' ? d.change_percent : null, data: typeof d.price_date === 'string' ? d.price_date.slice(0, 10) : null }
  },
  { name: 'teses-painel-cotacao', maxAge: 300, swr: true, getKey: (t: string) => `v1-${chaveDaBase()}-${t}`, validate: (e) => e.value != null },
)

/** quatro de cada vez, na ordem */
async function emFila<T, R>(itens: T[], n: number, f: (x: T) => Promise<R>): Promise<R[]> {
  const saida: R[] = new Array(itens.length)
  let i = 0
  await Promise.all(Array.from({ length: Math.min(n, itens.length) }, async () => {
    while (i < itens.length) {
      const k = i++
      saida[k] = await f(itens[k]!)
    }
  }))
  return saida
}

export const fetchTesesPainel = defineCachedFunction(
  async (): Promise<PainelDasTeses> => {
    const [lista, bolsa] = await Promise.all([
      fetchThesesCached().catch(() => []),
      fetchBolsaDoDia().catch(() => null),
    ])
    const ibov = bolsa?.ibov ? { pct: bolsa.ibov.pct, data: bolsa.ibov.data } : null
    const papeis = [...new Set(lista.flatMap((t) => t.tickers ?? []))]
    const cotacoes: Record<string, CotacaoDoPapel | null> = {}
    const lidas = await emFila(papeis, 4, (t) => cotacao(t).catch(() => null))
    papeis.forEach((t, k) => { cotacoes[t] = lidas[k] ?? null })
    const trajetorias = await emFila(lista, 2, (t) => trajetoriaDaTese(t.id).catch(() => ({ conviccao: null, cesta: null })))
    const teses: Record<string, PainelTese> = {}
    lista.forEach((t, k) => {
      teses[t.id] = { ...trajetorias[k]!, dia: diaDaCesta(t.tickers ?? [], cotacoes, ibov?.data ?? null) }
    })
    return { ibov, teses }
  },
  {
    name: 'teses-painel',
    maxAge: 300,
    swr: true,
    getKey: () => `v1-${chaveDaBase()}`,
    validate: (e) => Object.keys((e.value as PainelDasTeses | undefined)?.teses ?? {}).length > 0,
  },
)

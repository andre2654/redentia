/**
 * O painel das teses (/teses, 02/11/2026), montado e CACHEADO no Nitro: a
 * convicção dia a dia de cada tese, que os cartões da grade desenham (ver
 * app/utils/tesesPainel.ts).
 *
 * Nunca segura o SSR: a página renderiza inteira com a lista de /theses, e o
 * navegador pede /api/teses-painel depois do mount. Volume: uma chamada por
 * tese a cada hora, três de cada vez, com timeout curto (4 s); a tese que
 * falhou vem sem desenho e não entra no cache (a próxima tenta de novo). A
 * chave leva a base da API, como o bolsa-do-dia: dois servidores locais
 * apontando para APIs diferentes não se misturam.
 */
import { serieCompacta, type PainelDasTeses, type PainelTese } from '../../app/utils/tesesPainel'

function base(): string {
  return useRuntimeConfig().backendDirectBase || 'https://redentia-api.saraivada.com/api'
}
const chaveDaBase = () => base().replace(/[^a-z0-9]+/gi, '-')

const conviccaoDaTese = defineCachedFunction(
  async (slug: string): Promise<PainelTese> => {
    const r: unknown = await $fetch(`/theses/${encodeURIComponent(slug)}/conviction-history`, {
      baseURL: base(), headers: { Accept: 'application/json' }, timeout: 4_000,
    }).catch(() => null)
    const serie = r != null && typeof r === 'object' ? (r as { data?: { series?: { date: string; conviction: number }[] } }).data?.series : null
    return { conviccao: serieCompacta(serie) }
  },
  {
    name: 'teses-painel-conviccao',
    maxAge: 3600,
    swr: true,
    getKey: (slug: string) => `v2-${chaveDaBase()}-${slug}`,
    // o backend dá 502 de vez em quando: sem série não guarda
    validate: (e) => Boolean(e.value?.conviccao),
  },
)

/** n de cada vez, na ordem */
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
    const lista = await fetchThesesCached().catch(() => [])
    const lidas = await emFila(lista, 3, (t) => conviccaoDaTese(t.id).catch(() => ({ conviccao: null })))
    const teses: Record<string, PainelTese> = {}
    lista.forEach((t, k) => { teses[t.id] = lidas[k]! })
    return { teses }
  },
  {
    name: 'teses-painel',
    maxAge: 300,
    swr: true,
    getKey: () => `v2-${chaveDaBase()}`,
    // só guarda com ao menos uma série: painel vazio não segura o cache 5 minutos
    validate: (e) => Object.values((e.value as PainelDasTeses | undefined)?.teses ?? {}).some((t) => t.conviccao),
  },
)

/**
 * As ações que flutuam em volta do hero da home (MercadoHeroAtivos, 23/10/2026):
 * seis nomes conhecidos com a variação do dia, CACHEADOS no Nitro.
 *
 * A fonte é /tickers/{t}, a mesma da página do ativo e da faixa "Mercado
 * agora". O change_pct do /market/today não serve: na janela pré-abertura ele
 * sai de um previous_close errado. São seis chamadas, uma de cada vez, no
 * máximo a cada 2 minutos (o Laravel ainda guarda cada uma por 5); a página
 * faz uma só (server/api/hero-ativos.get.ts), cacheada na borda. A ação que
 * falhou fica de fora: sem dado, sem plaquinha.
 */
import { symbolShape } from '../../app/utils/tickerClass'

export interface HeroAtivo {
  ticker: string
  pct: number
}

// a ordem é a das posições no hero: três à esquerda, três à direita.
// EMBJ3, não EMBR3: o código velho 301 para /asset/EMBJ3?de=EMBR3.
const TICKERS = ['PETR4', 'ITUB4', 'WEGE3', 'VALE3', 'BBAS3', 'EMBJ3'] as const

function backendBase(): string {
  return useRuntimeConfig().backendDirectBase || 'https://redentia-api.saraivada.com/api'
}

export const fetchHeroAtivosCached = defineCachedFunction(
  async (): Promise<HeroAtivo[]> => {
    const out: HeroAtivo[] = []
    for (const ticker of TICKERS) {
      const d = await $fetch<{ data?: { ticker?: string | null; change_percent?: number | null } }>(`/tickers/${ticker}`, {
        baseURL: backendBase(),
        headers: { Accept: 'application/json' },
        timeout: 6_000,
      }).then((r) => r?.data ?? null).catch(() => null)
      const pct = d?.change_percent
      // O link usa o código que o perfil devolve. Pedir um alias (EMBR3)
      // renderizava /asset/EMBR3, que 301 para a URL com ?de=.
      const canon = String(d?.ticker ?? ticker).trim().toUpperCase()
      if (typeof pct === 'number' && Number.isFinite(pct) && symbolShape(canon) !== 'invalid') {
        out.push({ ticker: canon, pct })
      }
    }
    return out
  },
  {
    name: 'hero-ativos',
    maxAge: 120,
    swr: true,
    getKey: () => 'v2',
    // lista vazia não entra no cache: a próxima visita tenta de novo
    validate: (entry) => Array.isArray(entry.value) && entry.value.length > 0,
  },
)

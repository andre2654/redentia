/**
 * GET /api/setor/{ptSlug}/pares?ticker=PETR4 — as maiores ações do setor, sem
 * a própria empresa, para o bloco "Outras empresas do setor" do /asset.
 *
 * Responde `{ data: [{ ticker, nome }] }`, já escolhido e com o nome limpo
 * (app/utils/paresDoSetor.ts e nomeB3.ts): no SSR o Nitro resolve a rota por
 * dentro, sem roundtrip; na navegação do cliente o browser baixa ~6 linhas, não
 * as 200 do setor.
 *
 * Falha nunca vira 500: devolve `{ data: [] }` e o bloco some. Setor fora do
 * registry (app/content/setores.ts) também.
 */
import { SETORES_BY_PT } from '../../../../app/content/setores'
import { INDEXABLE_ASSETS } from '../../../../app/content/seo/indexable-assets'
import { nomeDaEmpresa } from '../../../../app/utils/nomeB3'
import { paresDoSetor } from '../../../../app/utils/paresDoSetor'

const PREFERIDAS: ReadonlySet<string> = new Set(FEATURED_TICKERS)

export default defineEventHandler(async (event) => {
  const entry = SETORES_BY_PT[getRouterParam(event, 'slug') ?? '']
  const ticker = String(getQuery(event).ticker ?? '').toUpperCase()
  if (!entry || !/^[A-Z0-9]{4,6}$/.test(ticker)) return { data: [] }
  setHeader(event, 'cache-control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400')
  try {
    const linhas = await fetchSetorLinhasCached(entry.apiSlug)
    const pares = paresDoSetor(linhas, ticker, INDEXABLE_ASSETS, PREFERIDAS)
    return { data: pares.map((p) => ({ ticker: p.ticker, nome: nomeDaEmpresa(p.nome) })) }
  }
  catch {
    return { data: [] }
  }
})

/**
 * GET /api/setor/{ptSlug}/pares?ticker=PETR4 — as maiores ações do setor, sem
 * a própria empresa, para o bloco "Outras empresas do setor" do /asset.
 *
 * Responde `{ data: [{ ticker, nome }], media }`, já escolhido e com o nome limpo.
 * `media` é a variação média do pregão (aggregates.avg_change_percent) da
 * mesma lista, ou null.
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
    const lista = await fetchSetorLinhasCached(entry.apiSlug)
    const pares = paresDoSetor(lista.linhas, ticker, INDEXABLE_ASSETS, PREFERIDAS)
    const variacaoAtivo = lista.variacaoPorTicker[ticker]
    return {
      data: pares.map((p) => ({ ticker: p.ticker, nome: nomeDaEmpresa(p.nome) })),
      // Média e variação do próprio papel saem da MESMA resposta. DY/P/L
      // médios voltam null no backend, então não saem daqui.
      media: lista.variacaoMedia == null
        ? null
        : {
            variacao: lista.variacaoMedia,
            papeis: lista.papeis,
            variacaoAtivo: typeof variacaoAtivo === 'number' && Number.isFinite(variacaoAtivo) ? variacaoAtivo : null,
            data: lista.dataPorTicker[ticker] ?? null,
          },
    }
  }
  catch {
    return { data: [] }
  }
})

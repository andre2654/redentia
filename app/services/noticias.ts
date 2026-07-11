/**
 * Serviço do domínio notícias (PR3 /noticias) — fetchers tipados, finos.
 * SSR-first como o acao.ts: recebem `base` (server = Laravel direto via
 * runtimeConfig.backendDirectBase, sem loopback no próprio Nitro; client =
 * proxy same-origin /api/backend). O serviço NÃO engole erro — seed/degrade
 * é responsabilidade do useNoticias.
 */
import type { NewsApi, NewsTakeApi } from '~/types/market'

const json = { headers: { Accept: 'application/json' } }

/**
 * GET /research/news — news_takes com a leitura do Atlas (fonte primária).
 * Só aceita `limit` (SEM offset): "carregar mais" incrementa o limit e o
 * composable deduplica por id/título. Cap observado em prod 2026-07-11:
 * 60 itens (limit maior devolve os mesmos 60) — offset real = melhoria de
 * backend. Itens trazem imageUrl (verificado: 30/30 em prod) e tickers como
 * objetos {ticker,dir} com dir 'up'|'down'|'flat'.
 */
export function noticiasFetchResearchNews(base: string, limit: number) {
  return $fetch<{ data: NewsTakeApi[] }>(`${base}/research/news?limit=${limit}`, json)
}

/** GET /news/latest — fallback bruto (scraper): tem image_url e tickers
 *  string[], mas NÃO tem a leitura do Atlas (o card degrada escondendo). */
export function noticiasFetchLatestNews(base: string, limit: number) {
  return $fetch<{ data: NewsApi[] }>(`${base}/news/latest?limit=${limit}&with_tickers=1`, json)
}

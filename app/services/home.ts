/**
 * Serviço do domínio portfólio (nasceu na home logada do PR7; hoje é
 * consumido pelo useCarteira — página /carteira + resumo compacto da home).
 * Fetchers tipados, finos.
 * SSR-first como acao.ts/tese.ts: recebem `base` (server = URL direta do
 * Laravel via runtimeConfig.backendDirectBase; client = proxy same-origin
 * '/api/backend') e, nos endpoints auth:sanctum, o header Authorization
 * montado pelo composable (o token vive no cookie `nu:token`).
 * O serviço NÃO engole erro — a degradação POR SEÇÃO é do useCarteira.
 */
import type {
  EquityCurvePointApi,
  IncomeApi,
  MacroSnapshotApi,
  PortfolioPositionApi,
  PortfolioTodayApi,
} from '~/types/home'

type AuthHeaders = Record<string, string>

/** GET /portfolio — posições + DY/joins (fonte de verdade da conexão). */
export function homeFetchPortfolio(base: string, headers: AuthHeaders) {
  return $fetch<{ positions: PortfolioPositionApi[] }>(`${base}/portfolio`, { headers })
}

/** GET /portfolio/today — totais do dia + day_change por posição (cache 1h). */
export function homeFetchToday(base: string, headers: AuthHeaders) {
  return $fetch<PortfolioTodayApi>(`${base}/portfolio/today`, { headers })
}

/** GET /portfolio/equity-curve — curva mark-to-market diária real. */
export function homeFetchEquityCurve(base: string, headers: AuthHeaders) {
  return $fetch<{ data: EquityCurvePointApi[]; meta: { points: number } }>(`${base}/portfolio/equity-curve`, { headers })
}

/** GET /portfolio/income — proventos por mês (hero/renda passiva da carteira). */
export function homeFetchIncome(base: string, headers: AuthHeaders) {
  return $fetch<IncomeApi>(`${base}/portfolio/income`, { headers })
}

/** GET /macro/snapshot — CDI vigente (legenda do gráfico). */
export function homeFetchMacro(base: string) {
  return $fetch<MacroSnapshotApi>(`${base}/macro/snapshot`, { headers: { Accept: 'application/json' } })
}

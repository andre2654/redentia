/**
 * Contratos da assinatura única (31/10/2026) e da projeção de 5 anos da
 * carteira. Shapes do Backend (feat/plano-unico, contrato final de 31/10):
 *  - GET  /me/entitlements      → plano `redentia`, status e datas
 *  - POST /billing/checkout     → { checkout_url }; recusas: 409
 *                                 `assinatura_ativa`, 422 `plano_inativo` e
 *                                 `ciclo_indisponivel`. O teste de 3 dias é só
 *                                 da primeira assinatura.
 *  - POST /billing/portal       → { portal_url }
 *  - GET  /me/carteira/futuro   → leque do motor (série mensal)
 *
 * O gate do servidor (desligado por padrão) responde 402 `{ code:
 * 'assinatura_necessaria', feature, plan_slug }`: "não assina", nunca sessão
 * morta (ver utils/assinatura.ts).
 */

/** Status da linha `subscriptions` (Stripe). */
export type AssinaturaStatusApi =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid'
  | (string & {})

export interface EntitlementsApi {
  tenant?: { slug: string; billing_enabled: boolean }
  /** null = sem plano (sem acesso). `unlimited` = tenant sem cobrança. */
  plan: { slug: string; name: string } | null
  subscription: {
    status: AssinaturaStatusApi
    billing_cycle?: string | null
    trial_ends_at: string | null
    current_period_end: string | null
    /** cancelada no portal, vale até o fim do período (campo novo, opcional) */
    cancel_at_period_end?: boolean | null
  } | null
  has_active_subscription: boolean
  /** o teste de 3 dias ainda vale para esta pessoa (um por e-mail e por CPF; Backend, 01/11/2026) */
  trial_disponivel?: boolean
  /** a conta ainda não tem CPF: o checkout responde 422 cpf_necessario sem ele */
  precisa_cpf?: boolean
  /** sem e-mail real (cadastro só por celular ou "Ocultar meu e-mail" da Apple): 422 email_necessario (02/11/2026) */
  precisa_email?: boolean
  /** sem celular na conta: 422 celular_necessario (02/11/2026) */
  precisa_celular?: boolean
  can?: Record<string, boolean>
  limits?: Record<string, number>
}

export interface CheckoutApi { checkout_url: string }
/** O que vai no POST /billing/checkout além do plano: o CPF (obrigatório na 1ª vez) e o WhatsApp. */
export interface DadosDoTitular { cpf?: string; email?: string; celular?: string; whatsapp_opt_in?: boolean }
export interface PortalApi { portal_url: string }

/** Um ponto do leque, em reais de hoje. A série é MENSAL (mês 0 a 60). */
export interface FuturoPontoApi {
  /** mês desde hoje (0–60) */
  month?: number
  /** ano decimal (inteiro nos anos cheios) — o x do desenho */
  year: number
  p10: number
  p25: number
  p50: number
  p75: number
  p90: number
}

export interface FuturoDadosApi {
  horizon_years: number
  /** quantos caminhos o motor rodou (2.000) */
  paths: number
  engine_version: string
  as_of: string
  today_value: number
  end: { p10: number; p50: number; p90: number }
  series: FuturoPontoApi[]
  /** UM caminho real (o mais perto do meio), mês a mês; null = a linha do meio é o p50 */
  sample_paths: number[][] | null
  /** a parte da carteira que o motor simula; a série e os finais partem dela */
  covered_value: number | null
  unit?: string
  step?: 'monthly' | string
  aggregated?: boolean
  /** fora da simulação: cripto, fundo sem registro/COE, renda fixa sem indexador ou taxa */
  excluded: { ticker: string; reason: string }[]
  disclaimer: string
}

/**
 * GET /me/carteira/futuro. Vazios: `{ data: null, reason: 'sem_posicoes' }` e
 * `{ data: null, reason: 'sem_posicoes_simulaveis', excluded: [...] }`.
 * Erros: 422 `invalid_portfolio`, 503 `engine_unavailable`.
 */
export interface FuturoApi {
  data: FuturoDadosApi | null
  reason?: 'sem_posicoes' | 'sem_posicoes_simulaveis' | (string & {})
  excluded?: { ticker: string; reason: string }[]
}

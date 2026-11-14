/**
 * Serviço da assinatura única (31/10/2026) e da projeção de 5 anos da
 * carteira — fetchers finos, um por endpoint. Recebem `base` (SSR: URL direta
 * do Laravel; client: '/api/backend') e o header Authorization montado por
 * quem chama. O serviço NÃO engole erro: quem decide a tela é o useAssinatura
 * (402/403 assinatura_necessaria → paywall; 401 → sessão morta).
 */
import type { CheckoutApi, EntitlementsApi, FuturoApi, PortalApi, DadosDoTitular } from '~/types/assinatura'
import { CORPO_CHECKOUT } from '~/utils/assinatura'

type AuthHeaders = Record<string, string>

/** GET /me/entitlements — plano, status da assinatura e datas (auth). */
export function assinaturaFetchEntitlements(base: string, headers: AuthHeaders) {
  return $fetch<EntitlementsApi>(`${base}/me/entitlements`, { headers })
}

/** POST /billing/checkout — sessão do Checkout da Stripe com o teste de 3 dias. */
export function assinaturaPostCheckout(base: string, headers: AuthHeaders, dados?: DadosDoTitular) {
  return $fetch<CheckoutApi>(`${base}/billing/checkout`, { method: 'POST', headers, body: { ...CORPO_CHECKOUT, ...(dados ?? {}) } })
}

/** POST /billing/portal — portal da Stripe (cartão, faturas, cancelamento). */
export function assinaturaPostPortal(base: string, headers: AuthHeaders) {
  return $fetch<PortalApi>(`${base}/billing/portal`, { method: 'POST', headers })
}

/** GET /me/carteira/futuro — o leque de 2.000 caminhos em 5 anos (auth, pago). */
export function carteiraFetchFuturo(base: string, headers: AuthHeaders) {
  return $fetch<FuturoApi>(`${base}/me/carteira/futuro`, { headers })
}

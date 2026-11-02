import { cabecalhosAtribuicaoDaSessao, caminhoCriaConta } from '../utils/atribuicao.ts'

/**
 * Cliente API central (padrão herdado do Atlas):
 *  - publicFetch: endpoints públicos do Laravel via proxy same-origin /api/backend
 *  - authFetch:   + Bearer sanctum; 401/403 limpa a sessão e manda pro /login
 *                 preservando o destino (?redirect=). Em páginas PÚBLICAS que
 *                 só enriquecem a UI quando há sessão (ex.: favoritos no
 *                 /teses), passe { redirectOnAuthError: false } — token
 *                 expirado então só limpa a sessão, sem expulsar o visitante.
 * Tudo same-origin → CORS não existe. SSR usa o proxy do Nitro igualmente.
 *
 * Pedido que cria conta (verify do PIN, Google, cadastro por senha) leva
 * `X-Redentia-Attribution` quando a sessão guardou origem. O backend pode
 * ignorar o header. Quem chama também pode passar o mesmo header: o valor
 * é o da sessão, e o do caller vence se for outro.
 */
export function useApi() {
  const { token, clearSession } = useAuthState()
  const route = useRoute()

  const base = '/api/backend'

  function publicFetch<T>(path: string, opts: Parameters<typeof $fetch>[1] = {}) {
    return $fetch<T>(`${base}${path}`, {
      ...opts,
      headers: {
        Accept: 'application/json',
        ...(caminhoCriaConta(path) ? cabecalhosAtribuicaoDaSessao() : {}),
        ...(opts.headers ?? {}),
      },
    })
  }

  function authFetch<T>(
    path: string,
    opts: Parameters<typeof $fetch>[1] = {},
    { redirectOnAuthError = true }: { redirectOnAuthError?: boolean } = {},
  ) {
    return $fetch<T>(`${base}${path}`, {
      ...opts,
      headers: {
        Accept: 'application/json',
        ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
        ...(opts.headers ?? {}),
      },
      onResponseError({ response }) {
        if (response.status === 401 || response.status === 403) {
          clearSession()
          if (redirectOnAuthError) {
            navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
          }
        }
      },
    })
  }

  return { publicFetch, authFetch }
}

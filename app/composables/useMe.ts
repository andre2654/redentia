import type { MeResponse } from '~/types/auth'

/**
 * /auth/me compartilhado entre as seções de /conta (perfil, segurança, ...).
 * useAsyncData com chave FIXA dedupa: uma requisição por navegação, todas as
 * seções leem o mesmo estado e um refresh() atualiza todo mundo. Bearer + 401
 * → limpa sessão e manda pro /login (padrão do authFetch).
 */
export function useMe() {
  const { authFetch } = useApi()
  return useAsyncData<MeResponse>('conta:me', () => authFetch<MeResponse>('/auth/me'))
}

/**
 * /auth/me CLIENT-ONLY e silencioso, com UMA requisição por token por carga
 * de página. Quem só precisa de campos estáveis do usuário fora da /conta
 * (created_at e e-mail pro gancho do "Seguir", nome pro plugin auth-user)
 * divide a mesma promessa em vez de disparar um GET cada.
 *
 * A promessa vive no módulo e SÓ é criada no client (no servidor o módulo é
 * compartilhado entre requests: guardar sessão ali vazaria usuário). A chave
 * é o token: login/logout trocam o token e a próxima chamada busca de novo.
 * Nunca rejeita: token morto ou rede fora → null (o interceptor do authFetch
 * já limpa a sessão no 401/403, sem expulsar ninguém pro /login).
 */
let meShared: { token: string; promise: Promise<MeResponse | null> } | null = null

export function useMeCliente() {
  const { token } = useAuthState()
  const { authFetch } = useApi()

  function load(): Promise<MeResponse | null> {
    const tk = token.value
    if (import.meta.server || !tk) return Promise.resolve(null)
    if (meShared?.token === tk) return meShared.promise
    const promise = authFetch<MeResponse>('/auth/me', {}, { redirectOnAuthError: false }).catch(() => null)
    meShared = { token: tk, promise }
    return promise
  }

  return { load }
}

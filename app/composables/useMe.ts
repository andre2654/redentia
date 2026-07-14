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

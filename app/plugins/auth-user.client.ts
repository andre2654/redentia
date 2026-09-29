/**
 * Hidrata o nome do usuário pra sessões que logaram ANTES do cookie `nu:name`
 * existir (o token persiste 30 dias; o `user` completo morre no reload).
 * Client-only, 1 fetch silencioso: token sem nome → GET /auth/me. Token morto
 * limpa a sessão em silêncio (redirectOnAuthError: false — a home é pública,
 * ninguém é expulso pro /login por causa de uma saudação).
 */
import type { MeResponse } from '~/types/auth'

export default defineNuxtPlugin(() => {
  const { token, displayName, user, setSession } = useAuthState()
  if (!token.value || displayName.value) return

  // Mesma promessa do gancho do "Seguir" (useMeCliente): 1 GET /auth/me por
  // carga de página, não um por consumidor. Token morto → null (o interceptor
  // já limpou a sessão).
  void useMeCliente().load().then((me: MeResponse | null) => {
    const u = me?.user
    if (!u || !token.value) return
    if (u.name) setSession(token.value, { id: u.id, name: u.name, email: u.email ?? undefined })
    else user.value = { id: u.id, name: u.name ?? '', email: u.email ?? undefined }
  })
})

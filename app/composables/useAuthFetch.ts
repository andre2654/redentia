type CustomResponse<T> = T extends T ? { data: T } : never

export const useCustomFetch = () => {
  const store = useAuthStore()
  const router = useRouter()
  const route = useRoute()

  const authFetch = async <T>(
    url: string,
    options: any = {}
  ): Promise<CustomResponse<T>> => {
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${store.token}`,
      Accept: 'application/json',
    }

    // Detecta se a chamada e o /logout — nesse caso, o 401/403 e ESPERADO
    // (estamos terminando a sessao de proposito), entao o handler global
    // de "credenciais expiraram" nao deve disparar. Sem essa guarda, deslogar
    // no admin causava: 401 → toast + router.push('/') + layout dispara
    // outro router.push('/admin/auth/login') em paralelo, gerando loop
    // de navegacao client-side.
    const isLogoutCall = typeof url === 'string' && /\/auth\/logout(\?|$)/.test(url)

    const response = await $fetch<CustomResponse<T>>(url, {
      ...options,
      headers,
      onResponse({ request: _request, response, options: _options }) {
        if (isLogoutCall) return
        if (response.status === 401 || response.status === 403) {
          showErrorNotification('Falha', 'Suas credenciais expiraram')
          store.clearAuthData()
          // Redirect admin-aware: dentro do subdomain/path admin, o destino
          // certo e /admin/auth/login (a /  e a homepage publica e disparava
          // outro middleware que voltava pro admin, fechando loop).
          const onAdmin = route.path.startsWith('/admin')
          router.push(onAdmin ? '/admin/auth/login' : '/')
        }
      },
    })

    return response
  }

  return {
    authFetch,
  }
}

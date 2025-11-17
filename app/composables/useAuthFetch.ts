type CustomResponse<T> = T extends T ? { data: T } : never

export const useCustomFetch = () => {
  const store = useAuthStore()
  const router = useRouter()

  const authFetch = async <T>(
    url: string,
    options: any = {}
  ): Promise<CustomResponse<T>> => {
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${store.token}`,
    }

    const response = await $fetch<CustomResponse<T>>(url, {
      ...options,
      headers,
      onResponse({ request, response, options }) {
        if (response.status === 401 || response.status === 403) {
          showErrorNotification('Falha', 'Suas credenciais expiraram')
          store.clearAuthData()
          router.push('/')
        }
      },
    })

    return response
  }

  return {
    authFetch,
  }
}

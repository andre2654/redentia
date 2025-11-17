export interface RegisterPayload {
  name: string
  login: string
  email: string
  celular: string
  password: string
  password_confirmation: string
}

export interface LoginPayload {
  login: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export interface AuthResponse {
  token: string
  user?: {
    id: string | number
    name: string
    email: string
    login?: string
    celular?: string
  }
}

export const useAuthService = () => {
  const { authFetch } = useCustomFetch()
  const baseURL = 'https://redentia-api.saraivada.com/api/auth'

  async function register(body: RegisterPayload): Promise<AuthResponse> {
    const resp = await $fetch<AuthResponse>(`${baseURL}/register`, {
      method: 'POST',
      credentials: 'include',
      body,
    })
    return resp
  }

  async function login(body: LoginPayload): Promise<LoginResponse> {
    const resp = await $fetch<LoginResponse>(`${baseURL}/login`, {
      method: 'POST',
      credentials: 'include',
      body,
    })
    return resp
  }

  async function me() {
    const resp = await authFetch(`${baseURL}/me`, {
      method: 'GET',
    })
    return resp
  }

  async function logout() {
    const resp = await authFetch(`${baseURL}/logout`, {
      method: 'POST',
    })
    return resp
  }

  return { register, login, me, logout }
}

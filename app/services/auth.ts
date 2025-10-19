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
    const baseURL = 'https://redentia-api.saraivada.com/api/auth'


    async function getCSRFToken() {
        const resp = await fetch(`https://redentia-api.saraivada.com/sanctum/csrf-cookie`, {
            method: 'GET',
            credentials: 'include',
        })
        return resp
    }

    async function register(body: RegisterPayload): Promise<AuthResponse> {
        const resp = await $fetch<AuthResponse>(`${baseURL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            credentials: 'include',
            body,
        })
        return resp
    }

    async function login(body: LoginPayload): Promise<AuthResponse> {
        const resp = await $fetch<AuthResponse>(`${baseURL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            credentials: 'include',
            body,
        })
        return resp
    }

    async function me(token: string) {
        const resp = await $fetch(`${baseURL}/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })
        return resp
    }

    async function logout(token: string) {
        const resp = await $fetch(`${baseURL}/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })
        return resp
    }

    return { getCSRFToken, register, login, me, logout }
}
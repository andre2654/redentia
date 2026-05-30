import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { createPinia, defineStore, setActivePinia } from 'pinia'

// Service methods the store calls via the auto-imported useAuthService().
const meFn = vi.fn()
const logoutFn = vi.fn()

let useAuthStore: typeof import('../../app/stores/auth').useAuthStore

beforeAll(async () => {
  vi.stubGlobal('defineStore', defineStore)
  vi.stubGlobal('useCookie', vi.fn(() => ref<unknown>(null)))
  vi.stubGlobal('persistedState', { cookiesWithOptions: () => 'cookie', localStorage: 'l', sessionStorage: 's' })
  vi.stubGlobal('useAuthService', vi.fn(() => ({ me: meFn, logout: logoutFn })))
  ;({ useAuthStore } = await import('../../app/stores/auth'))
})

afterAll(() => vi.unstubAllGlobals())
beforeEach(() => {
  setActivePinia(createPinia())
  meFn.mockReset()
  logoutFn.mockReset()
})

describe('useAuthStore', () => {
  it('starts unauthenticated with no profile/token', () => {
    const s = useAuthStore()
    expect(s.me).toBeNull()
    expect(s.token).toBeNull()
    expect(s.isAuthenticated).toBe(false)
  })

  it('setMeFromUser maps an API user to a profile and ignores users without a name', () => {
    const s = useAuthStore()
    s.setMeFromUser({ id: 7, name: 'Ana', email: 'a@x.com', role: 'advisor', celular: '11999' })
    expect(s.me).toMatchObject({ id: '7', name: 'Ana', email: 'a@x.com', role: 'advisor', celular: '11999', is_super_admin: false })

    s.setMeFromUser({ email: 'no-name@x.com' }) // no name → ignored
    expect(s.me?.name).toBe('Ana')
    s.setMeFromUser(null)
    expect(s.me?.name).toBe('Ana')
  })

  it('addToken sets the token and flips isAuthenticated', () => {
    const s = useAuthStore()
    s.addToken('tok123')
    expect(s.token).toBe('tok123')
    expect(s.isAuthenticated).toBe(true)
  })

  it('clearAuthData wipes profile + token', () => {
    const s = useAuthStore()
    s.setMeFromUser({ id: 1, name: 'X' })
    s.addToken('t')
    s.clearAuthData()
    expect(s.me).toBeNull()
    expect(s.token).toBeNull()
    expect(s.isAuthenticated).toBe(false)
  })

  it('fetchProfile hydrates me + token from the auth service payload', async () => {
    const s = useAuthStore()
    meFn.mockResolvedValue({ user: { id: 9, name: 'Bob', email: 'b@x.com' }, token: 'srvtok' })
    const result = await s.fetchProfile()
    expect(s.me).toMatchObject({ id: '9', name: 'Bob' })
    expect(s.token).toBe('srvtok')
    expect(result?.name).toBe('Bob')
  })

  it('logout calls the service then clears auth data', async () => {
    const s = useAuthStore()
    logoutFn.mockResolvedValue(undefined)
    s.addToken('t')
    s.setMeFromUser({ id: 1, name: 'X' })
    await s.logout()
    expect(logoutFn).toHaveBeenCalledTimes(1)
    expect(s.me).toBeNull()
    expect(s.token).toBeNull()
  })
})

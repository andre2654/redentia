import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, defineStore, setActivePinia } from 'pinia'

// The store's `persist` option references the auto-imported `persistedState`
// helper at module-eval time; stub it (and defineStore) before importing.
// Plain pinia ignores the persist config, so behavior is unaffected.
let useInterfaceStore: typeof import('../../app/stores/interface').useInterfaceStore

beforeAll(async () => {
  vi.stubGlobal('defineStore', defineStore)
  vi.stubGlobal('persistedState', { localStorage: 'localStorage', sessionStorage: 'sessionStorage' })
  ;({ useInterfaceStore } = await import('../../app/stores/interface'))
})

afterAll(() => vi.unstubAllGlobals())
beforeEach(() => setActivePinia(createPinia()))

describe('useInterfaceStore', () => {
  it('defaults to revealAmount=true and hideInstallBanner=false', () => {
    const s = useInterfaceStore()
    expect(s.revealAmount).toBe(true)
    expect(s.hideInstallBanner).toBe(false)
  })

  it('toggleRevealAmount flips the privacy flag', () => {
    const s = useInterfaceStore()
    s.toggleRevealAmount()
    expect(s.revealAmount).toBe(false)
    s.toggleRevealAmount()
    expect(s.revealAmount).toBe(true)
  })

  it('closeInstallBanner sets the banner flag to true', () => {
    const s = useInterfaceStore()
    s.closeInstallBanner()
    expect(s.hideInstallBanner).toBe(true)
  })
})

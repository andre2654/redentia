import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, ref } from 'vue'
import { createPinia, defineStore, setActivePinia } from 'pinia'

const authStub = vi.fn()
const fetchFn = vi.fn()

let useWalletStore: typeof import('../../app/stores/wallet').useWalletStore

beforeAll(async () => {
  vi.stubGlobal('defineStore', defineStore)
  vi.stubGlobal('ref', ref)
  vi.stubGlobal('computed', computed)
  vi.stubGlobal('useAuthStore', authStub)
  vi.stubGlobal('useRuntimeConfig', vi.fn(() => ({ public: { apiBaseUrl: 'http://api' } })))
  vi.stubGlobal('$fetch', fetchFn)
  ;({ useWalletStore } = await import('../../app/stores/wallet'))
})

afterAll(() => vi.unstubAllGlobals())
beforeEach(() => {
  setActivePinia(createPinia())
  authStub.mockReset()
  fetchFn.mockReset()
})

describe('useWalletStore', () => {
  it('starts empty (no holdings, zero equity, not flagged empty until loaded)', () => {
    authStub.mockReturnValue({ token: null })
    const w = useWalletStore()
    expect(w.holdings).toEqual([])
    expect(w.totalEquity).toBe(0)
    expect(w.hasPositions).toBe(false)
    expect(w.allocationByClass).toEqual([])
    expect(w.lastUpdatedAt).toBeNull()
    expect(w.isEmpty).toBe(false) // not loaded yet
  })

  it('refresh() is a silent no-op without an auth token', async () => {
    authStub.mockReturnValue({ token: null })
    const w = useWalletStore()
    await w.refresh()
    expect(fetchFn).not.toHaveBeenCalled()
    expect(w.lastUpdatedAt).toBeNull()
    expect(w.isEmpty).toBe(false)
  })

  it('refresh() maps positions→holdings, totals, allocation, history + dividends; reset() clears', async () => {
    authStub.mockReturnValue({ token: 'tok' })
    fetchFn.mockImplementation((url: string) => {
      if (url.includes('/portfolio/today')) {
        return Promise.resolve({
          totals: { value_now: 1000, day_change_amount: 12, day_change_pct: 1.2 },
          positions: [
            { ticker: 'PETR4', name: 'Petrobras', asset_class: 'STOCK', quantity: 10, average_price: 30, price_now: 40, value_now: 400, pnl_amount: 100, pnl_pct: 33.33, day_change_amount: 5, day_change_pct: 1, factor_tags: [{ factor: 'petroleo_exposto' }] },
            { ticker: 'HGLG11', name: 'CSHG Log', asset_class: 'REIT', quantity: 6, average_price: 100, price_now: 100, value_now: 600, day_change_amount: 7 },
          ],
          dividends_today: { total: 2.5, items: [{ ticker: 'HGLG11', amount: 2.5 }] },
        })
      }
      if (url.includes('/portfolio/history')) {
        return Promise.resolve({ '7d': { amount: 50, pct: 5, sparkline: [1, 2, 3] }, '30d': { amount: 120, pct: 12, sparkline: [4, 5, 6] } })
      }
      return Promise.resolve(null)
    })

    const w = useWalletStore()
    await w.refresh()

    expect(w.hasPositions).toBe(true)
    expect(w.holdings).toHaveLength(2)
    expect(w.totalEquity).toBe(1000)
    expect(w.dayChangeAmount).toBe(12)

    const petr = w.holdings.find((h) => h.ticker === 'PETR4')!
    expect(petr).toMatchObject({ name: 'Petrobras', assetClass: 'STOCK', qty: 10, currentPrice: 40, value: 400, pnl: 100, dayChange: 5, factorTags: ['petroleo_exposto'] })
    expect(petr.weight).toBeCloseTo(40, 5) // 400 / 1000 * 100

    // allocationByClass sorted by value desc
    expect(w.allocationByClass).toEqual([
      { label: 'REIT', value: 600, pct: 60 },
      { label: 'STOCK', value: 400, pct: 40 },
    ])
    expect(w.topHoldings.map((h) => h.ticker)).toEqual(['HGLG11', 'PETR4'])
    expect(w.totalDelta).toBe(12) // 5 + 7

    // history buckets + sparklines
    expect(w.weekChangeAmount).toBe(50)
    expect(w.monthChangePct).toBe(12)
    expect(w.equityCurve7d).toEqual([1, 2, 3])

    // dividends_today → recentActivity
    expect(w.recentActivity).toHaveLength(1)
    expect(w.recentActivity[0]).toMatchObject({ kind: 'dividend', ticker: 'HGLG11', amount: 2.5 })
    expect(w.lastUpdatedAt).not.toBeNull()
    expect(w.isEmpty).toBe(false)

    w.reset()
    expect(w.holdings).toEqual([])
    expect(w.totalEquity).toBe(0)
    expect(w.lastUpdatedAt).toBeNull()
  })

  it('refresh() with no positions flags the wallet as empty', async () => {
    authStub.mockReturnValue({ token: 'tok' })
    fetchFn.mockImplementation((url: string) => {
      if (url.includes('/portfolio/today')) return Promise.resolve({ totals: { value_now: 0 }, positions: [] })
      return Promise.resolve({})
    })

    const w = useWalletStore()
    await w.refresh()
    expect(w.holdings).toEqual([])
    expect(w.totalEquity).toBe(0)
    expect(w.lastUpdatedAt).not.toBeNull()
    expect(w.isEmpty).toBe(true) // loaded + no holdings
    expect(w.hasPositions).toBe(false)
  })
})

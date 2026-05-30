import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, ref } from 'vue'
import { createPinia, defineStore, setActivePinia } from 'pinia'

const fetchFn = vi.fn()

let useMarketStore: typeof import('../../app/stores/market').useMarketStore

beforeAll(async () => {
  vi.stubGlobal('defineStore', defineStore)
  vi.stubGlobal('ref', ref)
  vi.stubGlobal('computed', computed)
  vi.stubGlobal('useRuntimeConfig', vi.fn(() => ({ public: { apiBaseUrl: 'http://api' } })))
  vi.stubGlobal('$fetch', fetchFn)
  ;({ useMarketStore } = await import('../../app/stores/market'))
})

afterAll(() => vi.unstubAllGlobals())
beforeEach(() => {
  setActivePinia(createPinia())
  fetchFn.mockReset()
})

describe('useMarketStore', () => {
  it('starts empty (no indices, not loaded, market not flagged closed)', () => {
    const m = useMarketStore()
    expect(m.ibov).toBeNull()
    expect(m.topGainers).toEqual([])
    expect(m.isLoaded).toBe(false)
    expect(m.allIndices).toEqual([])
    expect(m.isMarketClosedToday).toBe(false)
  })

  it('refresh() populates indices/movers/series, then reset() clears them', async () => {
    const m = useMarketStore()
    fetchFn.mockImplementation((url: string) => {
      if (url.includes('/market/snapshot')) {
        return Promise.resolve({
          indices_br: {
            IBOV: { value: 130000, change_pct: 1.2, as_of_date: '2020-01-02' },
            IFIX: { value: 3200, change_pct: -0.3 },
          },
          macro: { usd_brl: { value: 5.1, delta_pct: 0.5 } },
          global: { brent: { value: 80, change_pct: 2 }, sp500: { value: 5000, change_pct: 0.8 } },
          top_gainers: Array.from({ length: 7 }, (_, i) => ({ ticker: `G${i}`, name: `g${i}`, pct: i })),
          top_losers: [{ ticker: 'L1', pct: -3 }],
        })
      }
      if (url.includes('/indices/ibov/prices')) {
        return Promise.resolve({ data: [{ market_price: 130000, price_at: '2020-01-02' }, { price: 129000, date: '2020-01-01' }] })
      }
      return Promise.resolve(null)
    })

    await m.refresh()
    expect(m.ibov).toMatchObject({ key: 'ibov', label: 'Ibovespa', value: 130000, changePct: 1.2 })
    expect(m.ifix?.value).toBe(3200)
    expect(m.dolar).toMatchObject({ value: 5.1, changePct: 0.5 })
    expect(m.brent?.value).toBe(80)
    expect(m.sp500?.value).toBe(5000)
    expect(m.topGainers).toHaveLength(5) // capped at 5
    expect(m.topGainers[0]).toEqual({ ticker: 'G0', name: 'g0', pct: 0 })
    expect(m.topLosers).toEqual([{ ticker: 'L1', name: null, pct: -3 }])
    expect(m.ibovSeries).toEqual([
      { price: 130000, date: '2020-01-02' },
      { price: 129000, date: '2020-01-01' },
    ])
    expect(m.isLoaded).toBe(true)
    expect(m.allIndices).toHaveLength(5)
    expect(m.isMarketClosedToday).toBe(true) // as_of_date 2020-01-02 ≠ today

    m.reset()
    expect(m.ibov).toBeNull()
    expect(m.topGainers).toEqual([])
    expect(m.isLoaded).toBe(false)
  })

  it('degrades gracefully when the fetches reject (settled, not thrown)', async () => {
    const m = useMarketStore()
    fetchFn.mockRejectedValue(new Error('upstream down'))
    await m.refresh()
    expect(m.ibov).toBeNull()
    expect(m.topGainers).toEqual([])
    expect(m.isLoaded).toBe(true) // lastUpdatedAt still set — allSettled never throws
    expect(m.error).toBeNull()
  })
})

import { describe, expect, it } from 'vitest'
import { formatMarketData } from '../../server/utils/formatter'

describe('formatMarketData', () => {
  it('price: picks price/change fields and formats to 2 decimals', () => {
    const r = formatMarketData('price', { market_price: 38.5, change_percent: 1.2345, updated_at: '2026-05-15' })
    expect(r).toEqual({ price: '38.50', change: '1.23', lastUpdate: '2026-05-15' })
  })

  it('price: unwraps a { data } envelope and falls back across field names', () => {
    const r = formatMarketData('price', { data: { close: 10, change: -2 } }) as { price: string; change: string }
    expect(r.price).toBe('10.00')
    expect(r.change).toBe('-2.00')
  })

  it('chart: maps points to {x,y}, drops invalid, keeps the last 90', () => {
    const points = Array.from({ length: 100 }, (_, i) => ({ date: `d${i}`, close: i }))
    const r = formatMarketData('chart', points) as Array<{ x: string; y: number }>
    expect(r).toHaveLength(90)
    expect(r[0]).toEqual({ x: 'd10', y: 10 }) // last 90 of 0..99
    expect(r[89]).toEqual({ x: 'd99', y: 99 })
  })

  it('chart: filters out points missing an x', () => {
    const r = formatMarketData('chart', [{ date: 'a', close: 1 }, { close: 2 }]) as Array<{ x: string; y: number }>
    expect(r).toEqual([{ x: 'a', y: 1 }])
  })

  it('dividends: maps date/dividend across field aliases', () => {
    const r = formatMarketData('dividends', [{ payment_date: '2026-01-01', value: 0.5 }]) as Array<{ date: string; dividend: number }>
    expect(r).toEqual([{ date: '2026-01-01', dividend: 0.5 }])
  })

  it('analysis: formats pe/dy and abbreviates market cap with a B suffix', () => {
    const r = formatMarketData('analysis', { pl: 12.345, dy: 6.7, sector: 'Energia', market_cap: 2_500_000_000 })
    expect(r).toMatchObject({ pe: '12.35', dy: '6.70', sector: 'Energia', marketCap: '2.5B' })
  })

  it('returns null when there is no data', () => {
    expect(formatMarketData('price', null)).toBeNull()
  })

  it('returns the raw (unwrapped) data for an unknown type', () => {
    expect(formatMarketData('mystery', { foo: 1 })).toEqual({ foo: 1 })
  })
})

import { describe, expect, it } from 'vitest'
import { calculateCompoundInterest } from '../../server/utils/calculators'

describe('calculateCompoundInterest', () => {
  it('with no interest, just accumulates initial + monthly contributions', () => {
    const r = calculateCompoundInterest(1000, 100, 0, 1, 'years', 'year')
    expect(r.periodMonths).toBe(12)
    expect(r.totalInvested).toBe(2200) // 1000 + 12 * 100
    expect(r.finalValue).toBeCloseTo(2200, 6)
    expect(r.totalInterest).toBeCloseTo(0, 6)
    expect(r.chartData).toHaveLength(13) // start point + 12 months (no sampling under 50)
    expect(r.chartData[0]!.value).toBe(1000)
    expect(r.chartData.at(-1)!.value).toBeCloseTo(2200, 6)
  })

  it('applies a monthly interest rate directly each month', () => {
    const r = calculateCompoundInterest(1000, 0, 1, 12, 'months', 'month')
    expect(r.periodMonths).toBe(12)
    expect(r.totalInvested).toBe(1000)
    expect(r.finalValue).toBeCloseTo(1126.825, 2) // 1000 * 1.01^12
    expect(r.totalInterest).toBeCloseTo(126.825, 2)
  })

  it('converts an annual rate to a monthly equivalent that compounds back to the nominal annual', () => {
    const r = calculateCompoundInterest(1000, 0, 12, 1, 'years', 'year')
    expect(r.finalValue).toBeCloseTo(1120, 4) // 12% annual on 1000 over 12 months
    expect(r.totalInterest).toBeCloseTo(120, 4)
    expect(r.totalInvested).toBe(1000)
  })
})

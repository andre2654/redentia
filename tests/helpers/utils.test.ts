import { describe, expect, it, vi } from 'vitest'
import {
  formatCurrency,
  formatDate,
  generateChartConfig,
  generateMockChartData,
  installPWA,
  isPWAInstalled,
} from '../../app/helpers/utils'

const nb = (s: string) => s.replace(/\s/g, ' ')

describe('isPWAInstalled', () => {
  it('reflects the pwa.isPWAInstalled flag and is falsy without a pwa', () => {
    expect(isPWAInstalled({ isPWAInstalled: true })).toBe(true)
    expect(isPWAInstalled({ isPWAInstalled: false })).toBe(false)
    expect(isPWAInstalled(null)).toBeFalsy()
  })
})

describe('installPWA', () => {
  it('installs and hides the banner only when not already installed', () => {
    const install = vi.fn()
    const hide = vi.fn()
    installPWA({ isPWAInstalled: false, install }, hide)
    expect(install).toHaveBeenCalledTimes(1)
    expect(hide).toHaveBeenCalledTimes(1)
  })

  it('does nothing when already installed or the pwa is missing', () => {
    const install = vi.fn()
    installPWA({ isPWAInstalled: true, install })
    expect(install).not.toHaveBeenCalled()
    expect(() => installPWA(null)).not.toThrow()
  })
})

describe('formatDate / formatCurrency', () => {
  it('formats a Date as pt-BR dd/mm/yyyy', () => {
    // local-component Date avoids any timezone shift across host/CI
    expect(formatDate(new Date(2026, 4, 15))).toBe('15/05/2026')
  })

  it('formats a number as pt-BR BRL currency', () => {
    expect(nb(formatCurrency(1234.56))).toBe('R$ 1.234,56')
  })
})

describe('generateMockChartData', () => {
  it('returns one point per day for each fixed range, clamped to >= 1', () => {
    expect(generateMockChartData('month')).toHaveLength(30)
    expect(generateMockChartData('3months')).toHaveLength(90)
    expect(generateMockChartData('6months')).toHaveLength(180)
    expect(generateMockChartData('year')).toHaveLength(365)

    for (const p of generateMockChartData('month', 1000)) {
      expect(p.value).toBeGreaterThanOrEqual(1)
      expect(typeof p.date).toBe('string')
      expect(typeof p.timestamp).toBe('number')
    }
  })
})

describe('generateChartConfig', () => {
  it('builds a single-series config with data, one color, and a legend entry', () => {
    const cfg = generateChartConfig({ timeRange: 'month', label: 'IBOV' })
    expect(cfg.data).toHaveLength(30)
    expect(cfg.colors).toHaveLength(1)
    expect(cfg.legend[0]!.label).toBe('IBOV')
    expect(cfg.legend[0]!.value).toMatch(/^R\$/)
  })
})

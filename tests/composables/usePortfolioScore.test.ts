import { describe, expect, it } from 'vitest'
import {
  DEMO_PORTFOLIO,
  SUGGESTED_TICKERS,
  analyzePortfolio,
  inferUnknownTicker,
  resolveTicker,
  usePortfolioScore,
} from '../../app/composables/usePortfolioScore'

describe('resolveTicker', () => {
  it('resolves direct tickers and aliases, case/space-insensitively', () => {
    expect(resolveTicker('petr4')?.ticker).toBe('PETR4')
    expect(resolveTicker('  ITUB4 ')?.ticker).toBe('ITUB4')
    expect(resolveTicker('bitcoin')?.ticker).toBe('BTC')
    expect(resolveTicker('tesouro selic')?.ticker).toBe('TESOURO SELIC')
    expect(resolveTicker('selic')?.category).toBe('renda-fixa-pos')
  })

  it('returns null for an unknown ticker', () => {
    expect(resolveTicker('ZZZZ9')).toBeNull()
  })
})

describe('inferUnknownTicker', () => {
  it('infers FII for an 11-suffix, BDR for the 4-letter+3[34] pattern, else a BR stock', () => {
    expect(inferUnknownTicker('ZZZZ11').category).toBe('fii-tijolo')
    expect(inferUnknownTicker('AAPL34').category).toBe('bdr')
    expect(inferUnknownTicker('XPTO3').category).toBe('acoes-br')
  })
})

describe('analyzePortfolio', () => {
  it('returns the empty report for no inputs', () => {
    const r = analyzePortfolio([])
    expect(r.score).toBe(0)
    expect(r.band).toBe('atencao')
    expect(r.bandLabel).toBe('Aguardando')
    expect(r.composition).toEqual([])
    expect(r.dimensions).toEqual([])
  })

  it('normalizes explicit weights to fractions summing to 1', () => {
    const r = analyzePortfolio([
      { ticker: 'PETR4', weight: 30 },
      { ticker: 'ITUB4', weight: 10 },
    ])
    expect(r.composition).toHaveLength(2)
    expect(r.composition[0]!.weight).toBeCloseTo(0.75, 6) // 30/40
    expect(r.composition[1]!.weight).toBeCloseTo(0.25, 6) // 10/40
    expect(r.composition.reduce((s, a) => s + a.weight, 0)).toBeCloseTo(1, 6)
  })

  it('falls back to equal weights when none are provided', () => {
    const r = analyzePortfolio([{ ticker: 'PETR4' }, { ticker: 'ITUB4' }, { ticker: 'VALE3' }])
    for (const a of r.composition) expect(a.weight).toBeCloseTo(1 / 3, 6)
  })

  it('produces a deterministic score in [0,100] with a band matching the thresholds', () => {
    const a = analyzePortfolio(DEMO_PORTFOLIO)
    const b = analyzePortfolio(DEMO_PORTFOLIO)
    expect(a.score).toBe(b.score) // deterministic
    expect(a.score).toBeGreaterThanOrEqual(0)
    expect(a.score).toBeLessThanOrEqual(100)

    const expectedBand = a.score < 45 ? 'critico' : a.score < 65 ? 'atencao' : a.score < 82 ? 'bom' : 'excelente'
    expect(a.band).toBe(expectedBand)

    expect(a.dimensions.map((d) => d.id)).toEqual([
      'diversificacao',
      'concentracao',
      'qualidade',
      'renda',
      'cambial',
      'liquidez',
      'volatilidade',
      'crescimento',
      'macro',
    ])
    expect(a.composition).toHaveLength(6)
    expect(a.expectedReturn).toBeGreaterThan(0)
    expect(a.allocationByClass.reduce((s, c) => s + c.weight, 0)).toBeCloseTo(1, 6)
  })

  it('flags concentration risk for a single dominant asset', () => {
    const r = analyzePortfolio([{ ticker: 'PETR4', weight: 100 }])
    expect(r.composition[0]!.weight).toBeCloseTo(1, 6)
    expect(r.risks.some((risk) => risk.title.includes('PETR4') || /concentrad/i.test(risk.title))).toBe(true)
  })
})

describe('usePortfolioScore factory', () => {
  it('exposes the analysis functions and demo constants', () => {
    const api = usePortfolioScore()
    expect(typeof api.analyzePortfolio).toBe('function')
    expect(typeof api.analyzePortfolioAsync).toBe('function')
    expect(api.DEMO_PORTFOLIO).toBe(DEMO_PORTFOLIO)
    expect(api.SUGGESTED_TICKERS).toEqual(SUGGESTED_TICKERS)
  })
})

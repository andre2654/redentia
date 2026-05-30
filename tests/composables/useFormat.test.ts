import { describe, expect, it } from 'vitest'
import { useFormat } from '../../app/composables/useFormat'

// useFormat is a pure factory (Intl-based, no Nuxt runtime) → node env.
const { brl, brlCompact, number, percent } = useFormat()
// The formatters force non-breaking spaces; normalize all whitespace to a
// regular space so assertions are stable across ICU versions.
const nb = (s: string) => s.replace(/\s/g, ' ')

describe('useFormat.brl', () => {
  it('formats BRL currency (pt-BR)', () => {
    expect(nb(brl(1234.56))).toBe('R$ 1.234,56')
    expect(nb(brl(-50))).toBe('-R$ 50,00')
    expect(nb(brl('1000'))).toBe('R$ 1.000,00')
  })
  it('returns an em dash for non-finite input', () => {
    expect(brl(Number.NaN)).toBe('—')
    expect(brl('abc')).toBe('—')
  })
})

describe('useFormat.brlCompact', () => {
  it('formats with R$ prefix and an optional unit suffix', () => {
    expect(nb(brlCompact(1000))).toBe('R$ 1.000,00')
    expect(nb(brlCompact(1000, 'mi'))).toBe('R$ 1.000,00 mi')
  })
  it('returns an em dash for non-finite input', () => {
    expect(brlCompact(undefined)).toBe('—')
  })
})

describe('useFormat.number', () => {
  it('formats with two fraction digits, pt-BR separators', () => {
    expect(number(1234.5)).toBe('1.234,50')
    expect(number(0)).toBe('0,00')
  })
  it('returns an em dash for non-finite input', () => {
    expect(number('xyz')).toBe('—')
  })
})

describe('useFormat.percent', () => {
  it('shows an explicit + sign and a unicode minus, with a % suffix', () => {
    expect(percent(5.2)).toBe('+5,20%')
    expect(percent(-3.1)).toBe('−3,10%') // U+2212 minus, not ASCII hyphen
    expect(percent(0)).toBe('0,00%') // exceptZero → no sign
  })
  it('returns an em dash for non-finite input', () => {
    expect(percent(Number.NaN)).toBe('—')
    expect(percent('abc')).toBe('—')
  })
})

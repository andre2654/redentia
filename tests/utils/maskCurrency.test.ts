import { describe, expect, it } from 'vitest'
import { maskCurrency } from '../../app/utils/maskCurrency'

describe('maskCurrency', () => {
  it('masks R$ amounts while keeping the currency prefix', () => {
    expect(maskCurrency('R$ 100')).toBe('R$ ••••••')
    expect(maskCurrency('R$ 1.000')).toBe('R$ ••••••')
    expect(maskCurrency('R$ 521.740,09')).toBe('R$ ••••••')
    expect(maskCurrency('R$1000')).toBe('R$ ••••••') // no space
  })

  it('masks signed P&L amounts, leaving the leading sign in place', () => {
    expect(maskCurrency('+R$ 50')).toBe('+R$ ••••••')
    expect(maskCurrency('-R$ 20')).toBe('-R$ ••••••')
  })

  it('masks bare BR-formatted numbers (no R$) with the plain placeholder', () => {
    expect(maskCurrency('Patrimônio: 245.727,62')).toBe('Patrimônio: ••••••')
    expect(maskCurrency('1.000.000,00')).toBe('••••••')
    expect(maskCurrency('100,50')).toBe('••••••')
    expect(maskCurrency('1.500')).toBe('••••••') // thousands separator only
  })

  it('does NOT mask ambiguous numbers (counts, years, single-decimal, dates)', () => {
    expect(maskCurrency('100')).toBe('100')
    expect(maskCurrency('1990')).toBe('1990')
    expect(maskCurrency('1,5')).toBe('1,5')
    expect(maskCurrency('01/05/2024')).toBe('01/05/2024')
  })

  it('preserves surrounding HTML markup, masking only the number text', () => {
    expect(maskCurrency('<strong>R$ 1.000,00</strong>')).toBe('<strong>R$ ••••••</strong>')
    expect(maskCurrency('<td>245.727,62</td>')).toBe('<td>••••••</td>')
  })

  it('returns falsy input unchanged and honours custom placeholders', () => {
    expect(maskCurrency('')).toBe('')
    expect(maskCurrency('R$ 100', '[hidden]', 'XXX')).toBe('[hidden]')
    expect(maskCurrency('245.727,62', '[hidden]', 'XXX')).toBe('XXX')
  })
})

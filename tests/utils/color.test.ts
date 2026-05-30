import { describe, expect, it } from 'vitest'
import { dividendAccent, hoverBg, luminance, mix, readableOn } from '../../app/utils/color'

describe('color utils', () => {
  it('luminance: ~1 for white, 0 for black, 0 for invalid, handles #rgb shorthand', () => {
    expect(luminance('#FFFFFF')).toBeCloseTo(1, 5)
    expect(luminance('#000000')).toBe(0)
    expect(luminance('not-a-hex')).toBe(0)
    expect(luminance('#fff')).toBeCloseTo(1, 5)
  })

  it('readableOn: dark text on light backgrounds, white text on dark', () => {
    expect(readableOn('#FFFFFF')).toBe('#000000')
    expect(readableOn('#000000')).toBe('#FFFFFF')
    expect(readableOn('#FACC15')).toBe('#000000') // light amber → dark text
  })

  it('mix: lightens toward white (+), darkens toward black (-), passes invalid through', () => {
    expect(mix('#000000', 1)).toBe('#FFFFFF')
    expect(mix('#FFFFFF', -1)).toBe('#000000')
    expect(mix('#808080', 0)).toBe('#808080')
    expect(mix('nope', 0.5)).toBe('nope')
  })

  it('hoverBg: darkens the surface in light mode, translucent white otherwise', () => {
    expect(hoverBg('light', '#FFFFFF')).toBe(mix('#FFFFFF', -0.04))
    expect(hoverBg('dark', '#101010')).toBe('rgba(255, 255, 255, 0.05)')
  })

  it('dividendAccent: falls back to positive when primary collides with negative', () => {
    expect(dividendAccent('#DC2626', '#DC2626', '#16A34A')).toBe('#16A34A')
    expect(dividendAccent('#2563EB', '#DC2626', '#16A34A')).toBe('#2563EB')
    expect(dividendAccent('', '#DC2626', '#16A34A')).toBe('') // empty primary returns primary
  })
})

import { describe, expect, it } from 'vitest'
import { REDENTIA_COLORS, REDENTIA_RGB, darkenHex } from '../../app/utils/redentiaCreativeColors'

describe('darkenHex', () => {
  it('scales each RGB channel by the factor (lowercase hex out)', () => {
    expect(darkenHex('#FFFFFF', 0.5)).toBe('#808080') // 255*0.5 → 128 → 0x80
    expect(darkenHex('#FFFFFF', 1)).toBe('#ffffff')
    expect(darkenHex('#FFFFFF', 0)).toBe('#000000')
    expect(darkenHex('#F5A623', 0.5)).toBe('#7b5312') // 245→123, 166→83, 35→18
  })
})

describe('Redentia creative palette', () => {
  it('exposes the frozen brand colors and RGB triplets', () => {
    expect(REDENTIA_COLORS.primary).toBe('#F5A623')
    expect(REDENTIA_COLORS.background).toBe('#0A0B0E')
    expect(REDENTIA_RGB.primary).toBe('245, 166, 35')
  })
})

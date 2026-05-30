import { describe, expect, it } from 'vitest'
import { isPlaceholderLogo, resolveLogo } from '../../app/utils/logo'

describe('isPlaceholderLogo', () => {
  it('treats empty/nullish and the generic BRAPI.svg fallback as placeholders', () => {
    expect(isPlaceholderLogo(null)).toBe(true)
    expect(isPlaceholderLogo(undefined)).toBe(true)
    expect(isPlaceholderLogo('')).toBe(true)
    expect(isPlaceholderLogo('https://icons.brapi.dev/icons/BRAPI.svg')).toBe(true)
  })

  it('treats a real per-ticker CDN logo as a genuine logo', () => {
    expect(isPlaceholderLogo('https://icons.brapi.dev/icons/PETR4.svg')).toBe(false)
  })
})

describe('resolveLogo', () => {
  it('prefers a real scrape logo over the fallback', () => {
    expect(resolveLogo('https://si.com/petr4.png', 'https://icons.brapi.dev/icons/PETR4.svg')).toBe(
      'https://si.com/petr4.png',
    )
  })

  it('uses the fallback when the scrape logo is missing or a placeholder', () => {
    expect(resolveLogo(null, 'https://icons.brapi.dev/icons/PETR4.svg')).toBe('https://icons.brapi.dev/icons/PETR4.svg')
    expect(resolveLogo('https://icons.brapi.dev/icons/BRAPI.svg', 'https://icons.brapi.dev/icons/WEGE3.svg')).toBe(
      'https://icons.brapi.dev/icons/WEGE3.svg',
    )
  })

  it('returns null when nothing usable is available', () => {
    expect(resolveLogo(null, null)).toBeNull()
    expect(resolveLogo('https://icons.brapi.dev/icons/BRAPI.svg', null)).toBeNull()
  })
})

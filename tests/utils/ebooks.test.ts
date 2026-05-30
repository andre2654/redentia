import { describe, expect, it } from 'vitest'
import { EBOOKS, findEbook } from '../../app/utils/ebooks'

describe('findEbook', () => {
  it('finds an ebook by slug', () => {
    expect(findEbook('imperio-por-tras-do-feed')?.title).toBe('Panorama dos finfluencers')
  })

  it('returns undefined for an unknown slug', () => {
    expect(findEbook('nope')).toBeUndefined()
  })
})

describe('EBOOKS catalog', () => {
  it('has unique slugs and the required meta/SEO fields', () => {
    const slugs = EBOOKS.map((e) => e.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const e of EBOOKS) {
      expect(e.slug).toBeTruthy()
      expect(e.plainTitle).toBeTruthy()
      expect(e.downloadHref).toMatch(/^\//)
      expect(e.seo.title).toBeTruthy()
      expect(Array.isArray(e.chapters)).toBe(true)
    }
  })
})

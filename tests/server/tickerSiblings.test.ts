import { describe, expect, it } from 'vitest'
import { computeSiblingCandidates } from '../../server/utils/tickerSiblings'

describe('computeSiblingCandidates', () => {
  it('returns the other stock-class suffixes for a stock, excluding the unit (11)', () => {
    expect(computeSiblingCandidates('PETR4')).toEqual(['PETR3', 'PETR5', 'PETR6'])
    expect(computeSiblingCandidates('BBDC3')).toEqual(['BBDC4', 'BBDC5', 'BBDC6'])
  })

  it('returns no candidates for a unit ticker (no other unit class in the list)', () => {
    expect(computeSiblingCandidates('TAEE11')).toEqual([])
  })

  it('returns [] for malformed tickers (wrong shape or casing)', () => {
    expect(computeSiblingCandidates('PETR')).toEqual([]) // no numeric class
    expect(computeSiblingCandidates('petr4')).toEqual([]) // lowercase doesn't match [A-Z]
    expect(computeSiblingCandidates('ABCDE4')).toEqual([]) // 5 letters
  })
})

import { describe, expect, it } from 'vitest'
import { getErrorMessage } from '../../app/helpers/errors'

const DEFAULT = 'Ocorreu um erro. Tente novamente.'

describe('getErrorMessage', () => {
  it('returns the string directly when the error is a string', () => {
    expect(getErrorMessage('boom')).toBe('boom')
  })

  it('prefers data.message (ofetch/$fetch style) over Error.message', () => {
    const err = Object.assign(new Error('generic'), { data: { message: 'API exploded' } })
    expect(getErrorMessage(err)).toBe('API exploded')
  })

  it('falls back to Error.message when there is no data.message', () => {
    expect(getErrorMessage(new Error('plain failure'))).toBe('plain failure')
  })

  it('reads message from a plain object, preferring data.message', () => {
    expect(getErrorMessage({ data: { message: 'nested' }, message: 'top' })).toBe('nested')
    expect(getErrorMessage({ message: 'top only' })).toBe('top only')
  })

  it('returns the fallback for nullish, non-record, or message-less input', () => {
    expect(getErrorMessage(null)).toBe(DEFAULT)
    expect(getErrorMessage(42)).toBe(DEFAULT)
    expect(getErrorMessage({}, 'custom fb')).toBe('custom fb')
  })
})

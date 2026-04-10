import type { IMarketCommentary } from '~/types/commentary'

export const useCommentariesService = () => {
  const { preventWithCache } = usePrevents()
  const config = useRuntimeConfig()
  const API = config.public.apiBaseUrl as string

  function unwrap<T>(payload: any): T {
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return payload.data as T
    }
    return payload as T
  }

  /**
   * Commentaries relevant to a specific ticker.
   * Returns: ticker-specific + sector + IBOV, merged by date DESC.
   */
  async function forTicker(ticker: string): Promise<IMarketCommentary[]> {
    const url = `${API}/market-commentaries/for-ticker/${ticker}`
    const resp = await preventWithCache(
      url,
      async () => await $fetch(url, { method: 'GET' })
    )
    return unwrap<IMarketCommentary[]>(resp) || []
  }

  /**
   * List commentaries with filters.
   */
  async function list(params: {
    scope?: 'index' | 'sector' | 'ticker'
    identifier?: string
    from?: string
    to?: string
    limit?: number
  } = {}): Promise<IMarketCommentary[]> {
    const query = new URLSearchParams()
    if (params.scope) query.set('scope', params.scope)
    if (params.identifier) query.set('identifier', params.identifier)
    if (params.from) query.set('from', params.from)
    if (params.to) query.set('to', params.to)
    if (params.limit) query.set('limit', String(params.limit))

    const qs = query.toString()
    const url = `${API}/market-commentaries${qs ? '?' + qs : ''}`
    const resp = await preventWithCache(
      url,
      async () => await $fetch(url, { method: 'GET' })
    )
    return unwrap<IMarketCommentary[]>(resp) || []
  }

  return { forTicker, list }
}

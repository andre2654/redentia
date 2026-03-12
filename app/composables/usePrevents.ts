const serverCache = new Map<string, { data: any; timestamp: number }>()

export function usePrevents() {
  const preventWithCache = async (
    key: string,
    next: () => Promise<any>,
    timeToExpire?: number
  ) => {
    const { cacheTempInSeconds } = useRuntimeConfig().public
    const ttl = (timeToExpire || cacheTempInSeconds) * 1000
    const now = Date.now()

    // SSR: use in-memory cache
    if (typeof window === 'undefined') {
      const cached = serverCache.get(key)
      if (cached && now - cached.timestamp < ttl) {
        return cached.data
      }

      const resp = await next()
      serverCache.set(key, { data: resp, timestamp: now })

      // Evict stale entries to prevent memory leak
      if (serverCache.size > 500) {
        for (const [k, v] of serverCache) {
          if (now - v.timestamp > ttl * 2) serverCache.delete(k)
        }
      }

      return resp
    }

    // Client: use sessionStorage
    const cachedString = sessionStorage.getItem(key)

    try {
      if (cachedString) {
        const cachedData = JSON.parse(cachedString)
        const cacheTime = cachedData.timestamp || 0

        if (now - cacheTime < ttl) {
          return cachedData.data
        } else {
          sessionStorage.removeItem(key)
        }
      }

      const resp = await next()

      sessionStorage.setItem(
        key,
        JSON.stringify({
          data: resp,
          timestamp: now,
        })
      )

      return resp
    } catch (error) {
      console.error('Error handling cached data:', error)
      return next()
    }
  }

  return {
    preventWithCache,
  }
}

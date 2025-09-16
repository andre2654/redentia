export function usePrevents() {
  const preventWithCache = async (key: string, next: () => Promise<any>, timeToExpire?: number) => {
    const { cacheTempInSeconds } = useRuntimeConfig().public

    const cachedString = localStorage.getItem(key)

    try {
      const now = Date.now()

      if (cachedString) {
        const cachedData = JSON.parse(cachedString)
        const cacheTime = cachedData.timestamp || 0

        if ((now - cacheTime) < (timeToExpire || cacheTempInSeconds) * 1000) {
          return cachedData.data
        } else {
          localStorage.removeItem(key)
        }
      }

      const resp = await next()

      localStorage.setItem(key, JSON.stringify({
        data: resp,
        timestamp: now
      }))

      return resp

    } catch (error) {
      console.error('Error handling cached data:', error)
      return next()
    }
  }

  return {
    preventWithCache
  }
}
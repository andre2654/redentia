import { useWebNotification } from '@vueuse/core'

export const useDailyNotification = () => {
  const { show, isSupported } = useWebNotification()
  const { getTopStocks } = useAssetsService()

  async function triggerDailySummary() {
    if (!isSupported.value) {
      console.warn('Web Notifications not supported')
      return
    }

    try {
      // Fetch data
      const [topStocks, bottomStocks] = await Promise.all([
        getTopStocks('top', 100000),
        getTopStocks('bottom', 100000)
      ])

      const top = topStocks?.[0]
      const bottom = bottomStocks?.[0]

      if (!top || !bottom) {
        console.warn('No stock data available for notification')
        return
      }

      // Format values
      const topChange = Number(top.change_percent || top.change || 0).toFixed(2)
      const bottomChange = Number(bottom.change_percent || bottom.change || 0).toFixed(2)

      // Show notification
      show({
        title: 'Resumo do Mercado 📊',
        body: `🚀 Alta: ${top.ticker} (${topChange}%)\n🔻 Baixa: ${bottom.ticker} (${bottomChange}%)`,
        icon: '/192x192.png',
        dir: 'auto',
        lang: 'pt-BR',
        tag: 'daily-summary', // Prevent duplicates
        renotify: true
      })

      return { success: true, top, bottom }
    } catch (error) {
      console.error('Failed to trigger daily notification:', error)
      return { success: false, error }
    }
  }

  // Check time every minute
  function startDailyCheck() {
    if (!import.meta.client) return

    setInterval(() => {
      const now = new Date()
      // Check if it's 18:00 (allow 1 minute window)
      if (now.getHours() === 18 && now.getMinutes() === 0) {
        // Check if we already sent it today (using localStorage to persist across reloads)
        const lastSent = localStorage.getItem('redentia_daily_notif_last_sent')
        const today = new Date().toDateString()

        if (lastSent !== today) {
          triggerDailySummary()
          localStorage.setItem('redentia_daily_notif_last_sent', today)
        }
      }
    }, 60000) // Check every minute
  }

  return {
    triggerDailySummary,
    startDailyCheck,
    isSupported
  }
}

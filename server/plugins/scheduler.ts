import { triggerMarketAlert } from '../utils/marketAlert'

export default defineNitroPlugin((nitroApp) => {
  const runScheduler = async () => {
    const now = new Date()
    // Check if it's a weekday (1-5)
    const day = now.getDay()
    if (day === 0 || day === 6) return

    // Check if it's 15:00
    const hour = now.getHours()
    const minute = now.getMinutes()

    if (hour === 15 && minute === 0) {
      console.log('Running scheduled market alert...')
      try {
        // Trigger alert for all users (no token provided = broadcast)
        await triggerMarketAlert()
      } catch (e) {
        console.error('Scheduler error:', e)
      }
    }
  }

  // Run every minute
  setInterval(runScheduler, 60000)
})

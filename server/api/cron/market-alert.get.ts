import { triggerMarketAlert } from '../../utils/marketAlert'

export default defineEventHandler(async (event) => {
  // Security check: Vercel sends this header for cron jobs
  const authHeader = getHeader(event, 'authorization')
  
  // Optional: You can verify a secret here if you want to protect this endpoint strictly
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) { ... }

  try {
    console.log('Executing scheduled market alert...')
    const result = await triggerMarketAlert()
    return result
  } catch (error) {
    console.error('Cron execution failed:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Cron execution failed',
    })
  }
})

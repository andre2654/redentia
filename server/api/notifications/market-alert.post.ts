import { triggerMarketAlert } from '../../utils/marketAlert'

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}))
  const { token } = body || {}

  try {
    return await triggerMarketAlert(token)
  } catch (error) {
    console.error('Error in market-alert:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to process market alert',
    })
  }
})

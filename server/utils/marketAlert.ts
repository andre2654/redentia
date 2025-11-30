import { getMarketData } from './market'
import { generateMarketAlertMessage } from './agent'
import { useFirebaseAdmin } from './firebaseAdmin'

export const triggerMarketAlert = async (token?: string) => {
  try {
    // 1. Fetch Top Movers
    const [losers, gainers] = await Promise.all([
      $fetch<any[]>('https://redentia-api.saraivada.com/api/top-stocks?side=bottom&volume=1000000'),
      $fetch<any[]>('https://redentia-api.saraivada.com/api/top-stocks?side=top&volume=1000000')
    ])

    const topLoser = losers?.[0]
    const topGainer = gainers?.[0]

    let targetTicker = ''
    
    const loserChange = Math.abs(topLoser?.change_percent || 0)
    const gainerChange = Math.abs(topGainer?.change_percent || 0)

    // Prefer drops if they are significant, or just the biggest move
    if (loserChange > gainerChange) {
      targetTicker = topLoser?.ticker
    } else {
      targetTicker = topGainer?.ticker
    }

    if (!targetTicker) {
       targetTicker = 'PETR4' 
    }

    // 2. Fetch Full Data for the ticker
    const marketData = await getMarketData(targetTicker, 'report')

    // 3. Generate Message
    const message = await generateMarketAlertMessage(targetTicker, marketData)

    // 4. Send Notification
    const { messaging } = useFirebaseAdmin()
    if (!messaging) {
        throw createError({ statusCode: 500, statusMessage: 'Firebase Admin not configured' })
    }

    const messagePayload: any = {
      notification: {
        title: `Alerta de Mercado: ${targetTicker}`,
        body: message,
      },
      data: {
        type: 'market_alert',
        ticker: targetTicker
      }
    }

    let response
    if (token) {
      messagePayload.token = token
      response = await messaging.send(messagePayload)
    } else {
      messagePayload.topic = 'market_alerts'
      response = await messaging.send(messagePayload)
    }

    return { success: true, messageId: response, ticker: targetTicker, message }

  } catch (error) {
    console.error('Error in triggerMarketAlert:', error)
    throw error
  }
}

import { getMarketData } from './market'
import { generateMarketAlertMessage } from './agent'
import { useFirebaseAdmin } from './firebaseAdmin'

export const triggerMarketAlert = async (token?: string) => {
  try {
    // 1. Time Check (11:00 - 17:00 Brasilia)
    const now = new Date()
    const brazilTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
    const hour = brazilTime.getHours()

    // Allow manual trigger (token provided) to bypass time check, otherwise enforce it
    if (!token && (hour < 11 || hour >= 17)) {
      console.log('Market alert skipped: Outside of operating hours (11h-17h).')
      return { success: false, message: 'Outside of operating hours' }
    }

    // 2. Fetch Top Movers
    const [losers, gainers] = await Promise.all([
      $fetch<any[]>('https://redentia-api.saraivada.com/api/top-stocks?side=bottom&volume=1000000'),
      $fetch<any[]>('https://redentia-api.saraivada.com/api/top-stocks?side=top&volume=1000000')
    ])

    // Combine and sort by absolute change
    const allCandidates = [...(losers || []), ...(gainers || [])]
      .map((item) => ({ ...item, absChange: Math.abs(item.change_percent || 0) }))
      .sort((a, b) => b.absChange - a.absChange)

    // Filter candidates with at least 5% change
    const candidates = allCandidates.filter((c) => c.absChange >= 5)

    if (candidates.length === 0) {
      console.log('No candidates with > 5% change.')
      return { success: false, message: 'No significant movements' }
    }

    const { messaging, firestore } = useFirebaseAdmin()
    if (!messaging || !firestore) {
      throw createError({ statusCode: 500, statusMessage: 'Firebase Admin not configured' })
    }

    const today = brazilTime.toISOString().split('T')[0] // YYYY-MM-DD
    const alertsRef = firestore.collection('market_alerts_history').doc(today)
    const docSnap = await alertsRef.get()
    const alertedTickers: string[] = docSnap.exists ? (docSnap.data()?.tickers || []) : []

    let targetTicker = ''
    let marketData = null

    for (const candidate of candidates) {
      if (alertedTickers.includes(candidate.ticker)) {
        continue
      }

      // Fetch full data to check Market Cap
      const data = await getMarketData(candidate.ticker, 'report')
      if (!data || !data.price) continue

      const marketCap = data.price.market_cap || data.fundamentals?.market_cap || 0
      // Threshold logic: Small Cap (< 1B) needs 10%, others need 5%
      const isSmallCap = marketCap < 1000000000
      const threshold = isSmallCap ? 10 : 5

      if (candidate.absChange >= threshold) {
        targetTicker = candidate.ticker
        marketData = data
        break // Found our winner
      }
    }

    if (!targetTicker || !marketData) {
      console.log('No valid candidates after filtering by threshold and history.')
      return { success: false, message: 'No valid candidates' }
    }

    // 3. Generate Message
    const message = await generateMarketAlertMessage(targetTicker, marketData)

    // 4. Send Notification
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

    // 5. Save to History (only if not a test/manual trigger, or maybe always? Let's save always to prevent spam)
    if (!token) {
      await alertsRef.set({
        tickers: [...alertedTickers, targetTicker],
        updatedAt: new Date()
      }, { merge: true })
    }

    return { success: true, messageId: response, ticker: targetTicker, message }

  } catch (error) {
    console.error('Error in triggerMarketAlert:', error)
    throw error
  }
}

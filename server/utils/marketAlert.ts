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
    const [losersRaw, gainersRaw] = await Promise.all([
      $fetch<any>(`${process.env.NUXT_PUBLIC_API_BASE_URL || 'https://redentia-api.saraivada.com/api'}/top-stocks?side=bottom&volume=1000000`).catch(() => []),
      $fetch<any>(`${process.env.NUXT_PUBLIC_API_BASE_URL || 'https://redentia-api.saraivada.com/api'}/top-stocks?side=top&volume=1000000`).catch(() => [])
    ])

    const coerceArray = (v: any) => {
      if (Array.isArray(v)) return v
      if (v && typeof v === 'object') {
        if (Array.isArray((v as any).data)) return (v as any).data
        if (Array.isArray((v as any).results)) return (v as any).results
        if (Array.isArray((v as any).items)) return (v as any).items
      }
      return []
    }

    const losers = coerceArray(losersRaw)
    const gainers = coerceArray(gainersRaw)

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
    if (!messaging) {
      throw createError({ statusCode: 500, statusMessage: 'Firebase Admin not configured' })
    }

    // Firestore is used only for anti-spam history. If it is disabled/misconfigured,
    // we still send the notification.
    const today = brazilTime.toISOString().split('T')[0] // YYYY-MM-DD
    const alertsRef = firestore
      ? firestore.collection('market_alerts_history').doc(today)
      : null

    let alertedTickers: string[] = []
    if (alertsRef) {
      try {
        const docSnap = await alertsRef.get()
        alertedTickers = docSnap.exists ? (docSnap.data()?.tickers || []) : []
      } catch (e) {
        alertedTickers = []
      }
    }

    let targetTicker = ''
    let marketData = null
    let selectedThreshold: number | null = null
    let selectedRealAbsChange: number | null = null
    let selectedMarketCap: any = null
    let scanned = 0
    let skippedHistory = 0
    let skippedNoData = 0
    let skippedBelowThreshold = 0

    for (const candidate of candidates) {
      scanned += 1
      if (alertedTickers.includes(candidate.ticker)) {
        skippedHistory += 1
        continue
      }

      // Fetch full data to check Market Cap
      const data = await getMarketData(candidate.ticker, 'report')
      if (!data || !data.price) {
        skippedNoData += 1
        continue
      }

      const marketCap = data.price.market_cap || data.fundamentals?.market_cap || 0
      // Threshold logic: Small Cap (< 1B) needs 10%, others need 5%
      const isSmallCap = marketCap < 1000000000
      const threshold = isSmallCap ? 10 : 5

      // Double check: Use the REAL change from the detailed data, not the one from the list
      const realAbsChange = Math.abs(data.price.change || 0)

      if (realAbsChange >= threshold) {
        targetTicker = candidate.ticker
        marketData = data
        selectedThreshold = threshold
        selectedRealAbsChange = realAbsChange
        selectedMarketCap = marketCap
        break // Found our winner
      }
      skippedBelowThreshold += 1
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
    if (!token && alertsRef) {
      try {
        await alertsRef.set({
          tickers: [...alertedTickers, targetTicker],
          updatedAt: new Date()
        }, { merge: true })
      } catch {
        // Ignore history persistence failures
      }
    }

    return { success: true, messageId: response, ticker: targetTicker, message }

  } catch (error) {
    console.error('Error in triggerMarketAlert:', error)
    throw error
  }
}

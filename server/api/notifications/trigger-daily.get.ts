import fs from 'fs'
import path from 'path'
import { sendNotification } from '../../utils/notifications'

export default defineEventHandler(async (event) => {
    // 1. Fetch Data
    const topStocksUrl = 'https://redentia-api.saraivada.com/api/top-stocks?side=top&volume=100000'
    const bottomStocksUrl = 'https://redentia-api.saraivada.com/api/top-stocks?side=bottom&volume=100000'

    let topStock = null
    let bottomStock = null

    try {
        const [topRes, bottomRes] = await Promise.all([
            $fetch<any[]>(topStocksUrl),
            $fetch<any[]>(bottomStocksUrl)
        ])

        const topData = Array.isArray(topRes) ? topRes : (topRes as any)?.data
        const bottomData = Array.isArray(bottomRes) ? bottomRes : (bottomRes as any)?.data

        if (topData && topData.length > 0) topStock = topData[0]
        if (bottomData && bottomData.length > 0) bottomStock = bottomData[0]

    } catch (error) {
        console.error('Error fetching stock data:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch stock data',
        })
    }

    if (!topStock || !bottomStock) {
        return { success: false, message: 'No data available' }
    }

    // 2. Construct Notification Payload
    const payload = {
        title: 'Resumo do Mercado 📊',
        body: `🚀 Alta: ${topStock.ticker} (${Number(topStock.change_percent).toFixed(2)}%)\n🔻 Baixa: ${bottomStock.ticker} (${Number(bottomStock.change_percent).toFixed(2)}%)`,
        icon: '/192x192.png',
        data: {
            url: '/'
        }
    }

    // 3. Send to Subscribers
    const filePath = path.resolve(process.cwd(), 'server/subscriptions.json')
    let subscriptions: any[] = []

    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8')
            subscriptions = JSON.parse(data)
        }
    } catch (e) {
        console.error('Error reading subscriptions file:', e)
        return { success: false, message: 'No subscriptions found' }
    }

    const results = await Promise.all(subscriptions.map(async (sub) => {
        const success = await sendNotification(sub, payload)
        return { sub, success }
    }))

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    // Optional: Remove failed subscriptions (410 Gone)
    // For now, we just log

    return {
        success: true,
        sent: successCount,
        failed: failCount,
        message: `Notification sent to ${successCount} devices`
    }
})

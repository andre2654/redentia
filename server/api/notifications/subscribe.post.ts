import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const subscription = body.subscription

    if (!subscription || !subscription.endpoint) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid subscription',
        })
    }

    const filePath = path.resolve(process.cwd(), 'server/subscriptions.json')

    let subscriptions: any[] = []

    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8')
            subscriptions = JSON.parse(data)
        }
    } catch (e) {
        console.error('Error reading subscriptions file:', e)
    }

    // Check if subscription already exists
    const exists = subscriptions.find(s => s.endpoint === subscription.endpoint)

    if (!exists) {
        subscriptions.push(subscription)
        try {
            fs.writeFileSync(filePath, JSON.stringify(subscriptions, null, 2))
        } catch (e) {
            console.error('Error writing subscriptions file:', e)
            throw createError({
                statusCode: 500,
                statusMessage: 'Failed to save subscription',
            })
        }
    }

    return { success: true }
})

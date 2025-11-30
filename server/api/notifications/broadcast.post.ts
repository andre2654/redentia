export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { title, message, data, topic } = body

  // Default topic to 'market_alerts' if not provided
  const targetTopic = topic || 'market_alerts'

  if (!title || !message) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: title, message',
    })
  }

  const { messaging } = useFirebaseAdmin()

  if (!messaging) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Firebase Admin not configured',
    })
  }

  try {
    const response = await messaging.send({
      topic: targetTopic,
      notification: {
        title,
        body: message,
      },
      data: data || {},
    })

    return { success: true, messageId: response, topic: targetTopic }
  } catch (error) {
    console.error('Error sending broadcast notification:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send broadcast notification',
    })
  }
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { token, topic } = body

  if (!token || !topic) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing token or topic',
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
    await messaging.subscribeToTopic(token, topic)
    return { success: true, message: `Subscribed to ${topic}` }
  } catch (error) {
    console.error('Error subscribing to topic:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to subscribe to topic',
    })
  }
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { token, title, message, data } = body

  if (!token || !title || !message) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: token, title, message',
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
      token,
      notification: {
        title,
        body: message,
      },
      data: data || {},
    })

    return { success: true, messageId: response }
  } catch (error) {
    console.error('Error sending notification:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send notification',
    })
  }
})

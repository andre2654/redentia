export const useFirebaseNotifications = () => {
  const { messaging } = useFirebase()
  const config = useRuntimeConfig()
  const token = ref<string | null>(null)
  const toast = useToast()
  const permissionStatus = ref<NotificationPermission>('default')

  const getTokenAndSubscribe = async () => {
    if (!process.client || !messaging) return

    try {
      const { getToken } = await import('firebase/messaging')

      // Get the service worker registration from PWA
      console.log('Waiting for service worker registration...')
      const registration = await navigator.serviceWorker.ready
      console.log('Service worker ready:', registration)

      const currentToken = await getToken(messaging, {
        serviceWorkerRegistration: registration,
        vapidKey: config.public.firebaseVapidKey,
      })

      if (currentToken) {
        console.log('FCM Token:', currentToken)
        token.value = currentToken

        // Subscribe to market_alerts topic
        try {
          await $fetch('/api/notifications/subscribe', {
            method: 'POST',
            body: { token: currentToken, topic: 'market_alerts' },
          })
          console.log('Subscribed to market_alerts')
        } catch (e) {
          console.error('Failed to subscribe to market_alerts', e)
        }
      } else {
        console.log('No registration token available.')
      }
    } catch (err) {
      console.log('An error occurred while retrieving token. ', err)
    }
  }

  const checkPermission = async () => {
    if (!process.client || !('Notification' in window)) return

    permissionStatus.value = Notification.permission

    if (permissionStatus.value === 'granted') {
      await getTokenAndSubscribe()
    }
  }

  const requestPermission = async () => {
    if (!process.client || !messaging) return

    try {
      const permission = await Notification.requestPermission()
      permissionStatus.value = permission

      if (permission === 'granted') {
        console.log('Notification permission granted.')
        await getTokenAndSubscribe()
      } else {
        console.log('Unable to get permission to notify.')
      }
    } catch (err) {
      console.log('An error occurred while requesting permission. ', err)
    }
  }

  const listen = async () => {
    if (!process.client || !messaging) return

    const { onMessage } = await import('firebase/messaging')
    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload)
      const { title, body } = payload.notification || {}

      if (title && body) {
        toast.add({
          title,
          description: body,
          icon: 'i-heroicons-bell',
          timeout: 5000
        })
      }
    })
  }

  return {
    token,
    permissionStatus,
    checkPermission,
    requestPermission,
    listen,
  }
}

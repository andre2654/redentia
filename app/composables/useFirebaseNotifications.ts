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
      const registration = await navigator.serviceWorker.ready

      const currentToken = await getToken(messaging, {
        serviceWorkerRegistration: registration,
        vapidKey: config.public.firebaseVapidKey,
      })

      if (currentToken) {
        token.value = currentToken

        // Subscribe to market_alerts topic
        try {
          await $fetch('/api/notifications/subscribe', {
            method: 'POST',
            body: { token: currentToken, topic: 'market_alerts' },
          })
        } catch (e) {
          console.error('Failed to subscribe to market_alerts', e)
        }
      }
    } catch (err) {
      console.error('Error retrieving FCM token:', err)
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
        await getTokenAndSubscribe()
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err)
    }
  }

  const listen = async () => {
    if (!process.client || !messaging) return

    const { onMessage } = await import('firebase/messaging')
    onMessage(messaging, (payload) => {
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

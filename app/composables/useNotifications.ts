export const useNotifications = () => {
    const isSupported = ref(false)
    const isSubscribed = ref(false)
    const permission = ref<NotificationPermission>('default')

    // VAPID Public Key (Must match server)
    const VAPID_PUBLIC_KEY = 'BBDy53S1i-52JUsOSYr1lL73T2CgwfZakhFtNn4TLiIsBj4p1a30KRWa14tybAF5sUH8aPbEqEv3kz6ZfUIZo4U'

    onMounted(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            isSupported.value = true
            permission.value = Notification.permission
            checkSubscription()
        }
    })

    async function checkSubscription() {
        if (!isSupported.value) return

        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        isSubscribed.value = !!subscription
    }

    function urlBase64ToUint8Array(base64String: string) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4)
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/')

        const rawData = window.atob(base64)
        const outputArray = new Uint8Array(rawData.length)

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i)
        }
        return outputArray
    }

    async function subscribe() {
        if (!isSupported.value) return

        try {
            const permissionResult = await Notification.requestPermission()
            permission.value = permissionResult

            if (permissionResult !== 'granted') {
                throw new Error('Permission not granted')
            }

            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            })

            // Send subscription to server
            await $fetch('/api/notifications/subscribe', {
                method: 'POST',
                body: { subscription }
            })

            isSubscribed.value = true
            return true
        } catch (error) {
            console.error('Failed to subscribe:', error)
            return false
        }
    }

    return {
        isSupported,
        isSubscribed,
        permission,
        subscribe
    }
}

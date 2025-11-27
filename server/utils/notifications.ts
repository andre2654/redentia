import webpush from 'web-push'

// In a real application, these should be in environment variables
// NUXT_PUBLIC_VAPID_PUBLIC_KEY
// NUXT_VAPID_PRIVATE_KEY

const vapidKeys = {
    publicKey: 'BBDy53S1i-52JUsOSYr1lL73T2CgwfZakhFtNn4TLiIsBj4p1a30KRWa14tybAF5sUH8aPbEqEv3kz6ZfUIZo4U',
    privateKey: '31dna3wBRZOVNr2ACutbWsRJ4s8sGqLvH6k07N3bJbo'
}

webpush.setVapidDetails(
    'mailto:admin@redentia.com.br',
    vapidKeys.publicKey,
    vapidKeys.privateKey
)

export const sendNotification = async (subscription: any, payload: any) => {
    try {
        await webpush.sendNotification(subscription, JSON.stringify(payload))
        return true
    } catch (error) {
        console.error('Error sending notification:', error)
        return false
    }
}

export const getVapidPublicKey = () => vapidKeys.publicKey

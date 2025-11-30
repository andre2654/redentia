importScripts(
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js'
)
importScripts(
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js'
)

// TODO: Replace with your Firebase config object
const firebaseConfig = {
  apiKey: 'AIzaSyBGJYh2ycl-yHStZflV-N5cNjnL96qcth8',
  authDomain: 'redentia-01.firebaseapp.com',
  projectId: 'redentia-01',
  storageBucket: 'redentia-01.firebasestorage.app',
  messagingSenderId: '906267512818',
  appId: '1:906267512818:web:2d07d39feffb873318256b',
}

firebase.initializeApp(firebaseConfig)

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  )

  // If the payload has a notification property, the browser will automatically show a notification.
  // We only need to manually show one if it's a data-only message.
  if (payload.notification) {
    return
  }

  const notificationTitle = payload.data.title
  const notificationOptions = {
    body: payload.data.body,
    icon: '/192x192.png', // Customize icon
    data: payload.data, // Pass data to the click handler
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

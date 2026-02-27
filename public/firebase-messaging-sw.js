/**
 * Firebase Messaging Service Worker
 * Handles background push notifications when the app is not in focus.
 * This file MUST be in the public/ directory root.
 */

/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js')

firebase.initializeApp({
    apiKey: "AIzaSyD2RkLD3U1dY4RuoZ9diUAEqrHrr1l2IWI",
    authDomain: "bantoo-8d094.firebaseapp.com",
    projectId: "bantoo-8d094",
    storageBucket: "bantoo-8d094.firebasestorage.app",
    messagingSenderId: "53463291940",
    appId: "1:53463291940:web:16350b8303983ebea860b1",
})

const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    const { title, body, icon } = payload.notification || {}

    const notificationTitle = title || 'Bantoo!'
    const notificationOptions = {
        body: body || 'Ada notifikasi baru',
        icon: icon || '/favicon.svg',
        badge: '/favicon.svg',
        tag: payload.data?.type || 'general',
        data: payload.data || {},
        vibrate: [200, 100, 200],
    }

    self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close()

    const data = event.notification.data || {}
    let targetUrl = '/'

    // Route based on notification type
    switch (data.type) {
        case 'new_order':
            targetUrl = '/merchant/orders'
            break
        case 'order_accepted':
        case 'order_picked_up':
        case 'order_delivered':
            targetUrl = `/orders/${data.orderId}`
            break
        case 'driver_assigned':
            targetUrl = `/tracking/${data.orderId}`
            break
        case 'new_delivery':
            targetUrl = `/driver/order/${data.orderId}`
            break
        case 'chat_message':
            targetUrl = `/chat/${data.orderId}`
            break
        default:
            targetUrl = '/'
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (const client of windowClients) {
                if (client.url.includes(self.location.origin)) {
                    client.navigate(targetUrl)
                    return client.focus()
                }
            }
            return clients.openWindow(targetUrl)
        })
    )
})

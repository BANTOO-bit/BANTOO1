/**
 * Firebase Configuration — Initialize Firebase App & Messaging
 * Reads credentials from environment variables (VITE_FIREBASE_*)
 */
import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || ''

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Messaging (only in browsers that support it)
let messaging = null
try {
    if (typeof window !== 'undefined' && 'Notification' in window) {
        messaging = getMessaging(app)
    }
} catch (err) {
    console.warn('[Firebase] Messaging not supported:', err.message)
}

export { app, messaging, VAPID_KEY, getToken, onMessage }

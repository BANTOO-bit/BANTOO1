// Service Worker — BANTOO PWA
// Cache-first for static assets, network-first for API

// Fix #5: Static versioning so cache isn't unnecessarily invalidated every day
const CACHE_VERSION = 'v1.0.0'
const CACHE_NAME = `bantoo-cache-${CACHE_VERSION}`
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon-192.svg',
    '/icon-512.svg'
]

// Install — cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS)
        })
    )
    self.skipWaiting()
})

// Activate — clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        })
    )
    self.clients.claim()
})

// Fetch — strategy based on request type
self.addEventListener('fetch', (event) => {
    const { request } = event
    const url = new URL(request.url)

    // Skip entirely in development (Vite dev server)
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return

    // Skip non-GET requests
    if (request.method !== 'GET') return

    // Skip Supabase API calls (always network)
    if (url.hostname.includes('supabase')) return

    // Skip chrome-extension and other non-http(s)
    if (!url.protocol.startsWith('http')) return

    // For navigation requests (HTML pages) — network first, fallback to cache
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const clone = response.clone()
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
                    return response
                })
                .catch(() => caches.match('/index.html'))
        )
        return
    }

    // For static assets (JS, CSS, images) — cache first, fallback to network
    if (
        url.pathname.startsWith('/assets/') ||
        url.pathname.endsWith('.js') ||
        url.pathname.endsWith('.css') ||
        url.pathname.match(/\.(png|jpg|jpeg|webp|svg|ico|woff2?)$/)
    ) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached
                return fetch(request).then((response) => {
                    const clone = response.clone()
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
                    return response
                })
            })
        )
        return
    }

    // For Google Fonts — cache first
    if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached
                return fetch(request).then((response) => {
                    const clone = response.clone()
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
                    return response
                })
            })
        )
        return
    }

    // Default — network first
    event.respondWith(
        fetch(request)
            .then((response) => {
                return response
            })
            .catch(() => caches.match(request))
    )
})

// Push notification handler (for future FCM integration)
self.addEventListener('push', (event) => {
    if (!event.data) return

    const data = event.data.json()
    const title = data.title || 'BANTOO'
    const options = {
        body: data.body || '',
        icon: '/icon-192.svg',
        badge: '/icon-192.svg',
        tag: data.tag || 'bantoo-push',
        data: data.data || {}
    }

    event.waitUntil(self.registration.showNotification(title, options))
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    event.waitUntil(
        self.clients.matchAll({ type: 'window' }).then((clients) => {
            // Focus existing window or open new one
            for (const client of clients) {
                if ('focus' in client) return client.focus()
            }
            return self.clients.openWindow('/')
        })
    )
})

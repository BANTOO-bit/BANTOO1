import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import ScrollToTop from '@/features/shared/components/ScrollToTop'
import './index.css'

// ── Sentry Error Monitoring (Lazy-loaded) ──────────────────────
// Deferred to avoid blocking initial render with the 264KB Sentry bundle.
// Only active in production (DSN must be set in .env)
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN
if (SENTRY_DSN) {
    // Load Sentry asynchronously after initial render
    import('@sentry/react').then((Sentry) => {
        Sentry.init({
            dsn: SENTRY_DSN,
            environment: import.meta.env.MODE, // 'production' or 'development'
            integrations: [
                Sentry.browserTracingIntegration(),
                Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false }),
            ],
            tracesSampleRate: 0.2,        // 20% of transactions
            replaysSessionSampleRate: 0.1, // 10% of sessions
            replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
        })
    }).catch(() => {
        // Silent fail — Sentry is non-critical
    })
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <ScrollToTop />
            <App />
        </BrowserRouter>
    </React.StrictMode>
)


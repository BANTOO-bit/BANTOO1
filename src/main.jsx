import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import App from './App.jsx'
import ScrollToTop from '@/features/shared/components/ScrollToTop'
import './index.css'

// ── Sentry Error Monitoring ──────────────────────────────────────
// Only active in production (DSN must be set in .env)
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN
if (SENTRY_DSN) {
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
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Sentry.ErrorBoundary
            fallback={({ error }) => (
                <div style={{ padding: 40, textAlign: 'center', fontFamily: 'system-ui' }}>
                    <h2>😵 Terjadi Kesalahan</h2>
                    <p style={{ color: '#666' }}>Aplikasi mengalami error. Tim kami sudah diberitahu.</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ marginTop: 16, padding: '10px 24px', borderRadius: 8, border: 'none', background: '#2979FF', color: '#fff', cursor: 'pointer', fontSize: 16 }}
                    >
                        Muat Ulang
                    </button>
                    {import.meta.env.DEV && <pre style={{ marginTop: 16, textAlign: 'left', fontSize: 12, color: 'red' }}>{error?.toString()}</pre>}
                </div>
            )}
        >
            <BrowserRouter>
                <ScrollToTop />
                <App />
            </BrowserRouter>
        </Sentry.ErrorBoundary>
    </React.StrictMode>
)

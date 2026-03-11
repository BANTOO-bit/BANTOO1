import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full text-center">
        <h2 className="text-xl font-bold text-red-600 mb-2">Oops! Terjadi Kesalahan</h2>
        <p className="text-gray-500 mb-4">Aplikasi mengalami kendala teknis.</p>
        <div className="bg-gray-100 p-3 rounded-lg text-xs text-red-800 overflow-auto mb-6 max-h-40 text-left">
          <pre>{error.message}</pre>
        </div>
        <button
          onClick={resetErrorBoundary}
          className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
        >
          Muat Ulang Aplikasi
        </button>
      </div>
    </div>
  )
}

export default function GlobalErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        window.location.href = '/'
      }}
      onError={(error, info) => {
        console.error("Terjadi error yang tertangkap ErrorBoundary:", error, info)
        // Integrasi Sentry (jika ada)
        if (window.Sentry) {
           window.Sentry.captureException(error);
        }
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

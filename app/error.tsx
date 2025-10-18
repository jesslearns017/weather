'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-slate-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 shadow-xl border border-red-200 max-w-md">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h2>
        <p className="text-slate-700 mb-4">{error.message}</p>
        <button
          onClick={reset}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

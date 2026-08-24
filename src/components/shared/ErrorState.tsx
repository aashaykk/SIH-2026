/**
 * ErrorState — shown when an API call fails.
 * Always includes actionable next step (retry / contact admin).
 */
interface Props {
  message?: string
  code?: string
  onRetry?: () => void
}

export function ErrorState({ message = 'Something went wrong', code, onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
      <div className="w-12 h-12 rounded-full bg-red-950 border border-red-800 flex items-center justify-center">
        <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <p className="text-slate-200 font-medium">{message}</p>
        {code && <p className="text-slate-500 text-xs mt-1 font-mono">Error code: {code}</p>}
      </div>
      {onRetry && (
        <button onClick={onRetry} className="px-4 py-2 bg-surface-elevated border border-surface-border rounded-lg text-sm text-slate-300 hover:text-white hover:border-slate-500 transition-colors">
          Try again
        </button>
      )}
    </div>
  )
}

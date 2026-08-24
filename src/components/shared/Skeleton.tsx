/** Skeleton loader — prevents layout shift while data loads */
interface Props { className?: string; lines?: number }

export function Skeleton({ className = 'h-4 w-full', lines }: Props) {
  if (lines) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className={`animate-pulse bg-surface-elevated rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'} h-4`} />
        ))}
      </div>
    )
  }
  return <div className={`animate-pulse bg-surface-elevated rounded ${className}`} />
}

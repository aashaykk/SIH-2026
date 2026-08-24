/**
 * KPICard — top-level metric display
 * Used in the Civic Command Center header row.
 */
interface Props {
  label: string
  value: number | string
  trend?: number       // positive = good, negative = bad
  trendLabel?: string  // "vs yesterday"
  accentColor?: string // tailwind color class for the left border
  icon?: string
  isLoading?: boolean
}

export function KPICard({ label, value, trend, trendLabel, accentColor = 'border-primary', icon, isLoading }: Props) {
  const trendPositive = (trend ?? 0) >= 0

  if (isLoading) {
    return (
      <div className="bg-surface-card border border-surface-border rounded-xl p-5 flex flex-col gap-3 animate-pulse">
        <div className="h-3 w-24 bg-surface-elevated rounded" />
        <div className="h-8 w-16 bg-surface-elevated rounded" />
      </div>
    )
  }

  return (
    <div className={`bg-surface-card border-l-4 ${accentColor} border-t border-r border-b border-surface-border rounded-xl p-5 flex flex-col gap-1`}>
      <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-widest">
        {icon && <span>{icon}</span>}
        {label}
      </div>
      <div className="text-3xl font-bold text-white font-display">{value}</div>
      {trend !== undefined && (
        <div className={`text-xs flex items-center gap-1 ${trendPositive ? 'text-green-400' : 'text-red-400'}`}>
          <span>{trendPositive ? '↑' : '↓'}</span>
          <span className="font-mono">{Math.abs(trend)}%</span>
          {trendLabel && <span className="text-slate-500">{trendLabel}</span>}
        </div>
      )}
    </div>
  )
}

/**
 * Analytics — Hotspot predictions + Ward health + Department performance
 * This is the "prevent tomorrow's complaint" page.
 */
import { useHotspots } from '../hooks/useDashboard'
import { CATEGORY_LABELS } from '../utils'
import { Skeleton } from '../components/shared/Skeleton'
import { ErrorState } from '../components/shared/ErrorState'

export function Analytics() {
  const { data: hotspots, isLoading, isError, refetch } = useHotspots('ward-17')

  return (
    <div className="min-h-screen bg-surface p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">Predictive Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Historical patterns to prevent tomorrow's civic issues</p>
        </div>

        {/* Hotspots */}
        <section>
          <h2 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-widest">🔥 Recurring Civic Hotspots</h2>
          {isLoading && <Skeleton lines={4} />}
          {isError && <ErrorState message="Failed to load hotspot data" onRetry={refetch} />}
          <div className="space-y-3">
            {hotspots?.map(hs => (
              <div key={hs.id} className="bg-surface-card border border-surface-border rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-white">{hs.address}</p>
                    <p className="text-sm text-slate-400 mt-0.5">{CATEGORY_LABELS[hs.category]} · {hs.occurrenceCount} historical incidents</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary font-mono">{Math.round(hs.confidence * 100)}%</p>
                    <p className="text-xs text-slate-500">confidence</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-slate-500 mb-1">Likely recurrence</p>
                    <p className="text-slate-200">{hs.predictedDays.join(', ')} · {hs.predictedTimeWindow}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Recommended action</p>
                    <p className="text-slate-200">{hs.recommendedAction}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

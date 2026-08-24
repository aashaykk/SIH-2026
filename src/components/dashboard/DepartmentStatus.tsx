/**
 * DepartmentStatus — horizontal bar showing per-dept load.
 * Click a department to filter incidents list.
 */
import { useDepartmentStats } from '../../hooks/useDashboard'
import { DEPARTMENT_LABELS } from '../../utils'
import { Skeleton } from '../shared/Skeleton'
import { ErrorState } from '../shared/ErrorState'

interface Props { onSelectDepartment?: (id: string) => void }

export function DepartmentStatus({ onSelectDepartment }: Props) {
  const { data, isLoading, isError, refetch } = useDepartmentStats()

  if (isLoading) return <div className="space-y-2"><Skeleton className="h-12 w-full" lines={5} /></div>
  if (isError) return <ErrorState message="Failed to load department data" onRetry={refetch} />
  if (!data?.length) return null

  const maxOpen = Math.max(...data.map(d => d.open), 1)

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Department Load</h3>
      <div className="space-y-3">
        {data.map((dept) => (
          <button
            key={dept.departmentId}
            onClick={() => onSelectDepartment?.(dept.departmentId)}
            className="w-full text-left group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400 group-hover:text-white transition-colors">
                {DEPARTMENT_LABELS[dept.departmentName]}
              </span>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-300">{dept.open} open</span>
                {dept.overdue > 0 && (
                  <span className="text-red-400">{dept.overdue} overdue</span>
                )}
              </div>
            </div>
            <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(dept.open / maxOpen) * 100}%` }}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

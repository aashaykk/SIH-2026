interface Props { title: string; description?: string; icon?: string }

export function EmptyState({ title, description, icon = '📋' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <span className="text-4xl">{icon}</span>
      <p className="text-slate-300 font-medium">{title}</p>
      {description && <p className="text-slate-500 text-sm max-w-xs">{description}</p>}
    </div>
  )
}

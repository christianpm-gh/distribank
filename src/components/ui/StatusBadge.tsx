type Status = 'active' | 'blocked' | 'expired' | 'cancelled' | 'completed' | 'pending' | 'failed' | 'rolled_back'

const config: Record<Status, { label: string; color: string; icon?: string }> = {
  active: { label: 'Activa', color: 'var(--color-status-success)' },
  blocked: { label: 'Bloqueada', color: 'var(--color-status-error)', icon: '🔒' },
  expired: { label: 'Vencida', color: 'var(--color-status-neutral)' },
  cancelled: { label: 'Cancelada', color: 'var(--color-status-neutral)' },
  completed: { label: 'Completada', color: 'var(--color-text-muted)' },
  pending: { label: 'En proceso', color: 'var(--color-status-warning)' },
  failed: { label: 'Fallida', color: 'var(--color-status-error)' },
  rolled_back: { label: 'Revertida', color: 'var(--color-status-rollback)' },
}

export default function StatusBadge({ status }: { status: Status }) {
  const { label, color, icon } = config[status]

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
        color,
      }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {icon && <span className="text-xs">{icon}</span>}
      {label}
    </span>
  )
}

export type { Status }

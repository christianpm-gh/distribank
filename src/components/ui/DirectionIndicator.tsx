import type { TransactionRole } from '@/types/api.types'

export default function DirectionIndicator({ role }: { role: TransactionRole }) {
  const isOutgoing = role === 'ORIGEN'
  const color = isOutgoing ? 'var(--color-status-error)' : 'var(--color-status-success)'

  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}
    >
      <span className="text-base" style={{ color }}>
        {isOutgoing ? '↑' : '↓'}
      </span>
    </div>
  )
}

import type { TransactionRole } from '@/types/api.types'
import { ArrowUp, ArrowDown } from 'lucide-react'

export default function DirectionIndicator({ role }: { role: TransactionRole }) {
  const isOutgoing = role === 'ORIGEN'
  const color = isOutgoing ? 'var(--color-status-error)' : 'var(--color-status-success)'

  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}
    >
      {isOutgoing
        ? <ArrowUp size={16} className="text-current" style={{ color }} />
        : <ArrowDown size={16} className="text-current" style={{ color }} />
      }
    </div>
  )
}

import type { TransactionType } from '@/types/api.types'

const config: Record<TransactionType, { label: string; icon: string }> = {
  TRANSFER: { label: 'Transferencia', icon: '↔' },
  PURCHASE: { label: 'Compra', icon: '🛒' },
  DEPOSIT: { label: 'Depósito', icon: '↓' },
}

export default function TransactionTypeChip({ type }: { type: TransactionType }) {
  const { label, icon } = config[type]

  return (
    <span className="inline-flex items-center gap-1 rounded-sm border border-surface-elevated px-1.5 py-0.5 text-xs text-text-secondary">
      <span>{icon}</span>
      {label}
    </span>
  )
}

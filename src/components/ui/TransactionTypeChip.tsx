import type { TransactionType } from '@/types/api.types'
import type { ReactNode } from 'react'
import { ArrowLeftRight, ShoppingCart, ArrowDownToLine } from 'lucide-react'

const config: Record<TransactionType, { label: string; icon: ReactNode }> = {
  TRANSFER: { label: 'Transferencia', icon: <ArrowLeftRight size={14} className="text-current" /> },
  PURCHASE: { label: 'Compra', icon: <ShoppingCart size={14} className="text-current" /> },
  DEPOSIT: { label: 'Depósito', icon: <ArrowDownToLine size={14} className="text-current" /> },
}

export default function TransactionTypeChip({ type }: { type: TransactionType }) {
  const { label, icon } = config[type]

  return (
    <span className="inline-flex items-center gap-1 rounded-sm border border-surface-elevated px-1.5 py-0.5 text-xs text-text-secondary">
      {icon}
      {label}
    </span>
  )
}

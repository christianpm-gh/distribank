import type { Card } from '@/types/api.types'
import { maskCardNumber, formatCurrency } from '@/lib/utils'
import StatusBadge from '@/components/ui/StatusBadge'
import { CreditCard, Lock } from 'lucide-react'

type Props = {
  card: Card
  variant?: 'list' | 'detail'
  onClick?: () => void
}

export default function PhysicalCard({ card, variant = 'list', onClick }: Props) {
  const isCredit = card.card_type === 'CREDIT'
  const gradient = isCredit
    ? 'linear-gradient(135deg, #1A1A3E, #2D2B55)'
    : 'linear-gradient(135deg, #1E293B, #273549)'

  const isBlocked = card.status === 'BLOCKED'
  const isInactive = card.status === 'EXPIRED' || card.status === 'CANCELLED'
  const statusKey = card.status.toLowerCase() as 'active' | 'blocked' | 'expired' | 'cancelled'
  const typeLabel = isCredit ? 'Crédito' : 'Débito'
  const expiry = card.expiration_date.replace('-', '/')

  if (variant === 'list') {
    return (
      <div
        onClick={onClick}
        className={`relative overflow-hidden rounded-lg p-4 ${
          onClick ? 'cursor-pointer transition-transform hover:scale-[1.01]' : ''
        } ${isInactive ? 'grayscale-[80%]' : ''}`}
        style={{ background: gradient }}
      >
        {isBlocked && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[rgba(239,68,68,0.08)]">
            <Lock size={24} className="text-status-error" />
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard size={20} className="text-text-secondary" />
            <span className="font-mono text-sm text-text-primary">
              •••• {card.card_number.slice(-4)}
            </span>
          </div>
          <StatusBadge status={statusKey} />
        </div>
        <p className="mt-1 text-xs text-text-secondary">
          {typeLabel} · Vence {expiry}
        </p>
        <p className="mt-0.5 text-xs text-text-secondary">
          Límite diario {formatCurrency(card.daily_limit)}
        </p>
      </div>
    )
  }

  // Detail variant
  return (
    <div
      className={`relative overflow-hidden rounded-xl p-6 ${isInactive ? 'grayscale-[80%]' : ''}`}
      style={{ background: gradient, filter: isBlocked ? 'saturate(40%)' : undefined }}
    >
      {isBlocked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[rgba(239,68,68,0.08)]">
          <Lock size={32} className="text-status-error" />
        </div>
      )}
      <p className="font-mono text-lg tracking-widest text-text-primary">
        {maskCardNumber(card.card_number)}
      </p>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold text-text-primary uppercase">
            NATALIA RUIZ
          </p>
          <p className="text-xs text-text-secondary">
            {typeLabel} {card.card_number.slice(-4) === '0011' || card.card_number.slice(-4) === '0018' ? 'Adicional' : 'Titular'}
          </p>
        </div>
        <p className="font-mono text-sm text-text-secondary">{expiry}</p>
      </div>
      <p className="mt-3 text-xs text-text-secondary">
        Límite diario: {formatCurrency(card.daily_limit)}
      </p>
    </div>
  )
}

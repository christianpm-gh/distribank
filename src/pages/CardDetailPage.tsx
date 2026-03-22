import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCards, useToggleCard } from '@/hooks/useCards'
import Header from '@/components/layout/Header'
import PhysicalCard from '@/components/cards/PhysicalCard'
import CardControlSwitch from '@/components/cards/CardControlSwitch'
import StatusBadge from '@/components/ui/StatusBadge'
import { maskAccountNumber, formatCurrency } from '@/lib/utils'

export default function CardDetailPage() {
  const { cardId } = useParams()
  const { data: cards } = useCards()
  const toggleMutation = useToggleCard()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const card = cards?.find((c) => c.id === Number(cardId))

  if (!card) return null

  const statusKey = card.status.toLowerCase() as 'active' | 'blocked' | 'expired' | 'cancelled'
  const typeLabel = card.card_type === 'CREDIT' ? 'Tarjeta de Crédito' : 'Tarjeta de Débito'
  const accountLabel = card.account_type === 'CREDIT' ? 'Cuenta Crédito' : 'Cuenta Débito'
  const expiry = card.expiration_date.replace('-', ' / ')

  const handleToggle = async (newStatus: 'ACTIVE' | 'BLOCKED') => {
    try {
      await toggleMutation.mutateAsync({ cardId: card.id, newStatus })
      setToast({
        message: newStatus === 'BLOCKED'
          ? 'Tarjeta bloqueada correctamente'
          : 'Tarjeta desbloqueada correctamente',
        type: 'success',
      })
    } catch {
      setToast({
        message: 'No fue posible actualizar el estado de la tarjeta. Intenta de nuevo.',
        type: 'error',
      })
    }
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="min-h-screen bg-surface-base">
      <Header title="Detalle de tarjeta" />

      <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--content-padding)]">
        {toast && (
          <div
            className={`mb-4 rounded-md px-4 py-2 text-sm ${
              toast.type === 'success'
                ? 'bg-status-success/15 text-status-success'
                : 'bg-status-error/15 text-status-error'
            }`}
          >
            {toast.message}
          </div>
        )}

        <div className="grid grid-cols-[var(--panel-xl)_1fr] gap-6">
          {/* Left column: Card visual + control */}
          <div className="space-y-5">
            <PhysicalCard card={card} variant="detail" />

            <div className="rounded-lg border border-surface-elevated bg-surface-card p-4">
              <CardControlSwitch
                card={card}
                onToggle={handleToggle}
                isLoading={toggleMutation.isPending}
              />
            </div>
          </div>

          {/* Right column: Metadata */}
          <div className="rounded-lg border border-surface-elevated bg-surface-card p-4 space-y-3 h-fit">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Tipo</span>
              <span className="text-xs text-text-primary">{typeLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Estado</span>
              <StatusBadge status={statusKey} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Vencimiento</span>
              <span className="text-xs text-text-primary">{expiry}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Límite diario</span>
              <span className="text-xs text-text-primary">{formatCurrency(card.daily_limit)} por día</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Cuenta asociada</span>
              <span className="text-xs text-text-primary">
                {accountLabel} {maskAccountNumber(card.account_number)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import type { Card } from '@/types/api.types'

type Props = {
  card: Card
  onToggle: (newStatus: 'ACTIVE' | 'BLOCKED') => Promise<void>
  isLoading?: boolean
}

export default function CardControlSwitch({ card, onToggle, isLoading = false }: Props) {
  const [showModal, setShowModal] = useState(false)

  if (card.status === 'EXPIRED' || card.status === 'CANCELLED') {
    return null
  }

  const isActive = card.status === 'ACTIVE'
  const last4 = card.card_number.slice(-4)
  const newStatus = isActive ? 'BLOCKED' : 'ACTIVE'
  const actionLabel = isActive ? 'Bloquear tarjeta' : 'Desbloquear tarjeta'
  const modalTitle = isActive
    ? `¿Bloquear tarjeta •••• ${last4}?`
    : `¿Desbloquear tarjeta •••• ${last4}?`
  const modalDescription = isActive
    ? 'La tarjeta no podrá utilizarse para ninguna transacción mientras esté bloqueada. Puedes desbloquearla en cualquier momento.'
    : 'La tarjeta quedará habilitada para realizar transacciones inmediatamente.'

  const handleConfirm = async () => {
    await onToggle(newStatus)
    setShowModal(false)
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-primary">
          {isActive ? 'Tarjeta activa' : 'Tarjeta bloqueada'}
        </span>
        <button
          onClick={() => setShowModal(true)}
          disabled={isLoading}
          className="relative h-7 w-13 rounded-full transition-colors"
          style={{
            backgroundColor: isActive ? 'var(--color-status-success)' : 'var(--color-text-muted)',
          }}
        >
          <span
            className="absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white transition-all duration-150 ease-in-out"
            style={{ left: isActive ? 'calc(100% - 25px)' : '3px' }}
          />
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative z-10 mx-4 mb-4 w-full max-w-sm rounded-xl bg-surface-elevated p-6 sm:mb-0">
            <h3 className="font-sora text-base font-semibold text-text-primary">{modalTitle}</h3>
            <p className="mt-2 text-sm text-text-secondary">{modalDescription}</p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-md border border-surface-elevated px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-card"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors ${
                  isActive
                    ? 'bg-status-error hover:bg-status-error/80'
                    : 'bg-brand-primary hover:bg-brand-primary/80'
                } disabled:opacity-50`}
              >
                {isLoading ? 'Procesando...' : actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

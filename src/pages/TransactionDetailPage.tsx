import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useTransactionDetail } from '@/hooks/useTransactions'
import Header from '@/components/layout/Header'
import SignedAmount from '@/components/ui/SignedAmount'
import StatusBadge from '@/components/ui/StatusBadge'
import TransactionTypeChip from '@/components/ui/TransactionTypeChip'
import TransactionTimeline from '@/components/transactions/TransactionTimeline'
import { maskAccountNumber, maskCardNumber, formatDate } from '@/lib/utils'
import { Copy, ChevronLeft, ChevronRight } from 'lucide-react'

type NavState = {
  fromAllTransactions?: boolean
  uuids?: string[]
}

export default function TransactionDetailPage() {
  const { uuid } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const navState = location.state as NavState | null
  const { data, isLoading } = useTransactionDetail(uuid ?? '')

  const hasNav = navState?.fromAllTransactions && navState.uuids && navState.uuids.length > 1
  const currentIndex = hasNav ? navState.uuids!.indexOf(uuid ?? '') : -1
  const hasPrev = hasNav && currentIndex > 0
  const hasNext = hasNav && currentIndex < navState.uuids!.length - 1

  const goTo = (index: number) => {
    if (!navState?.uuids) return
    navigate(`/transactions/${navState.uuids[index]}`, {
      state: { fromAllTransactions: true, uuids: navState.uuids },
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-base">
        <Header title="Detalle de movimiento" />
        <div className="mx-auto max-w-2xl space-y-4 px-[var(--content-padding)]">
          <div className="h-32 animate-pulse rounded-lg bg-surface-card" />
        </div>
      </div>
    )
  }

  if (!data) return null

  const { transaction: tx, from_account, to_account, card, log_events } = data
  const statusKey = tx.status.toLowerCase() as 'completed' | 'pending' | 'failed' | 'rolled_back'
  const showTimeline = tx.status !== 'COMPLETED' && log_events.length > 0

  const copyUuid = () => {
    navigator.clipboard.writeText(tx.transaction_uuid)
  }

  const handleBack = () => {
    if (navState?.fromAllTransactions) {
      navigate('/transactions')
    } else {
      navigate(-1)
    }
  }

  return (
    <div className="min-h-screen bg-surface-base pb-6">
      <Header title="Detalle de movimiento" onBack={handleBack} />

      <div className="mx-auto max-w-2xl space-y-5 px-[var(--content-padding)]">
        {/* Row 1: Amount + Status badge + nav arrows */}
        <div className="text-center">
          <SignedAmount amount={tx.amount} role={tx.rol_cuenta} size="lg" showCurrency />
          <div className="mt-2 flex items-center justify-center gap-3">
            {hasPrev ? (
              <button
                onClick={() => goTo(currentIndex - 1)}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-text-secondary hover:bg-surface-elevated hover:text-text-primary transition-colors"
              >
                <ChevronLeft size={14} className="text-current" />
                <span className="hidden md:inline">Anterior</span>
                <span className="md:hidden">Ant.</span>
              </button>
            ) : hasNav ? <span className="w-16" /> : null}

            <StatusBadge status={statusKey} />

            {hasNext ? (
              <button
                onClick={() => goTo(currentIndex + 1)}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-text-secondary hover:bg-surface-elevated hover:text-text-primary transition-colors"
              >
                <span className="hidden md:inline">Siguiente</span>
                <span className="md:hidden">Sig.</span>
                <ChevronRight size={14} className="text-current" />
              </button>
            ) : hasNav ? <span className="w-16" /> : null}
          </div>
        </div>

        {/* Row 2: Metadata card */}
        <div className="rounded-lg border border-surface-elevated bg-surface-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">UUID</span>
            <button onClick={copyUuid} className="flex items-center gap-1 font-mono text-xs text-text-muted hover:text-text-primary">
              {tx.transaction_uuid.slice(0, 8)}...{tx.transaction_uuid.slice(-4)}
              <Copy size={16} className="text-current" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">Tipo</span>
            <TransactionTypeChip type={tx.transaction_type} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">Cuenta origen</span>
            <span className="text-xs text-text-primary">{maskAccountNumber(from_account.account_number)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">Cuenta destino</span>
            <span className="text-xs text-text-primary">{maskAccountNumber(to_account.account_number)}</span>
          </div>
          {card && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Tarjeta utilizada</span>
              <span className="text-xs text-text-primary">Pago con tarjeta {maskCardNumber(card.card_number).slice(-9)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">Fecha de inicio</span>
            <span className="text-xs text-text-primary">{formatDate(tx.initiated_at)}</span>
          </div>
          {tx.completed_at && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Fecha de completado</span>
              <span className="text-xs text-text-primary">{formatDate(tx.completed_at)}</span>
            </div>
          )}
        </div>

        {/* Row 3: Timeline */}
        {showTimeline && (
          <div className="rounded-lg border border-surface-elevated bg-surface-card p-4">
            <TransactionTimeline events={log_events} />
          </div>
        )}
      </div>
    </div>
  )
}

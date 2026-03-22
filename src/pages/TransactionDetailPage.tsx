import { useParams } from 'react-router-dom'
import { useTransactionDetail } from '@/hooks/useTransactions'
import Header from '@/components/layout/Header'
import SignedAmount from '@/components/ui/SignedAmount'
import StatusBadge from '@/components/ui/StatusBadge'
import TransactionTypeChip from '@/components/ui/TransactionTypeChip'
import TransactionTimeline from '@/components/transactions/TransactionTimeline'
import { maskAccountNumber, maskCardNumber, formatDate } from '@/lib/utils'
import { Copy } from 'lucide-react'

export default function TransactionDetailPage() {
  const { uuid } = useParams()
  const { data, isLoading } = useTransactionDetail(uuid ?? '')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-base">
        <Header title="Detalle de movimiento" />
        <div className="space-y-4 px-4">
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

  return (
    <div className="min-h-screen bg-surface-base pb-6">
      <Header title="Detalle de movimiento" />

      <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--content-padding)]">
        {showTimeline ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
            {/* Left column: Timeline */}
            <div className="rounded-lg border border-surface-elevated bg-surface-card p-4">
              <TransactionTimeline events={log_events} />
            </div>

            {/* Right column: Metadata */}
            <div className="space-y-5">
              <div className="text-center">
                <SignedAmount amount={tx.amount} role={tx.rol_cuenta} size="lg" showCurrency />
                <div className="mt-2">
                  <StatusBadge status={statusKey} />
                </div>
              </div>

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
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-5">
            <div className="text-center">
              <SignedAmount amount={tx.amount} role={tx.rol_cuenta} size="lg" showCurrency />
              <div className="mt-2">
                <StatusBadge status={statusKey} />
              </div>
            </div>

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
          </div>
        )}
      </div>
    </div>
  )
}

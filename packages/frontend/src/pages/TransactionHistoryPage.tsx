import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTransactions } from '@/hooks/useTransactions'
import Header from '@/components/layout/Header'
import TransactionRow from '@/components/transactions/TransactionRow'
import type { TransactionStatus } from '@/types/api.types'

const filters: { label: string; value: TransactionStatus | 'ALL' }[] = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Completadas', value: 'COMPLETED' },
  { label: 'Pendientes', value: 'PENDING' },
  { label: 'Fallidas', value: 'FAILED' },
]

export default function TransactionHistoryPage() {
  const { accountId } = useParams()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<TransactionStatus | 'ALL'>('ALL')
  const { data: transactions, isLoading } = useTransactions(Number(accountId))

  const filtered = filter === 'ALL'
    ? transactions
    : transactions?.filter((tx) => tx.status === filter)

  return (
    <div className="min-h-screen bg-surface-base">
      <Header title="Historial de movimientos" />

      <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--content-padding)]">
        <div className="mb-4 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs transition-colors ${
                filter === f.value
                  ? 'bg-brand-primary text-white'
                  : 'bg-surface-card text-text-secondary hover:bg-surface-elevated'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-card" />
            ))}
          </div>
        )}

        {filtered && filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-text-muted">
            Esta cuenta no tiene movimientos registrados aún.
          </p>
        )}

        {/* Desktop: table */}
        {filtered && filtered.length > 0 && (
          <div className="hidden md:block overflow-hidden rounded-lg border border-surface-elevated">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-elevated bg-surface-card text-left text-xs font-medium text-text-secondary">
                  <th className="px-4 py-3 w-12"></th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3 text-right">Monto</th>
                  <th className="px-4 py-3 text-right">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => (
                  <TransactionRow
                    key={tx.id}
                    transaction={tx}
                    variant="table-row"
                    onClick={() => navigate(`/transactions/${tx.transaction_uuid}`)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile: card stack */}
        {filtered && filtered.length > 0 && (
          <div className="md:hidden space-y-3">
            {filtered.map((tx) => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                variant="card"
                onClick={() => navigate(`/transactions/${tx.transaction_uuid}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

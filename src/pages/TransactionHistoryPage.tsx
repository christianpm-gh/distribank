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
  const [showFilter, setShowFilter] = useState(false)
  const { data: transactions, isLoading } = useTransactions(Number(accountId))

  const filtered = filter === 'ALL'
    ? transactions
    : transactions?.filter((tx) => tx.status === filter)

  return (
    <div className="min-h-screen bg-surface-base">
      <Header
        title="Historial de movimientos"
        variant="with-back-action"
        actionLabel="Filtrar"
        onAction={() => setShowFilter(!showFilter)}
      />

      {showFilter && (
        <div className="flex gap-2 overflow-x-auto px-4 pb-2">
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
      )}

      <main>
        {isLoading && (
          <div className="space-y-2 px-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-card" />
            ))}
          </div>
        )}

        {filtered && filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-text-muted">
            Esta cuenta no tiene movimientos registrados aún.
          </p>
        )}

        {filtered?.map((tx) => (
          <TransactionRow
            key={tx.id}
            transaction={tx}
            size="full"
            onClick={() => navigate(`/transactions/${tx.transaction_uuid}`)}
          />
        ))}
      </main>
    </div>
  )
}

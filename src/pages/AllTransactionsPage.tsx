import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '@/hooks/useAccounts'
import { useTransactions } from '@/hooks/useTransactions'
import Header from '@/components/layout/Header'
import TransactionRow from '@/components/transactions/TransactionRow'
import type { TransactionStatus, AccountType } from '@/types/api.types'

const filters: { label: string; value: TransactionStatus | 'ALL' }[] = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Completadas', value: 'COMPLETED' },
  { label: 'Pendientes', value: 'PENDING' },
  { label: 'Fallidas', value: 'FAILED' },
]

export default function AllTransactionsPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<TransactionStatus | 'ALL'>('ALL')
  const { data: profile } = useProfile()

  const checking = profile?.accounts.find((a) => a.account_type === 'CHECKING')
  const credit = profile?.accounts.find((a) => a.account_type === 'CREDIT')

  const { data: debitTx, isLoading: loadingDebit } = useTransactions(checking?.id ?? 0)
  const { data: creditTx, isLoading: loadingCredit } = useTransactions(credit?.id ?? 0)

  const isLoading = loadingDebit || loadingCredit

  const allTransactions = [
    ...(debitTx ?? []).map((tx) => ({ ...tx, _accountType: 'CHECKING' as AccountType })),
    ...(creditTx ?? []).map((tx) => ({ ...tx, _accountType: 'CREDIT' as AccountType })),
  ].sort((a, b) => new Date(b.initiated_at).getTime() - new Date(a.initiated_at).getTime())

  const filtered = filter === 'ALL'
    ? allTransactions
    : allTransactions.filter((tx) => tx.status === filter)

  return (
    <div className="min-h-screen bg-surface-base">
      <Header title="Todos los movimientos" />

      <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--content-padding)]">
        <div className="mb-4 flex gap-2">
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

        {!isLoading && filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-text-muted">
            No hay movimientos registrados.
          </p>
        )}

        {/* Desktop: table */}
        {filtered.length > 0 && (
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
                  <th className="px-4 py-3">Cuenta</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => (
                  <TransactionRow
                    key={`${tx._accountType}-${tx.id}`}
                    transaction={tx}
                    variant="table-row"
                    sourceAccountType={tx._accountType}
                    onClick={() => navigate(`/transactions/${tx.transaction_uuid}`, { state: { fromAllTransactions: true, uuids: filtered.map(t => t.transaction_uuid) } })}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile: cards */}
        {filtered.length > 0 && (
          <div className="md:hidden space-y-3">
            {filtered.map((tx) => (
              <TransactionRow
                key={`${tx._accountType}-${tx.id}`}
                transaction={tx}
                variant="card"
                sourceAccountType={tx._accountType}
                onClick={() => navigate(`/transactions/${tx.transaction_uuid}`, { state: { fromAllTransactions: true, uuids: filtered.map(t => t.transaction_uuid) } })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

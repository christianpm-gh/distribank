import { useNavigate } from 'react-router-dom'
import { useProfile } from '@/hooks/useAccounts'
import { useTransactions } from '@/hooks/useTransactions'
import Header from '@/components/layout/Header'
import AccountCard from '@/components/cards/AccountCard'
import TransactionRow from '@/components/transactions/TransactionRow'
import { formatDate } from '@/lib/utils'

export default function AccountDebitPage() {
  const navigate = useNavigate()
  const { data: profile } = useProfile()
  const account = profile?.accounts.find((a) => a.account_type === 'CHECKING')
  const { data: transactions } = useTransactions(account?.id ?? 0)

  if (!account) return null

  const recent = transactions?.slice(0, 5) ?? []

  return (
    <div className="min-h-screen bg-surface-base">
      <Header title="Cuenta Débito" />

      <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--content-padding)]">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[var(--panel-lg)_1fr]">
          {/* Left column: Account info */}
          <div className="space-y-5">
            <AccountCard account={account} size="compact" />

            <div className="space-y-2">
              <p className="font-mono text-xs text-text-muted">{account.account_number}</p>
              <p className="text-xs text-text-secondary">
                Abierta el {formatDate(account.created_at)}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/accounts/${account.id}/transactions`)}
                className="flex-1 rounded-md bg-surface-card px-3 py-2 text-sm text-text-primary transition-colors hover:bg-surface-elevated"
              >
                Ver movimientos
              </button>
              <button
                onClick={() => navigate('/transfer', { state: { fromAccountId: account.id } })}
                className="flex-1 rounded-md bg-brand-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-primary/80"
              >
                Transferir
              </button>
            </div>

            <button
              onClick={() => navigate('/cards')}
              className="text-sm text-brand-primary hover:underline"
            >
              Gestionar tarjetas
            </button>
          </div>

          {/* Right column: Recent transactions */}
          <div className="rounded-lg border border-surface-elevated bg-surface-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-sora text-sm font-semibold text-text-primary">
                Movimientos recientes
              </h2>
              <button
                onClick={() => navigate(`/accounts/${account.id}/transactions`)}
                className="text-xs text-brand-primary"
              >
                Ver todos
              </button>
            </div>
            {recent.length > 0 ? (
              <div className="divide-y divide-surface-elevated">
                {recent.map((tx) => (
                  <TransactionRow
                    key={tx.id}
                    transaction={tx}
                    size="compact"
                    onClick={() => navigate(`/transactions/${tx.transaction_uuid}`)}
                  />
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-text-muted">
                Sin movimientos registrados
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

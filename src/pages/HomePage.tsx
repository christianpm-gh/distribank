import { useNavigate } from 'react-router-dom'
import { useProfile } from '@/hooks/useAccounts'
import { useTransactions } from '@/hooks/useTransactions'
import AccountCard from '@/components/cards/AccountCard'
import TransactionRow from '@/components/transactions/TransactionRow'
import { ArrowLeftRight, CreditCard } from 'lucide-react'

export default function HomePage() {
  const navigate = useNavigate()
  const { data, isLoading } = useProfile()

  const checking = data?.accounts.find((a) => a.account_type === 'CHECKING')
  const credit = data?.accounts.find((a) => a.account_type === 'CREDIT')

  const { data: debitTx } = useTransactions(checking?.id ?? 0)
  const { data: creditTx } = useTransactions(credit?.id ?? 0)

  const recentActivity = [
    ...(debitTx?.slice(0, 3) ?? []),
    ...(creditTx?.slice(0, 3) ?? []),
  ]
    .sort((a, b) => new Date(b.initiated_at).getTime() - new Date(a.initiated_at).getTime())
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-surface-base">
      <div className="mx-auto max-w-[var(--content-max-width)] p-[var(--content-padding)]">
        <h1 className="mb-6 font-sora text-xl font-semibold text-text-primary">Panel principal</h1>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[var(--panel-md)_1fr] xl:grid-cols-[var(--panel-md)_1fr_var(--panel-sm)]">
            <div className="space-y-4">
              <div className="h-44 animate-pulse rounded-lg bg-surface-card" />
              <div className="h-44 animate-pulse rounded-lg bg-surface-card" />
            </div>
            <div className="h-64 animate-pulse rounded-lg bg-surface-card" />
            <div className="h-40 animate-pulse rounded-lg bg-surface-card" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[var(--panel-md)_1fr] xl:grid-cols-[var(--panel-md)_1fr_var(--panel-sm)]">
            {/* Column 1: Account cards */}
            <div className="space-y-4">
              {checking && (
                <AccountCard
                  account={checking}
                  size="full"
                  onClick={() => navigate('/accounts/debit')}
                />
              )}
              {credit && (
                <AccountCard
                  account={credit}
                  size="full"
                  onClick={() => navigate('/accounts/credit')}
                />
              )}
            </div>

            {/* Column 2: Recent activity */}
            <div className="rounded-lg border border-surface-elevated bg-surface-card p-4">
              <h2 className="mb-3 font-sora text-sm font-semibold text-text-primary">
                Actividad reciente
              </h2>
              {recentActivity.length > 0 ? (
                <div className="divide-y divide-surface-elevated">
                  {recentActivity.map((tx) => (
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
                  Sin movimientos recientes
                </p>
              )}
            </div>

            {/* Column 3: Quick actions */}
            <div className="space-y-3">
              <h2 className="font-sora text-sm font-semibold text-text-primary">
                Acciones rápidas
              </h2>
              <button
                onClick={() => navigate('/transfer')}
                className="flex w-full items-center gap-3 rounded-lg bg-brand-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-primary/80"
              >
                <ArrowLeftRight size={20} className="text-current" />
                Nueva transferencia
              </button>
              <button
                onClick={() => navigate('/cards')}
                className="flex w-full items-center gap-3 rounded-lg border border-surface-elevated bg-surface-card px-4 py-3 text-sm text-text-primary transition-colors hover:bg-surface-elevated"
              >
                <CreditCard size={20} className="text-current" />
                Gestionar tarjetas
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

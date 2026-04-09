import { useNavigate } from 'react-router-dom'
import { useProfile } from '@/hooks/useAccounts'
import { useTransactions } from '@/hooks/useTransactions'
import AccountCard from '@/components/cards/AccountCard'
import TransactionRow from '@/components/transactions/TransactionRow'
import { ArrowLeftRight, CreditCard } from 'lucide-react'
import type { AccountType } from '@/types/api.types'

export default function HomePage() {
  const navigate = useNavigate()
  const { data, isLoading } = useProfile()

  const checking = data?.accounts.find((a) => a.account_type === 'CHECKING')
  const credit = data?.accounts.find((a) => a.account_type === 'CREDIT')

  const { data: debitTx } = useTransactions(checking?.id ?? 0)
  const { data: creditTx } = useTransactions(credit?.id ?? 0)

  const recentActivity = [
    ...(debitTx?.slice(0, 3) ?? []).map((tx) => ({ ...tx, _accountType: 'CHECKING' as AccountType })),
    ...(creditTx?.slice(0, 3) ?? []).map((tx) => ({ ...tx, _accountType: 'CREDIT' as AccountType })),
  ]
    .sort((a, b) => new Date(b.initiated_at).getTime() - new Date(a.initiated_at).getTime())
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-surface-base">
      <div className="mx-auto max-w-[var(--content-max-width)] p-[var(--content-padding)]">
        <h1 className="mb-4 font-sora text-xl font-semibold text-text-primary">Panel principal</h1>

        {/* Quick actions — always first on mobile */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row">
          <button
            onClick={() => navigate('/transfer')}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-primary/80"
          >
            <ArrowLeftRight size={18} className="text-current" />
            Nueva transferencia
          </button>
          <button
            onClick={() => navigate('/cards')}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-surface-elevated bg-surface-card px-4 py-3 text-sm text-text-primary transition-colors hover:bg-surface-elevated"
          >
            <CreditCard size={18} className="text-current" />
            Gestionar tarjetas
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className="h-44 animate-pulse rounded-lg bg-surface-card" />
              <div className="h-44 animate-pulse rounded-lg bg-surface-card" />
            </div>
            <div className="h-64 animate-pulse rounded-lg bg-surface-card" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Row 1: Account cards side by side on desktop */}
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
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

            {/* Row 2: Recent activity full width with AccountTypeBadge */}
            <div className="rounded-lg border border-surface-elevated bg-surface-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-sora text-sm font-semibold text-text-primary">
                  Actividad reciente
                </h2>
                <button
                  onClick={() => navigate('/transactions')}
                  className="text-xs text-brand-primary hover:underline"
                >
                  Ver todos
                </button>
              </div>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((tx) => (
                    <TransactionRow
                      key={tx.id}
                      transaction={tx}
                      variant="card"
                      sourceAccountType={tx._accountType}
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
          </div>
        )}
      </div>
    </div>
  )
}

import type { Account } from '@/types/api.types'
import { formatCurrency, maskAccountNumber } from '@/lib/utils'
import StatusBadge from '@/components/ui/StatusBadge'
import VIPBadge from '@/components/ui/VIPBadge'
import CreditUsageBar from './CreditUsageBar'

type Props = {
  account: Account
  size?: 'full' | 'compact'
  onClick?: () => void
}

export default function AccountCard({ account, size = 'full', onClick }: Props) {
  const isCredit = account.account_type === 'CREDIT'
  const label = isCredit ? 'Cuenta Crédito' : 'Cuenta Débito'
  const masked = maskAccountNumber(account.account_number)
  const statusKey = account.status.toLowerCase() as 'active' | 'inactive' | 'frozen' | 'closed'

  return (
    <div
      onClick={onClick}
      className={`max-w-sm rounded-lg border border-surface-elevated bg-surface-card shadow-[0_4px_24px_rgba(0,0,0,0.3)] transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 ${
        size === 'full' ? 'p-6' : 'p-4'
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="font-sora text-base font-semibold text-text-primary">{label}</span>
        <StatusBadge status={statusKey} />
      </div>

      <p className="mt-1 text-xs text-text-muted">{masked}</p>

      {isCredit ? (
        <>
          <p className={`mt-3 ${size === 'full' ? 'font-sora text-3xl font-bold' : 'font-sora text-xl font-bold'} text-text-primary`}>
            {formatCurrency(Math.abs(account.balance))}
            <span className="ml-1 text-sm font-normal text-text-secondary">adeudados</span>
          </p>
          {size === 'full' && account.credit_limit && account.available_credit !== undefined && (
            <div className="mt-3">
              <CreditUsageBar
                creditLimit={account.credit_limit}
                availableCredit={account.available_credit}
              />
            </div>
          )}
        </>
      ) : (
        <>
          <p className={`mt-3 ${size === 'full' ? 'font-sora text-3xl font-bold' : 'font-sora text-xl font-bold'} text-text-primary`}>
            {formatCurrency(account.balance)}
          </p>
          {account.overdraft_limit && (
            <p className="mt-1 text-xs text-text-secondary">
              Sobregiro hasta {formatCurrency(account.overdraft_limit)}
            </p>
          )}
        </>
      )}

      <div className="mt-3">
        <VIPBadge weekTransactions={account.week_transactions} />
      </div>
    </div>
  )
}

import type { AccountType } from '@/types/api.types'
import { Wallet, CreditCard } from 'lucide-react'

export default function AccountTypeBadge({ accountType }: { accountType: AccountType }) {
  const isCredit = accountType === 'CREDIT'

  return (
    <span
      className="inline-flex min-w-[70px] items-center justify-center gap-1 rounded-sm px-1.5 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: isCredit
          ? 'color-mix(in srgb, var(--color-brand-accent) 15%, transparent)'
          : 'color-mix(in srgb, var(--color-brand-primary) 15%, transparent)',
        color: isCredit ? 'var(--color-brand-accent)' : 'var(--color-brand-primary)',
      }}
    >
      {isCredit
        ? <CreditCard size={12} className="text-current" />
        : <Wallet size={12} className="text-current" />
      }
      {isCredit ? 'Crédito' : 'Débito'}
    </span>
  )
}

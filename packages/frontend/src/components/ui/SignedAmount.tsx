import type { TransactionRole } from '@/types/api.types'
import { formatCurrency } from '@/lib/utils'

type Props = {
  amount: number
  role?: TransactionRole
  size?: 'sm' | 'lg'
  showCurrency?: boolean
}

export default function SignedAmount({ amount, role, size = 'sm', showCurrency = false }: Props) {
  let prefix = ''
  let color = 'var(--color-text-primary)'

  if (role === 'ORIGEN') {
    prefix = '−'
    color = 'var(--color-status-error)'
  } else if (role === 'DESTINO') {
    prefix = '+'
    color = 'var(--color-status-success)'
  }

  const formatted = formatCurrency(amount)
  const display = `${prefix}${showCurrency ? 'MXN ' : ''}${formatted}`

  return (
    <span
      className={size === 'lg' ? 'font-sora text-3xl font-bold' : 'text-sm font-medium'}
      style={{ color }}
    >
      {display}
    </span>
  )
}

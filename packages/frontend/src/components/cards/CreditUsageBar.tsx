import { formatCurrency } from '@/lib/utils'

type Props = {
  creditLimit: number
  availableCredit: number
}

export default function CreditUsageBar({ creditLimit, availableCredit }: Props) {
  const used = creditLimit - availableCredit
  const percentage = Math.round((used / creditLimit) * 100)

  let barColor = 'var(--color-credit-used)'
  if (percentage >= 80) barColor = 'var(--color-status-error)'
  else if (percentage >= 60) barColor = 'var(--color-status-warning)'

  return (
    <div className="space-y-1">
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-credit-available">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${percentage}%`, backgroundColor: barColor }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-secondary">
          {formatCurrency(availableCredit)} disponibles de {formatCurrency(creditLimit)}
        </span>
        <span className="text-xs text-text-secondary">{percentage}%</span>
      </div>
    </div>
  )
}

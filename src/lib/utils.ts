export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(Math.abs(amount))
    .replace('$', '$')
}

export function maskAccountNumber(accountNumber: string): string {
  const last4 = accountNumber.slice(-4)
  return `•••• ${last4}`
}

export function maskCardNumber(cardNumber: string): string {
  const last4 = cardNumber.slice(-4)
  return `•••• •••• •••• ${last4}`
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const months = [
    'ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
  ]
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays} días`
  return formatDate(dateStr)
}

export function getFirstName(fullName: string): string {
  return fullName.split(' ')[0]
}

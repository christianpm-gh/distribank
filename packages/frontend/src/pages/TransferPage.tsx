import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useProfile } from '@/hooks/useAccounts'
import Header from '@/components/layout/Header'
import { formatCurrency } from '@/lib/utils'
import type { Account } from '@/types/api.types'

export default function TransferPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { data: profile } = useProfile()
  const preselectedId = (location.state as { fromAccountId?: number })?.fromAccountId

  const activeAccounts = profile?.accounts.filter((a) => a.status === 'ACTIVE') ?? []
  const [fromAccountId, setFromAccountId] = useState<number>(
    preselectedId ?? activeAccounts[0]?.id ?? 0,
  )
  const [toAccount, setToAccount] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const selectedAccount = activeAccounts.find((a) => a.id === fromAccountId)

  const getMaxAmount = (account: Account) => {
    if (account.account_type === 'CHECKING') {
      return account.balance + (account.overdraft_limit ?? 0)
    }
    return account.available_credit ?? 0
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!fromAccountId) errs.from = 'Selecciona una cuenta de origen'
    if (!toAccount) errs.to = 'Ingresa la cuenta destino'
    else if (!/^DIST(CHK|CRD)\d{10}$/.test(toAccount)) errs.to = 'Formato inválido (DISTCHK/DISTCRD + 10 dígitos)'
    if (!amount || Number(amount) <= 0) errs.amount = 'Ingresa un monto válido'
    else if (selectedAccount && Number(amount) > getMaxAmount(selectedAccount)) {
      if (selectedAccount.account_type === 'CHECKING') {
        errs.amount = `Saldo insuficiente. Tienes ${formatCurrency(selectedAccount.balance)} + ${formatCurrency(selectedAccount.overdraft_limit ?? 0)} de sobregiro disponible.`
      } else {
        errs.amount = `Crédito insuficiente. Tienes ${formatCurrency(selectedAccount.available_credit ?? 0)} disponibles en tu línea de crédito.`
      }
    }
    if (description.length > 100) errs.description = 'Máximo 100 caracteres'
    return errs
  }

  const handleContinue = () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    navigate('/transfer/confirm', {
      state: {
        fromAccountId,
        toAccount,
        amount: Number(amount),
        description: description || undefined,
        fromAccountData: selectedAccount,
      },
    })
  }

  return (
    <div className="min-h-screen bg-surface-base">
      <Header title="Nueva transferencia" />

      <main className="mx-auto max-w-[640px] space-y-4 p-[var(--content-padding)]">
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">
            Cuenta de origen
          </label>
          <select
            value={fromAccountId}
            onChange={(e) => setFromAccountId(Number(e.target.value))}
            className="w-full rounded-md border border-surface-elevated bg-surface-card px-3 py-2 text-sm text-text-primary focus:border-brand-primary focus:outline-none"
          >
            {activeAccounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.account_type === 'CHECKING' ? 'Débito' : 'Crédito'} ••••{' '}
                {acc.account_number.slice(-4)} — {formatCurrency(acc.balance)}
              </option>
            ))}
          </select>
          {selectedAccount && (
            <p className="mt-1 text-xs text-text-muted">
              Disponible: {formatCurrency(getMaxAmount(selectedAccount))}
            </p>
          )}
          {errors.from && <p className="mt-1 text-xs text-status-error">{errors.from}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">
            Cuenta destino
          </label>
          <input
            type="text"
            value={toAccount}
            onChange={(e) => setToAccount(e.target.value.toUpperCase())}
            placeholder="DISTCHK0000000018"
            className="w-full rounded-md border border-surface-elevated bg-surface-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none"
          />
          {errors.to && <p className="mt-1 text-xs text-status-error">{errors.to}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">Monto</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full rounded-md border border-surface-elevated bg-surface-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none"
          />
          {errors.amount && <p className="mt-1 text-xs text-status-error">{errors.amount}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">
            Concepto (opcional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción de la transferencia"
            maxLength={100}
            className="w-full rounded-md border border-surface-elevated bg-surface-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-status-error">{errors.description}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 rounded-md border border-surface-elevated px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-surface-card"
          >
            Cancelar
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 rounded-md bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary/80"
          >
            Continuar
          </button>
        </div>
      </main>
    </div>
  )
}

import { useNavigate, useLocation } from 'react-router-dom'
import { useTransfer } from '@/hooks/useTransfer'
import Header from '@/components/layout/Header'
import SignedAmount from '@/components/ui/SignedAmount'
import { maskAccountNumber } from '@/lib/utils'
import type { Account } from '@/types/api.types'

type TransferState = {
  fromAccountId: number
  toAccount: string
  amount: number
  description?: string
  fromAccountData: Account
}

export default function TransferConfirmPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as TransferState | null
  const transferMutation = useTransfer()

  if (!state) {
    navigate('/transfer')
    return null
  }

  const { fromAccountId, toAccount, amount, description, fromAccountData } = state
  const fromLabel = fromAccountData.account_type === 'CHECKING' ? 'Cuenta Débito' : 'Cuenta Crédito'

  const handleConfirm = () => {
    const transactionUuid = crypto.randomUUID()
    transferMutation.mutate(
      {
        transaction_uuid: transactionUuid,
        from_account_id: fromAccountId,
        to_account_number: toAccount,
        amount,
        description,
      },
      {
        onSuccess: (response) => {
          navigate('/transfer/result', {
            state: {
              status: response.status,
              transaction_uuid: response.transaction_uuid,
              initiated_at: response.initiated_at,
              amount,
              toAccount,
              fromAccountId,
              description,
            },
            replace: true,
          })
        },
        onError: () => {
          navigate('/transfer/result', {
            state: {
              status: 'FAILED',
              transaction_uuid: crypto.randomUUID(),
              initiated_at: new Date().toISOString(),
              amount,
              toAccount,
              fromAccountId,
              description,
            },
            replace: true,
          })
        },
      },
    )
  }

  return (
    <div className="min-h-screen bg-surface-base">
      <Header title="Confirmar transferencia" />

      <main className="mx-auto max-w-[640px] space-y-5 p-[var(--content-padding)]">
        <div className="text-center">
          <SignedAmount amount={amount} size="lg" />
        </div>

        <div className="rounded-lg border border-surface-elevated bg-surface-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">De</span>
            <span className="text-xs text-text-primary">
              {fromLabel} {maskAccountNumber(fromAccountData.account_number)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">Para</span>
            <span className="font-mono text-xs text-text-primary">{toAccount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">Concepto</span>
            <span className="text-xs text-text-primary">{description || 'Sin concepto'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">Fecha estimada</span>
            <span className="text-xs text-text-primary">
              Hoy, {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => navigate('/transfer', { state: { fromAccountId, toAccount, amount, description } })}
            disabled={transferMutation.isPending}
            className="flex-1 rounded-md border border-surface-elevated px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-surface-card"
          >
            Editar
          </button>
          <button
            onClick={handleConfirm}
            disabled={transferMutation.isPending}
            className="flex-1 rounded-md bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary/80 disabled:opacity-50"
          >
            {transferMutation.isPending ? 'Procesando...' : 'Confirmar y transferir'}
          </button>
        </div>
      </main>
    </div>
  )
}

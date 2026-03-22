import type { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import SignedAmount from '@/components/ui/SignedAmount'
import type { TransactionStatus } from '@/types/api.types'
import { Check, Clock, X, RotateCcw, Copy } from 'lucide-react'

type ResultState = {
  status: TransactionStatus
  transaction_uuid: string
  initiated_at: string
  amount: number
  toAccount: string
  fromAccountId: number
  description?: string
}

const statusConfig: Record<TransactionStatus, {
  icon: ReactNode
  title: string
  description: string
  color: string
}> = {
  COMPLETED: {
    icon: <Check size={32} className="text-current" />,
    title: 'Transferencia exitosa',
    description: 'Tu operación ha sido completada.',
    color: 'var(--color-status-success)',
  },
  PENDING: {
    icon: <Clock size={32} className="text-current" />,
    title: 'Transferencia en proceso',
    description: 'Tu operación está siendo procesada. Recibirás confirmación en breve.',
    color: 'var(--color-status-warning)',
  },
  FAILED: {
    icon: <X size={32} className="text-current" />,
    title: 'No se pudo completar la transferencia',
    description: 'Ocurrió un error al procesar tu operación. Intenta de nuevo.',
    color: 'var(--color-status-error)',
  },
  ROLLED_BACK: {
    icon: <RotateCcw size={32} className="text-current" />,
    title: 'Transferencia revertida',
    description: 'La operación no pudo completarse y el monto fue restaurado a tu cuenta.',
    color: 'var(--color-status-rollback)',
  },
}

export default function TransferResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as ResultState | null

  if (!state) {
    navigate('/')
    return null
  }

  const { status, transaction_uuid, amount, fromAccountId, description } = state
  const cfg = statusConfig[status]

  const copyUuid = () => {
    navigator.clipboard.writeText(transaction_uuid)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-base px-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="flex h-20 w-20 items-center justify-center rounded-full"
        style={{ backgroundColor: `color-mix(in srgb, ${cfg.color} 15%, transparent)`, color: cfg.color }}
      >
        {cfg.icon}
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4 font-sora text-xl font-bold text-text-primary"
      >
        {cfg.title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-2 max-w-xs text-center text-sm text-text-secondary"
      >
        {cfg.description}
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6"
      >
        <SignedAmount amount={amount} size="lg" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4"
      >
        <button
          onClick={copyUuid}
          className="flex items-center gap-1 font-mono text-xs text-text-muted hover:text-text-primary"
        >
          {transaction_uuid.slice(0, 8)}...{transaction_uuid.slice(-4)}
          <Copy size={16} className="text-current" />
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 flex w-full max-w-xs flex-col gap-2"
      >
        <button
          onClick={() => navigate('/')}
          className="w-full rounded-md bg-brand-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary/80"
        >
          Ir al inicio
        </button>

        {(status === 'COMPLETED' || status === 'PENDING' || status === 'ROLLED_BACK') && (
          <button
            onClick={() => navigate(`/transactions/${transaction_uuid}`)}
            className="w-full rounded-md border border-surface-elevated py-2.5 text-sm text-text-secondary transition-colors hover:bg-surface-card"
          >
            Ver detalle
          </button>
        )}

        {status === 'FAILED' && (
          <button
            onClick={() =>
              navigate('/transfer', {
                state: { fromAccountId, description },
              })
            }
            className="w-full rounded-md border border-surface-elevated py-2.5 text-sm text-text-secondary transition-colors hover:bg-surface-card"
          >
            Intentar de nuevo
          </button>
        )}
      </motion.div>
    </div>
  )
}

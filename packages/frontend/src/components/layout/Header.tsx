import { useNavigate } from 'react-router-dom'
import { ArrowLeft, X } from 'lucide-react'

type Props = {
  title?: string
  variant?: 'with-back' | 'with-back-action' | 'modal'
  onBack?: () => void
  onAction?: () => void
  actionLabel?: string
  onClose?: () => void
}

export default function Header({ title, variant = 'with-back', onBack, onAction, actionLabel, onClose }: Props) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) onBack()
    else navigate(-1)
  }

  if (variant === 'modal') {
    return (
      <header className="flex h-14 items-center justify-end px-4">
        <button
          onClick={onClose ?? handleBack}
          className="text-text-secondary hover:text-text-primary"
        >
          <X size={20} className="text-current" />
        </button>
      </header>
    )
  }

  return (
    <header className="flex h-14 items-center px-4">
      <button
        onClick={handleBack}
        className="mr-3 rounded-md p-1 text-text-secondary hover:bg-surface-elevated hover:text-text-primary transition-colors"
      >
        <ArrowLeft size={24} className="text-current" />
      </button>
      <h1 className="flex-1 text-center font-sora text-base font-semibold text-text-primary">
        {title}
      </h1>
      {variant === 'with-back-action' && onAction ? (
        <button
          onClick={onAction}
          className="text-sm text-brand-primary hover:text-brand-primary/80"
        >
          {actionLabel}
        </button>
      ) : (
        <span className="w-8" />
      )}
    </header>
  )
}

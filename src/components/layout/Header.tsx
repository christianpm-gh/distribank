import { useNavigate } from 'react-router-dom'

type Props = {
  title?: string
  variant?: 'with-back' | 'with-back-action' | 'modal'
  onAction?: () => void
  actionLabel?: string
  onClose?: () => void
}

export default function Header({ title, variant = 'with-back', onAction, actionLabel, onClose }: Props) {
  const navigate = useNavigate()

  if (variant === 'modal') {
    return (
      <header className="flex h-14 items-center justify-end px-4">
        <button
          onClick={onClose ?? (() => navigate(-1))}
          className="text-xl text-text-secondary hover:text-text-primary"
        >
          ✕
        </button>
      </header>
    )
  }

  return (
    <header className="flex h-14 items-center px-4">
      <button
        onClick={() => navigate(-1)}
        className="mr-3 text-xl text-text-secondary hover:text-text-primary"
      >
        ←
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
        <span className="w-7" />
      )}
    </header>
  )
}

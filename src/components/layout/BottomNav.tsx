import { useNavigate, useLocation } from 'react-router-dom'

const items = [
  { label: 'Inicio', icon: '🏠', path: '/' },
  { label: 'Tarjetas', icon: '💳', path: '/cards' },
  { label: 'Transferir', icon: '↔', path: '/transfer', isAction: true },
] as const

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-surface-elevated bg-surface-card">
      {items.map((item) => {
        const isActive = !item.isAction && location.pathname === item.path

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 transition-colors ${
              isActive ? 'text-brand-primary' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs">{item.label}</span>
            {isActive && (
              <span className="absolute bottom-0 h-0.5 w-8 rounded-full bg-brand-primary" />
            )}
          </button>
        )
      })}
    </nav>
  )
}

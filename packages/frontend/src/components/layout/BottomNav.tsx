import { useNavigate, useLocation } from 'react-router-dom'
import { Home, CreditCard, ArrowLeftRight } from 'lucide-react'
import type { ReactNode } from 'react'

/** @deprecated Use SidebarNav (C-14) for desktop layout. Retained for mobile fallback. */

const items: { label: string; icon: ReactNode; path: string; isAction?: boolean }[] = [
  { label: 'Inicio', icon: <Home size={20} className="text-current" />, path: '/' },
  { label: 'Tarjetas', icon: <CreditCard size={20} className="text-current" />, path: '/cards' },
  { label: 'Transferir', icon: <ArrowLeftRight size={20} className="text-current" />, path: '/transfer', isAction: true },
]

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
            {item.icon}
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

import { useNavigate, useLocation } from 'react-router-dom'
import { Home, CreditCard, ArrowLeftRight, LogOut } from 'lucide-react'
import type { ReactNode } from 'react'

type Props = {
  customerName?: string
  customerInitial?: string
}

const navItems: { label: string; icon: ReactNode; path: string }[] = [
  { label: 'Inicio', icon: <Home size={20} className="text-current" />, path: '/' },
  { label: 'Tarjetas', icon: <CreditCard size={20} className="text-current" />, path: '/cards' },
  { label: 'Transferir', icon: <ArrowLeftRight size={20} className="text-current" />, path: '/transfer' },
]

export default function SidebarNav({ customerName, customerInitial }: Props) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    sessionStorage.clear()
    navigate('/login')
    window.location.reload()
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-30 flex w-[var(--sidebar-width)] flex-col border-r border-surface-elevated bg-surface-card">
      <div className="px-5 py-6">
        <h2 className="font-sora text-xl font-bold text-text-primary">DistriBank</h2>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
            || (item.path === '/' && location.pathname === '/')
            || (item.path !== '/' && location.pathname.startsWith(item.path))

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'border-l-2 border-brand-primary bg-surface-elevated text-text-primary'
                  : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="border-t border-surface-elevated px-3 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-white">
            {customerInitial || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-primary">
              {customerName || 'Usuario'}
            </p>
            <p className="text-xs text-text-muted">Cliente</p>
          </div>
          <button
            onClick={handleLogout}
            className="shrink-0 text-text-muted hover:text-text-primary transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={18} className="text-current" />
          </button>
        </div>
      </div>
    </aside>
  )
}

import { useNavigate, useLocation } from 'react-router-dom'
import { Home, CreditCard, ArrowLeftRight, Receipt, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import type { ReactNode } from 'react'
import distribankLogoSidebar from '@/assets/distribank-logo-sidebar.svg'
import distribankMark from '@/assets/distribank-mark.svg'

type Props = {
  customerName?: string
  customerInitial?: string
  isDrawerOpen?: boolean
  onClose?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

const navItems: { label: string; icon: ReactNode; path: string }[] = [
  { label: 'Inicio', icon: <Home size={20} className="text-current" />, path: '/' },
  { label: 'Movimientos', icon: <Receipt size={20} className="text-current" />, path: '/transactions' },
  { label: 'Tarjetas', icon: <CreditCard size={20} className="text-current" />, path: '/cards' },
  { label: 'Transferir', icon: <ArrowLeftRight size={20} className="text-current" />, path: '/transfer' },
]

export default function SidebarNav({ customerName, customerInitial, isDrawerOpen, onClose, collapsed = false, onToggleCollapse }: Props) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    sessionStorage.clear()
    navigate('/login')
    window.location.reload()
  }

  const handleNav = (path: string) => {
    navigate(path)
    onClose?.()
  }

  const renderContent = (expanded: boolean, showToggle = true) => (
    <>
      <div className="px-5 py-6">
        {expanded ? (
          <img
            src={distribankLogoSidebar}
            alt="DistriBank"
            className="h-auto w-full max-w-[210px] drop-shadow-[0_0_12px_rgba(26,86,219,0.28)]"
          />
        ) : (
          <img
            src={distribankMark}
            alt="DistriBank"
            className="mx-auto h-11 w-11 drop-shadow-[0_0_10px_rgba(26,86,219,0.35)]"
          />
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
            || (item.path === '/' && location.pathname === '/')
            || (item.path !== '/' && location.pathname.startsWith(item.path))

          return (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'border-l-2 border-brand-primary bg-surface-elevated text-text-primary'
                  : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'
              } ${!expanded ? 'justify-center' : ''}`}
              title={item.label}
            >
              {item.icon}
              {expanded && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-surface-elevated px-3 py-4">
        {expanded && onToggleCollapse && showToggle && (
          <button
            onClick={onToggleCollapse}
            className="mb-3 flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs text-text-muted hover:bg-surface-elevated hover:text-text-primary transition-colors"
          >
            {collapsed
              ? <PanelLeftOpen size={16} className="text-current" />
              : <PanelLeftClose size={16} className="text-current" />
            }
            {collapsed ? 'Expandir' : 'Colapsar'}
          </button>
        )}
        {!expanded && onToggleCollapse && showToggle && (
          <button
            onClick={onToggleCollapse}
            className="mb-3 flex w-full items-center justify-center rounded-md px-3 py-2 text-text-muted hover:bg-surface-elevated hover:text-text-primary transition-colors"
            title={collapsed ? 'Expandir' : 'Colapsar'}
          >
            {collapsed
              ? <PanelLeftOpen size={16} className="text-current" />
              : <PanelLeftClose size={16} className="text-current" />
            }
          </button>
        )}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-white">
            {customerInitial || '?'}
          </div>
          {expanded && (
            <>
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
            </>
          )}
        </div>
      </div>
    </>
  )

  const desktopWidth = collapsed ? 'w-[var(--sidebar-collapsed)]' : 'w-[var(--sidebar-collapsed)] lg:w-[var(--sidebar-width)]'

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`fixed left-0 top-0 bottom-0 z-30 hidden md:flex ${desktopWidth} flex-col border-r border-surface-elevated bg-surface-card transition-all duration-200`}>
        {collapsed ? (
          <div className="flex flex-col h-full">
            {renderContent(false)}
          </div>
        ) : (
          <>
            <div className="flex flex-col h-full lg:hidden">
              {renderContent(false)}
            </div>
            <div className="hidden lg:flex flex-col h-full">
              {renderContent(true)}
            </div>
          </>
        )}
      </aside>

      {/* Mobile drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <aside className="relative z-10 flex h-full w-[var(--sidebar-width)] flex-col border-r border-surface-elevated bg-surface-card">
            {renderContent(true, false)}
          </aside>
        </div>
      )}
    </>
  )
}

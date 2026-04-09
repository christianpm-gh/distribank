import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import SidebarNav from './SidebarNav'
import { useProfile } from '@/hooks/useAccounts'
import { getFirstName } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

export default function AppShell() {
  const { data } = useProfile()
  const firstName = data?.customer.name ? getFirstName(data.customer.name) : ''
  const initial = firstName.charAt(0).toUpperCase()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const desktopMargin = sidebarCollapsed
    ? 'md:ml-[var(--sidebar-collapsed)]'
    : 'md:ml-[var(--sidebar-collapsed)] lg:ml-[var(--sidebar-width)]'

  return (
    <div className="flex min-h-screen">
      <SidebarNav
        customerName={firstName}
        customerInitial={initial}
        isDrawerOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className={`flex-1 ml-0 ${desktopMargin} transition-all duration-200`}>
        {/* Mobile sidebar button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="fixed left-2 top-1/2 z-40 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-surface-elevated bg-surface-card/60 text-text-secondary hover:bg-surface-card hover:text-text-primary transition-colors md:hidden"
        >
          <ChevronRight size={18} className="text-current" />
        </button>

        <Outlet />
      </main>
    </div>
  )
}

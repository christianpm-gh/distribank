import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import SidebarNav from './SidebarNav'
import { useProfile } from '@/hooks/useAccounts'
import { getFirstName } from '@/lib/utils'
import { Menu } from 'lucide-react'

export default function AppShell() {
  const { data } = useProfile()
  const firstName = data?.customer.name ? getFirstName(data.customer.name) : ''
  const initial = firstName.charAt(0).toUpperCase()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      <SidebarNav
        customerName={firstName}
        customerInitial={initial}
        isDrawerOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <main className="flex-1 ml-0 md:ml-[var(--sidebar-collapsed)] lg:ml-[var(--sidebar-width)]">
        {/* Mobile hamburger */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="fixed top-4 left-4 z-40 rounded-md bg-surface-card p-2 text-text-secondary hover:text-text-primary md:hidden"
        >
          <Menu size={20} className="text-current" />
        </button>

        <Outlet />
      </main>
    </div>
  )
}

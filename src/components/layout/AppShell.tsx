import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
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
  const [hintPlayed, setHintPlayed] = useState(false)

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
        {/* Mobile swipe hint */}
        <motion.button
          onClick={() => setDrawerOpen(true)}
          className="fixed left-1 top-1/2 z-40 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface-card/40 text-text-muted md:hidden"
          initial={!hintPlayed ? { x: 0, opacity: 0.6 } : { opacity: 0.15 }}
          animate={
            !hintPlayed
              ? {
                  x: [0, 120, 0],
                  opacity: [0.6, 0.8, 0.15],
                  rotate: [0, 0, 0],
                }
              : { opacity: 0.15 }
          }
          transition={
            !hintPlayed
              ? { duration: 1.5, ease: 'easeInOut' }
              : {}
          }
          onAnimationComplete={() => setHintPlayed(true)}
          whileTap={{ opacity: 1, scale: 1.1 }}
        >
          <ChevronRight size={18} className="text-current" />
        </motion.button>

        <Outlet />
      </main>
    </div>
  )
}

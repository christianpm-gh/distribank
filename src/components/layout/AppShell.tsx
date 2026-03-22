import { Outlet } from 'react-router-dom'
import SidebarNav from './SidebarNav'
import { useProfile } from '@/hooks/useAccounts'
import { getFirstName } from '@/lib/utils'

export default function AppShell() {
  const { data } = useProfile()
  const firstName = data?.customer.name ? getFirstName(data.customer.name) : ''
  const initial = firstName.charAt(0).toUpperCase()

  return (
    <div className="flex min-h-screen">
      <SidebarNav customerName={firstName} customerInitial={initial} />
      <main className="ml-[var(--sidebar-width)] flex-1">
        <Outlet />
      </main>
    </div>
  )
}

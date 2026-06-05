'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { BarChart2, ClipboardList, Briefcase, Settings } from 'lucide-react'
import { getUser, clearUser } from '@/lib/auth'
import { canAccess } from '@/lib/rbac'
import { AuthUser, Tab } from '@/types'

// sidebar nav items: tab controls visibility via RBAC
const NAV_ITEMS = [
  { tab: 'transactions' as Tab, icon: ClipboardList, label: 'Transactions', href: '/dashboard/transactions' },
  { tab: 'stats' as Tab, icon: BarChart2, label: 'Stats', href: '/dashboard/stats' },
  { tab: 'custom' as Tab, icon: Briefcase, label: 'Workspace', href: '/dashboard/custom' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const currentUser = getUser()

    // no user in localStorage - send to login
    if (!currentUser) {
      router.replace('/login')
      return
    }

    // check access before setting user in state - if we set user first React
    // re-renders and briefly shows the page before the redirect fires
    const currentTab = pathname.split('/')[2] as Tab
    if (currentTab && !canAccess(currentUser.allowedTabs, currentTab)) {
      router.replace(`/dashboard/${currentUser.allowedTabs[0]}`)
      return
    }

    // only set user if they are allowed on this tab - prevents flash
    setCurrentUser(currentUser)
  }, [pathname, router])

  // logout handler - clears user from localStorage and redirects to login
  function handleLogout() {
    clearUser()
    router.replace('/login')
  }

  // prevent flash of dashboard before redirect
  if (!currentUser) return null

  return (
    <div className="flex h-screen bg-[#0d0f14]">

      {/* sidebar */}
      <aside className="w-20 flex flex-col items-center py-6 bg-[#0a0c10] border-r border-white/5">

        {/* blue triangle logo */}
        <div className="mb-10">
          <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-b-[24px] border-l-transparent border-r-transparent border-b-[#2563eb]" />
        </div>

        {/* navbar - only showing tabs the user is allowed to access */}
        <nav className="flex flex-col items-center gap-8 flex-1">
          {NAV_ITEMS.filter(item => canAccess(currentUser.allowedTabs, item.tab)).map(item => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link key={item.tab} href={item.href} className="flex flex-col items-center gap-1 group">
                <item.icon
                  size={22}
                  className={isActive ? 'text-[#2563eb]' : 'text-white/40 group-hover:text-white/70 transition-colors'}
                />
                <span className={`text-[10px] font-montserrat uppercase tracking-wider transition-colors ${isActive ? 'text-[#2563eb]' : 'text-white/40 group-hover:text-white/70'}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* settings + user avatar */}
        <div className="flex flex-col items-center gap-4">
          <button className="text-white/40 hover:text-white/70 transition-colors">
            <Settings size={20} />
          </button>
          {/* avatar shows user initials */}
          <button
            onClick={handleLogout}
            title="Logout"
            className="w-9 h-9 rounded-full bg-[#2563eb]/20 border border-[#2563eb]/40 flex items-center justify-center hover:bg-[#2563eb]/30 transition-colors"
          >
            <span className="text-[#2563eb] font-montserrat font-semibold text-xs">
              {currentUser?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          </button>
        </div>
      </aside>

      {/* main area */}
      <div className="flex flex-col flex-1">

        {/* top bar */}
        <div className="h-9 flex items-center justify-end px-6 border-b border-white/5 shrink-0">
          <span className="text-[#c2c2c2] text-xs uppercase tracking-wider">
          Last updated: {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })} at {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* page content injected here */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

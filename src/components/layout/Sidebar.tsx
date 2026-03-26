'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Briefcase,
} from 'lucide-react'
import { useState } from 'react'

export default function Sidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)

  const isAdmin = user?.role === 'admin'

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/deals', label: 'My Deals', icon: FileText },
    { href: '/deals/new', label: 'Create Deal', icon: PlusCircle },
    ...(isAdmin
      ? [{ href: '/admin', label: 'Pipeline', icon: Briefcase }]
      : []),
    { href: '/profile', label: 'Profile', icon: User },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <Link href="/dashboard">
          <h1 className="text-xl font-bold text-gray-900">
            Hero <span className="text-hero-purple">Deal Vault</span>
          </h1>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-hero-purple/10 text-hero-purple'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100">
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 bg-hero-purple/10 rounded-full flex items-center justify-center">
              <span className="text-hero-purple text-sm font-medium">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role || 'founder'}</p>
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {profileOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setProfileOpen(false)}
              >
                <Settings size={14} />
                Settings
              </Link>
              <button
                onClick={() => {
                  setProfileOpen(false)
                  signOut()
                }}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

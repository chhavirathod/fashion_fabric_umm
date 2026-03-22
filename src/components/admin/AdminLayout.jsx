import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Building2, Users, Ruler, PackageCheck,
  Download, LogOut, Menu, X, ChevronRight, Settings
} from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { to: '/admin',             label: 'Dashboard',    icon: LayoutDashboard, end: true },
  { to: '/admin/hotels',      label: 'Hotels',       icon: Building2 },
  { to: '/admin/employees',   label: 'Employees',    icon: Users },
  { to: '/admin/measurements',label: 'Measurements', icon: Ruler },
  { to: '/admin/orders',      label: 'Order Status', icon: PackageCheck },
  { to: '/admin/export',      label: 'Export Data',  icon: Download },
]

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-surface-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-700 flex items-center justify-center shrink-0">
            <Ruler size={18} className="text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-surface-900 text-sm leading-tight">UMMS</p>
            <p className="text-[11px] text-surface-400 font-medium leading-tight">Fashion Fabric</p>
          </div>
        </div>
      </div>

      {/* Role chip */}
      <div className="px-5 py-3 border-b border-surface-100">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 inline-block" />
          Super Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
              isActive
                ? 'bg-brand-700 text-white shadow-sm'
                : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
            )}
          >
            {({ isActive }) => (
              <>
                <Icon size={17} className={isActive ? 'text-white' : 'text-surface-400 group-hover:text-surface-600'} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={14} className="text-white/60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-surface-100 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-50">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-brand-700">
              {user?.name?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-surface-800 truncate">{user?.name}</p>
            <p className="text-[11px] text-surface-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-500 hover:text-red-600 hover:bg-red-50 transition-all duration-150"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-surface-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-col bg-white border-r border-surface-200 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-surface-900/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-white border-r border-surface-200 z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-surface-200 shrink-0">
          <button onClick={() => setOpen(true)} className="p-2 rounded-lg hover:bg-surface-100">
            <Menu size={20} className="text-surface-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-700 flex items-center justify-center">
              <Ruler size={14} className="text-white" />
            </div>
            <span className="font-display font-bold text-surface-900 text-sm">UMMS</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

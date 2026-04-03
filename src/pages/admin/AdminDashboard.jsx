import React, { useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { Building2, ChevronRight } from 'lucide-react'
import { VERTICALS } from '../../data/seed'
import EmptyState from '../../components/shared/EmptyState'

export default function AdminDashboard() {
  const { state } = useApp()
  const { hotels, departments, employees } = state
  const navigate = useNavigate()

  const activeHotels = useMemo(() => {
    return hotels.filter(h => h.isActive).map(h => {
      const depts = departments.filter(d => d.hotelId === h.id && d.isActive)
      const emps = employees.filter(e => e.hotelId === h.id)
      const vert = VERTICALS.find(v => v.id === h.vertical)
      return { ...h, deptCount: depts.length, empCount: emps.length, vert }
    })
  }, [hotels, departments, employees])

  return (
    <div className="p-6 lg:p-8 space-y-8 fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-3xl text-surface-900">Clients</h1>
        <p className="text-sm text-surface-500 mt-1">View departments and measurements for each client.</p>
      </div>

      {/* Clients Grid */}
      {activeHotels.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No clients yet"
          description="Clients will appear here once staff members create them."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeHotels.map(h => (
            <button
              key={h.id}
              onClick={() => navigate(`/admin/clients/${h.id}`)}
              className="card p-6 text-left hover:shadow-md hover:border-brand-200 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl">{h.vert?.icon || '🏢'}</div>
                <ChevronRight size={18} className="text-surface-300 group-hover:text-brand-600 transition-colors" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-surface-900 text-lg mb-1">{h.name}</h3>
                {h.vert && (
                  <span className={`inline-block badge text-[10px] mb-3 ${h.vert.color}`}>
                    {h.vert.icon} {h.vert.label}
                  </span>
                )}
                <div className="flex gap-4 text-sm">
                  <div>
                    <p className="text-xs text-surface-400 font-medium">Departments</p>
                    <p className="text-lg font-bold text-surface-800">{h.deptCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-surface-400 font-medium">Employees</p>
                    <p className="text-lg font-bold text-surface-800">{h.empCount}</p>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

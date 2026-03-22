import React, { useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { Building2, Users, CheckCircle2, Clock, TrendingUp, ArrowRight } from 'lucide-react'
import { VERTICALS } from '../../data/seed'
import { StatusBadge } from '../../utils/helpers'

function StatCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-surface-900">{value}</p>
        <p className="text-sm font-medium text-surface-600">{label}</p>
        {sub && <p className="text-xs text-surface-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function ProgressRing({ pct, size = 52, stroke = 5 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={pct === 100 ? '#16a34a' : pct > 50 ? '#3b82f6' : '#f59e0b'}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  )
}

export default function AdminDashboard() {
  const { state } = useApp()
  const { hotels, departments, employees, measurements } = state
  const navigate = useNavigate()

  const stats = useMemo(() => {
    const active = hotels.filter(h => h.isActive)
    const totalEmp = employees.length
    const measured = employees.filter(e => e.status !== 'pending').length
    const completed = employees.filter(e => e.status === 'completed').length
    const pending = employees.filter(e => e.status === 'pending').length
    const pct = totalEmp ? Math.round((measured / totalEmp) * 100) : 0
    return { activeHotels: active.length, totalEmp, measured, completed, pending, pct }
  }, [hotels, employees])

  const hotelRows = useMemo(() => {
    return hotels.filter(h => h.isActive).map(h => {
      const depts = departments.filter(d => d.hotelId === h.id)
      const emps  = employees.filter(e => e.hotelId === h.id)
      const done  = emps.filter(e => e.status !== 'pending').length
      const pct   = emps.length ? Math.round((done / emps.length) * 100) : 0
      const vert  = VERTICALS.find(v => v.id === h.vertical)
      return { ...h, deptCount: depts.length, empCount: emps.length, done, pct, vert }
    })
  }, [hotels, departments, employees])

  const recentActivity = useMemo(() => {
    return [...measurements]
      .sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))
      .slice(0, 6)
      .map(m => {
        const emp  = employees.find(e => e.id === m.employeeId)
        const dept = emp ? departments.find(d => d.id === emp.deptId) : null
        const hotel = emp ? hotels.find(h => h.id === emp.hotelId) : null
        return { ...m, emp, dept, hotel }
      })
  }, [measurements, employees, departments, hotels])

  return (
    <div className="p-6 lg:p-8 space-y-8 fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-surface-900">Dashboard</h1>
        <p className="text-sm text-surface-500 mt-1">Overview of all measurement activity across clients.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Active Clients" value={stats.activeHotels} sub={`of ${hotels.length} total`}
          icon={Building2} color="bg-blue-100 text-blue-600" />
        <StatCard label="Total Employees" value={stats.totalEmp} sub="across all clients"
          icon={Users} color="bg-purple-100 text-purple-600" />
        <StatCard label="Measured" value={stats.measured} sub={`${stats.pct}% completion`}
          icon={TrendingUp} color="bg-brand-100 text-brand-700" />
        <StatCard label="Pending" value={stats.pending} sub="awaiting measurement"
          icon={Clock} color="bg-amber-100 text-amber-600" />
      </div>

      {/* Hotel progress table + recent activity */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Hotel progress */}
        <div className="lg:col-span-3 card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
            <h2 className="font-display font-semibold text-surface-800">Client Progress</h2>
            <button onClick={() => navigate('/admin/hotels')} className="text-xs text-brand-600 font-semibold hover:underline flex items-center gap-1">
              Manage <ArrowRight size={12} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Client</th>
                  <th className="table-th">Vertical</th>
                  <th className="table-th text-center">Depts</th>
                  <th className="table-th text-center">Employees</th>
                  <th className="table-th text-right">Progress</th>
                </tr>
              </thead>
              <tbody>
                {hotelRows.map(h => (
                  <tr
                    key={h.id}
                    onClick={() => navigate(`/admin/hotels?hotel=${h.id}`)}
                    className="hover:bg-surface-50 cursor-pointer transition-colors"
                  >
                    <td className="table-td font-semibold text-surface-800">{h.name}</td>
                    <td className="table-td">
                      {h.vert && (
                        <span className={`badge text-[11px] ${h.vert.color}`}>
                          {h.vert.icon} {h.vert.label}
                        </span>
                      )}
                    </td>
                    <td className="table-td text-center font-mono text-xs">{h.deptCount}</td>
                    <td className="table-td text-center font-mono text-xs">{h.empCount}</td>
                    <td className="table-td">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 h-1.5 rounded-full bg-surface-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${h.pct === 100 ? 'bg-brand-500' : h.pct > 50 ? 'bg-blue-500' : 'bg-amber-500'}`}
                            style={{ width: `${h.pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-surface-500 w-8 text-right">{h.pct}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent activity */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
            <h2 className="font-display font-semibold text-surface-800">Recent Entries</h2>
            <button onClick={() => navigate('/admin/measurements')} className="text-xs text-brand-600 font-semibold hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-surface-100">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-surface-400 text-center py-8">No entries yet</p>
            ) : recentActivity.map(m => (
              <div key={m.id} className="px-5 py-3.5 hover:bg-surface-50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-surface-800">{m.emp?.name || '—'}</p>
                    <p className="text-xs text-surface-400">{m.hotel?.name} · {m.dept?.name}</p>
                  </div>
                  <span className="text-[11px] font-semibold bg-surface-100 text-surface-600 px-2 py-0.5 rounded-md shrink-0 capitalize">
                    {m.uniformType?.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-[11px] text-surface-400 mt-1">
                  {new Date(m.recordedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status breakdown */}
      <div className="card p-5">
        <h2 className="font-display font-semibold text-surface-800 mb-4">Status Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Pending',       count: employees.filter(e => e.status === 'pending').length,    cls: 'bg-amber-50 border-amber-200 text-amber-800' },
            { label: 'Measured',      count: employees.filter(e => e.status === 'measured').length,   cls: 'bg-blue-50 border-blue-200 text-blue-800' },
            { label: 'In Production', count: employees.filter(e => e.status === 'production').length, cls: 'bg-purple-50 border-purple-200 text-purple-800' },
            { label: 'Completed',     count: employees.filter(e => e.status === 'completed').length,  cls: 'bg-brand-50 border-brand-200 text-brand-800' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl border p-4 ${s.cls}`}>
              <p className="text-3xl font-display font-bold">{s.count}</p>
              <p className="text-sm font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

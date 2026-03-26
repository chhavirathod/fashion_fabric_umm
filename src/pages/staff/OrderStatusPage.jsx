import React, { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/shared/Toast'
import SearchInput from '../../components/shared/SearchInput'
import EmptyState from '../../components/shared/EmptyState'
import { StatusBadge } from '../../utils/helpers'
import { STATUS_OPTIONS } from '../../data/seed'
import { PackageCheck, User } from 'lucide-react'

const STATUS_FLOW = ['pending', 'measured', 'production', 'completed']

function StatusStepper({ current, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {STATUS_FLOW.map((s, i) => {
        const idx = STATUS_FLOW.indexOf(current)
        const done = i <= idx
        const opt = STATUS_OPTIONS.find(o => o.value === s)
        return (
          <button
            key={s}
            onClick={() => onChange(s)}
            title={opt?.label}
            className={`flex-1 h-1.5 rounded-full transition-all ${done ? (
              s === 'completed'  ? 'bg-brand-500' :
              s === 'production' ? 'bg-purple-500' :
              s === 'measured'   ? 'bg-blue-500' : 'bg-amber-400'
            ) : 'bg-surface-200 hover:bg-surface-300'}`}
          />
        )
      })}
    </div>
  )
}

export default function OrderStatusPage() {
  const { state, dispatch } = useApp()
  const { hotels, departments, employees, measurements } = state
  const toast = useToast()

  const [filterHotel, setFilterHotel]   = useState('all')
  const [filterDept, setFilterDept]     = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch]             = useState('')

  const filteredDepts = filterHotel === 'all' ? departments : departments.filter(d => d.hotelId === filterHotel)

  const filtered = useMemo(() => {
    return employees.filter(e => {
      const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.empCode.toLowerCase().includes(search.toLowerCase())
      const matchHotel  = filterHotel  === 'all' || e.hotelId === filterHotel
      const matchDept   = filterDept   === 'all' || e.deptId  === filterDept
      const matchStatus = filterStatus === 'all' || e.status  === filterStatus
      return matchSearch && matchHotel && matchDept && matchStatus
    })
  }, [employees, search, filterHotel, filterDept, filterStatus])

  const handleStatus = (id, status) => {
    dispatch({ type: 'UPDATE_EMPLOYEE_STATUS', payload: { id, status } })
    toast('Status updated.', 'success')
  }

  const summary = useMemo(() => ({
    pending:    employees.filter(e => e.status === 'pending').length,
    measured:   employees.filter(e => e.status === 'measured').length,
    production: employees.filter(e => e.status === 'production').length,
    completed:  employees.filter(e => e.status === 'completed').length,
  }), [employees])

  return (
    <div className="p-6 lg:p-8 space-y-6 fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-surface-900">Order Status</h1>
        <p className="text-sm text-surface-500 mt-1">Track and update the production status of each employee's uniform.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Pending',       key: 'pending',    cls: 'border-amber-200 bg-amber-50',   text: 'text-amber-700' },
          { label: 'Measured',      key: 'measured',   cls: 'border-blue-200 bg-blue-50',     text: 'text-blue-700' },
          { label: 'In Production', key: 'production', cls: 'border-purple-200 bg-purple-50', text: 'text-purple-700' },
          { label: 'Completed',     key: 'completed',  cls: 'border-brand-200 bg-brand-50',   text: 'text-brand-700' },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setFilterStatus(filterStatus === s.key ? 'all' : s.key)}
            className={`rounded-xl border p-4 text-left transition-all ${s.cls} ${filterStatus === s.key ? 'ring-2 ring-offset-1 ring-brand-400' : ''}`}
          >
            <p className={`text-3xl font-display font-bold ${s.text}`}>{summary[s.key]}</p>
            <p className={`text-sm font-medium mt-1 ${s.text}`}>{s.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Employee name…" className="w-52" />
        <select className="input w-auto" value={filterHotel} onChange={e => { setFilterHotel(e.target.value); setFilterDept('all') }}>
          <option value="all">All Clients</option>
          {hotels.filter(h => h.isActive).map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
        <select className="input w-auto" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="all">All Departments</option>
          {filteredDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={PackageCheck} title="No employees found" description="Adjust your filters." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Employee</th>
                  <th className="table-th">Client</th>
                  <th className="table-th">Department</th>
                  <th className="table-th">Measurements</th>
                  <th className="table-th">Status</th>
                  <th className="table-th w-48">Progress</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => {
                  const hotel  = hotels.find(h => h.id === e.hotelId)
                  const dept   = departments.find(d => d.id === e.deptId)
                  const mCount = measurements.filter(m => m.employeeId === e.id).length
                  return (
                    <tr key={e.id} className="hover:bg-surface-50 transition-colors">
                      <td className="table-td">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-surface-100 flex items-center justify-center shrink-0">
                            <User size={13} className="text-surface-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-surface-800 text-sm">{e.name}</p>
                            <p className="text-[11px] text-surface-400 font-mono">{e.empCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-td text-xs text-surface-600">{hotel?.name || '—'}</td>
                      <td className="table-td text-xs text-surface-600">{dept?.name  || '—'}</td>
                      <td className="table-td">
                        <span className="text-xs font-mono font-semibold bg-surface-100 text-surface-700 px-2 py-0.5 rounded">{mCount}</span>
                      </td>
                      <td className="table-td">
                        <select
                          value={e.status}
                          onChange={ev => handleStatus(e.id, ev.target.value)}
                          className={`text-xs font-semibold border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer ${
                            e.status === 'pending'    ? 'bg-amber-50 border-amber-200 text-amber-700' :
                            e.status === 'measured'   ? 'bg-blue-50 border-blue-200 text-blue-700' :
                            e.status === 'production' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                            'bg-brand-50 border-brand-200 text-brand-700'
                          }`}
                        >
                          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </td>
                      <td className="table-td w-48">
                        <StatusStepper current={e.status} onChange={(s) => handleStatus(e.id, s)} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-surface-100 bg-surface-50">
            <p className="text-xs text-surface-400">{filtered.length} employee{filtered.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      )}
    </div>
  )
}

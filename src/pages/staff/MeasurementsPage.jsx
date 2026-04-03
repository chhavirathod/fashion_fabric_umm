import React, { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/shared/Toast'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import SearchInput from '../../components/shared/SearchInput'
import EmptyState from '../../components/shared/EmptyState'
import UnitToggle from '../../components/shared/UnitToggle'
import { inToCm, fmtDateTime, StatusBadge } from '../../utils/helpers'
import { UNIFORM_TYPES } from '../../data/seed'
import { Ruler, ChevronDown, ChevronRight, Trash2, User } from 'lucide-react'

function MeasurementCard({ measurement, onDelete }) {
  const { state } = useApp()
  const { employees, hotels, departments } = state
  const [expanded, setExpanded] = useState(false)
  const [unit, setUnit] = useState(measurement.unit || 'in')

  const emp   = employees.find(e => e.id === measurement.employeeId)
  const hotel = hotels.find(h => h.id === emp?.hotelId)
  const dept  = departments.find(d => d.id === emp?.deptId)
  const uType = UNIFORM_TYPES.find(u => u.id === measurement.uniformType)

  const displayVal = (v) => {
    if (!v) return '—'
    if (unit === measurement.unit) return `${v} ${unit}`
    return unit === 'cm' ? `${inToCm(v)} cm` : `${(parseFloat(v) / 2.54).toFixed(2)} in`
  }

  return (
    <div className="card overflow-hidden">
      <div
        className="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-surface-50 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        {expanded ? <ChevronDown size={16} className="text-surface-400 shrink-0" /> : <ChevronRight size={16} className="text-surface-400 shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-surface-800">{emp?.name || '—'}</p>
            <span className="badge bg-surface-100 text-surface-600 border-surface-200 text-[11px] capitalize">
              {uType?.label || measurement.uniformType}
            </span>
          </div>
          <p className="text-xs text-surface-400">{hotel?.name} · {dept?.name} · {emp?.role}</p>
        </div>
        <div className="text-right shrink-0 hidden sm:block">
          <p className="text-xs font-mono text-surface-500">{emp?.empCode}</p>
          <p className="text-xs text-surface-400">{fmtDateTime(measurement.recordedAt)}</p>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onDelete(measurement.id) }}
          className="btn-ghost p-1.5 hover:text-red-600 hover:bg-red-50 shrink-0 ml-2"
          title="Delete measurement"
        >
          <Trash2 size={14} />
        </button>
      </div>
      {expanded && (
        <div className="border-t border-surface-100 px-5 py-4 bg-surface-50/50">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Measurements</p>
            <UnitToggle value={unit} onChange={setUnit} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {Object.entries(measurement.values).map(([field, val]) => (
              <div key={field} className="bg-white border border-surface-200 rounded-lg px-3 py-2.5">
                <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">{field}</p>
                <p className="text-sm font-bold text-surface-800 font-mono mt-0.5">{displayVal(val)}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-surface-400 mt-3">
            Recorded by <span className="font-medium text-surface-600">{measurement.recordedBy}</span> on {fmtDateTime(measurement.recordedAt)}
          </p>
        </div>
      )}
    </div>
  )
}

export default function MeasurementsPage() {
  const { state, dispatch } = useApp()
  const { user } = useAuth()
  const { hotels, departments, employees, measurements } = state
  const toast = useToast()

  const [search, setSearch]           = useState('')
  const [filterHotel, setFilterHotel] = useState('all')
  const [filterDept, setFilterDept]   = useState('all')
  const [filterType, setFilterType]   = useState('all')
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null })

  const filteredDepts = filterHotel === 'all' ? departments : departments.filter(d => d.hotelId === filterHotel)

  // Only show measurements recorded by the current user
  const filtered = useMemo(() => {
    return measurements
      .filter(m => m.recordedBy === user?.id)
      .filter(m => {
        const emp = employees.find(e => e.id === m.employeeId)
        if (!emp) return false
        const matchSearch = emp.name.toLowerCase().includes(search.toLowerCase()) || emp.empCode.toLowerCase().includes(search.toLowerCase())
        const matchHotel  = filterHotel === 'all' || emp.hotelId === filterHotel
        const matchDept   = filterDept  === 'all' || emp.deptId  === filterDept
        const matchType   = filterType  === 'all' || m.uniformType === filterType
        return matchSearch && matchHotel && matchDept && matchType
      })
      .sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))
  }, [measurements, employees, user, search, filterHotel, filterDept, filterType])

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_MEASUREMENT', payload: id })
    toast('Measurement deleted.', 'info')
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-surface-900">Measurements</h1>
        <p className="text-sm text-surface-500 mt-1">{filtered.length} measurements recorded by you.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Employee name or code…" className="w-56" />
        <select className="input w-auto" value={filterHotel} onChange={e => { setFilterHotel(e.target.value); setFilterDept('all') }}>
          <option value="all">All Clients</option>
          {hotels.filter(h => h.isActive).map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
        <select className="input w-auto" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="all">All Departments</option>
          {filteredDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select className="input w-auto" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">All Uniform Types</option>
          {UNIFORM_TYPES.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
        </select>
      </div>

      <p className="text-xs text-surface-400">{filtered.length} record{filtered.length !== 1 ? 's' : ''} found</p>

      {filtered.length === 0 ? (
        <EmptyState icon={Ruler} title="No measurements found" description="Adjust filters or have staff enter measurements." />
      ) : (
        <div className="space-y-2">
          {filtered.map(m => (
            <MeasurementCard
              key={m.id}
              measurement={m}
              onDelete={(id) => setDeleteConfirm({ open: true, id })}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null })}
        onConfirm={() => handleDelete(deleteConfirm.id)}
        title="Delete Measurement"
        message="This measurement record will be permanently removed."
        danger
      />
    </div>
  )
}

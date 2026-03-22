import React, { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { fmtDateTime, inToCm } from '../../utils/helpers'
import UnitToggle from '../../components/shared/UnitToggle'
import EmptyState from '../../components/shared/EmptyState'
import { UNIFORM_TYPES } from '../../data/seed'
import { ClipboardList, ChevronDown, ChevronRight, User } from 'lucide-react'

function EntryCard({ measurement }) {
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
    if (unit === 'cm' && measurement.unit === 'in') return `${inToCm(v)} cm`
    if (unit === 'in' && measurement.unit === 'cm') return `${(parseFloat(v) / 2.54).toFixed(2)} in`
    return `${v} ${unit}`
  }

  return (
    <div className="card overflow-hidden">
      <div
        className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-surface-50 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        {expanded ? <ChevronDown size={15} className="text-surface-400 shrink-0" /> : <ChevronRight size={15} className="text-surface-400 shrink-0" />}
        <div className="w-8 h-8 rounded-full bg-surface-100 flex items-center justify-center shrink-0">
          <User size={14} className="text-surface-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-surface-800 text-sm">{emp?.name || '—'}</p>
            <span className="badge bg-surface-100 text-surface-600 border-surface-200 text-[11px] capitalize">
              {uType?.label || measurement.uniformType}
            </span>
          </div>
          <p className="text-xs text-surface-400">{hotel?.name} · {dept?.name}</p>
        </div>
        <p className="text-xs text-surface-400 hidden sm:block">{fmtDateTime(measurement.recordedAt)}</p>
      </div>
      {expanded && (
        <div className="border-t border-surface-100 px-5 py-4 bg-surface-50/50">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Values</p>
            <UnitToggle value={unit} onChange={setUnit} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(measurement.values).map(([field, val]) => (
              <div key={field} className="bg-white border border-surface-200 rounded-lg px-3 py-2">
                <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">{field}</p>
                <p className="text-sm font-bold text-surface-800 font-mono">{displayVal(val)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function StaffMyEntries() {
  const { state } = useApp()
  const { user } = useAuth()
  const { measurements, employees, hotels } = state

  // Staff see measurements they recorded
  const myEntries = useMemo(() => {
    return measurements
      .filter(m => m.recordedBy === user?.id)
      .sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))
  }, [measurements, user])

  return (
    <div className="p-4 lg:p-8 space-y-6 fade-in max-w-3xl mx-auto">
      <div>
        <h1 className="font-display font-bold text-2xl text-surface-900">My Entries</h1>
        <p className="text-sm text-surface-500 mt-1">{myEntries.length} measurements recorded by you.</p>
      </div>

      {myEntries.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No entries yet" description="Measurements you record will appear here." />
      ) : (
        <div className="space-y-2">
          {myEntries.map(m => <EntryCard key={m.id} measurement={m} />)}
        </div>
      )}
    </div>
  )
}

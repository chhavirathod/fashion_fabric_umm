import React, { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/shared/Toast'
import Modal from '../../components/shared/Modal'
import UnitToggle from '../../components/shared/UnitToggle'
import EmptyState from '../../components/shared/EmptyState'
import { genId, inToCm, cmToIn, StatusBadge } from '../../utils/helpers'
import { UNIFORM_TYPES, MEASUREMENT_FIELDS, STATUS_OPTIONS, GENDER_OPTIONS } from '../../data/seed'
import {
  ChevronRight, User, Plus, Ruler, Check, Building2,
  Layers, Search, ChevronDown, Edit2, Save
} from 'lucide-react'

// ─── Step indicator ───────────────────────────────────────────────────────────
function Steps({ current }) {
  const steps = ['Client', 'Department', 'Employee', 'Uniform & Measurements']
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
            i < current  ? 'bg-brand-100 text-brand-700' :
            i === current ? 'bg-brand-700 text-white' :
            'bg-surface-100 text-surface-400'
          }`}>
            {i < current && <Check size={11} />}
            <span>{s}</span>
          </div>
          {i < steps.length - 1 && <ChevronRight size={12} className="text-surface-300 shrink-0" />}
        </React.Fragment>
      ))}
    </div>
  )
}

// ─── Add Employee Quick Form ───────────────────────────────────────────────────
function QuickAddEmployee({ hotelId, deptId, onAdd, onClose, employees }) {
  const [form, setForm] = useState({ name: '', gender: 'Male', role: '' })
  const s = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const handleAdd = () => {
    if (!form.name.trim() || !form.role.trim()) return
    onAdd(form)
    onClose()
  }
  return (
    <div className="space-y-4">
      <div>
        <label className="label">Full Name *</label>
        <input className="input" value={form.name} onChange={s('name')} placeholder="Employee name" autoFocus />
      </div>
      <div>
        <label className="label">Role / Designation *</label>
        <input className="input" value={form.role} onChange={s('role')} placeholder="e.g. Receptionist" />
      </div>
      <div>
        <label className="label">Gender</label>
        <div className="flex gap-4 mt-1">
          {GENDER_OPTIONS.map(g => (
            <label key={g} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="qgender" value={g} checked={form.gender === g}
                onChange={s('gender')} className="accent-brand-700 w-4 h-4" />
              <span className="text-sm text-surface-700">{g}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
        <button className="btn-primary flex-1" onClick={handleAdd} disabled={!form.name.trim() || !form.role.trim()}>
          Add & Select
        </button>
      </div>
    </div>
  )
}

// ─── Measurement Form for one uniform type ────────────────────────────────────
function MeasurementForm({ uniformTypeId, unit, onUnitChange, values, onChange }) {
  const fields = MEASUREMENT_FIELDS[uniformTypeId] || []
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-surface-700">
          {UNIFORM_TYPES.find(u => u.id === uniformTypeId)?.label}
        </p>
        <UnitToggle value={unit} onChange={onUnitChange} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {fields.map(field => (
          <div key={field}>
            <label className="label">{field} <span className="normal-case font-normal">({unit})</span></label>
            <input
              type="number"
              step="0.1"
              min="0"
              className="input font-mono"
              value={values[field] || ''}
              onChange={e => onChange(field, e.target.value)}
              placeholder={unit === 'in' ? '0.0 in' : '0.0 cm'}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Staff Entry Page ─────────────────────────────────────────────────────
export default function StaffMeasurementEntry() {
  const { state, dispatch } = useApp()
  const { user } = useAuth()
  const { hotels, departments, employees, measurements } = state
  const toast = useToast()

  // ── Flow state ───────────────────────────────────────────────────────────────
  const [step, setStep]         = useState(0)
  const [selHotel, setSelHotel] = useState(null)
  const [selDept, setSelDept]   = useState(null)
  const [selEmp, setSelEmp]     = useState(null)
  const [selType, setSelType]   = useState(null)

  // ── Unit and measurement values ──────────────────────────────────────────────
  const [unit, setUnit]         = useState('in')
  const [values, setValues]     = useState({})
  const [addEmpModal, setAddEmpModal] = useState(false)

  // ── Filters ──────────────────────────────────────────────────────────────────
  const [empSearch, setEmpSearch] = useState('')

  const availableHotels = useMemo(() => {
    if (user?.assignedHotelId) return hotels.filter(h => h.id === user.assignedHotelId && h.isActive)
    return hotels.filter(h => h.isActive)
  }, [hotels, user])

  const availableDepts = useMemo(() => {
    if (!selHotel) return []
    return departments.filter(d => d.hotelId === selHotel.id && d.isActive)
  }, [departments, selHotel])

  const availableEmps = useMemo(() => {
    if (!selDept) return []
    return employees
      .filter(e => e.deptId === selDept.id)
      .filter(e => !empSearch || e.name.toLowerCase().includes(empSearch.toLowerCase()))
  }, [employees, selDept, empSearch])

  // ── Unit conversion ──────────────────────────────────────────────────────────
  const handleUnitChange = (newUnit) => {
    if (newUnit === unit) return
    const converted = {}
    Object.entries(values).forEach(([k, v]) => {
      converted[k] = v ? (newUnit === 'cm' ? inToCm(v) : cmToIn(v)) : ''
    })
    setValues(converted)
    setUnit(newUnit)
  }

  const handleValueChange = (field, val) => {
    setValues(v => ({ ...v, [field]: val }))
  }

  // ── Existing measurement for this employee+type ──────────────────────────────
  const existingMeasurement = useMemo(() => {
    if (!selEmp || !selType) return null
    return measurements.find(m => m.employeeId === selEmp.id && m.uniformType === selType)
  }, [measurements, selEmp, selType])

  // ── When selecting uniform type, pre-fill existing values ───────────────────
  const handleSelectType = (typeId) => {
    setSelType(typeId)
    const existing = measurements.find(m => m.employeeId === selEmp?.id && m.uniformType === typeId)
    if (existing) {
      // Convert to current unit if needed
      if (existing.unit !== unit) {
        const conv = {}
        Object.entries(existing.values).forEach(([k, v]) => {
          conv[k] = unit === 'cm' ? inToCm(v) : cmToIn(v)
        })
        setValues(conv)
      } else {
        setValues({ ...existing.values })
      }
    } else {
      setValues({})
    }
    setStep(3)
  }

  // ── Save measurement ─────────────────────────────────────────────────────────
  const handleSave = async () => {
  const fields = MEASUREMENT_FIELDS[selType] || []
  const filled = fields.filter(f => values[f] && values[f] !== '')
  if (filled.length === 0) { toast('Please enter at least one measurement.', 'warning'); return }

  // Convert all values to inches for storage
  const storedValues = {}
  Object.entries(values).forEach(([k, v]) => {
    storedValues[k] = unit === 'cm' ? cmToIn(v) : v
  })

  try {
    await dispatch({
      type: existingMeasurement ? 'UPDATE_MEASUREMENT' : 'ADD_MEASUREMENT',
      payload: {
        employeeId:  selEmp.id,
        uniformType: selType,
        values:      storedValues,
        recordedBy:  user?.id,
      }
    })
    if (selEmp.status === 'pending') {
      await dispatch({ type: 'UPDATE_EMPLOYEE_STATUS', payload: { id: selEmp.id, status: 'measured' } })
    }
    toast(existingMeasurement ? 'Measurement updated!' : 'Measurement saved!', 'success')
    setSelType(null)
    setValues({})
    setStep(2)
  } catch (err) {
    toast('Failed to save: ' + err.message, 'error')
  }
}

  // ── Add employee ─────────────────────────────────────────────────────────────
  const handleAddEmployee = (form) => {
    const hotelEmps = employees.filter(e => e.hotelId === selHotel.id).length
    const empCode = `FF-${selHotel.id.toUpperCase()}-${String(hotelEmps + 1).padStart(3, '0')}`
    const newEmp = {
      id: genId('e'), ...form,
      hotelId: selHotel.id, deptId: selDept.id, empCode, status: 'pending',
    }
    dispatch({ type: 'ADD_EMPLOYEE', payload: newEmp })
    setSelEmp(newEmp)
    setStep(2)
    toast('Employee added!', 'success')
  }

  // ── Step navigation ──────────────────────────────────────────────────────────
  const goBack = () => {
    if (step === 3) { setSelType(null); setValues({}); setStep(2) }
    else if (step === 2) { setSelEmp(null); setStep(1) }
    else if (step === 1) { setSelDept(null); setStep(0) }
    else if (step === 0) { setSelHotel(null) }
  }

  const empMeasurementCount = selEmp
    ? measurements.filter(m => m.employeeId === selEmp.id).length
    : 0

  return (
    <div className="p-4 lg:p-8 space-y-6 fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-surface-900">Take Measurements</h1>
        <p className="text-sm text-surface-500 mt-1">Follow the steps to record uniform measurements.</p>
      </div>

      {/* Steps indicator */}
      <Steps current={step} />

      {/* Breadcrumb trail */}
      {step > 0 && (
        <div className="flex items-center gap-2 text-sm flex-wrap">
          {selHotel && (
            <button onClick={() => { setStep(0); setSelDept(null); setSelEmp(null); setSelType(null) }}
              className="text-brand-600 hover:underline font-medium">{selHotel.name}</button>
          )}
          {selDept && (
            <><ChevronRight size={14} className="text-surface-300" />
            <button onClick={() => { setStep(1); setSelEmp(null); setSelType(null) }}
              className="text-brand-600 hover:underline font-medium">{selDept.name}</button></>
          )}
          {selEmp && (
            <><ChevronRight size={14} className="text-surface-300" />
            <button onClick={() => { setStep(2); setSelType(null) }}
              className="text-brand-600 hover:underline font-medium">{selEmp.name}</button></>
          )}
          {selType && (
            <><ChevronRight size={14} className="text-surface-300" />
            <span className="text-surface-500">{UNIFORM_TYPES.find(u => u.id === selType)?.label}</span></>
          )}
        </div>
      )}

      {/* ── STEP 0: Select Hotel ─────────────────────────────────────────────── */}
      {step === 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-100">
            <h2 className="font-display font-semibold text-surface-800 flex items-center gap-2">
              <Building2 size={17} className="text-brand-600" /> Select Client
            </h2>
          </div>
          <div className="p-2">
            {availableHotels.map(h => (
              <button
                key={h.id}
                onClick={() => { setSelHotel(h); setStep(1) }}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-surface-50 transition-colors text-left group"
              >
                <div>
                  <p className="font-semibold text-surface-800">{h.name}</p>
                  <p className="text-xs text-surface-400">{h.address}</p>
                </div>
                <ChevronRight size={16} className="text-surface-300 group-hover:text-surface-600 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 1: Select Department ────────────────────────────────────────── */}
      {step === 1 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-100">
            <h2 className="font-display font-semibold text-surface-800 flex items-center gap-2">
              <Layers size={17} className="text-brand-600" /> Select Department
            </h2>
          </div>
          {availableDepts.length === 0 ? (
            <div className="p-8 text-center text-sm text-surface-400">No departments found for this client.</div>
          ) : (
            <div className="p-2">
              {availableDepts.map(d => {
                const dCount = employees.filter(e => e.deptId === d.id).length
                return (
                  <button
                    key={d.id}
                    onClick={() => { setSelDept(d); setStep(2) }}
                    className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-surface-50 transition-colors text-left group"
                  >
                    <div>
                      <p className="font-semibold text-surface-800">{d.name}</p>
                      <p className="text-xs text-surface-400">{dCount} employee{dCount !== 1 ? 's' : ''}</p>
                    </div>
                    <ChevronRight size={16} className="text-surface-300 group-hover:text-surface-600 shrink-0" />
                  </button>
                )
              })}
            </div>
          )}
          <div className="px-5 py-3 border-t border-surface-100">
            <button onClick={goBack} className="btn-ghost text-xs">← Back</button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Select Employee ──────────────────────────────────────────── */}
      {step === 2 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-100">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-surface-800 flex items-center gap-2">
                <User size={17} className="text-brand-600" /> Select Employee
              </h2>
              <button onClick={() => setAddEmpModal(true)} className="btn-primary py-1.5 px-3 text-xs">
                <Plus size={13} /> Add New
              </button>
            </div>
            <div className="mt-3 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                className="input pl-8 text-sm"
                placeholder="Search employees…"
                value={empSearch}
                onChange={e => setEmpSearch(e.target.value)}
              />
            </div>
          </div>
          {availableEmps.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-surface-400 mb-3">No employees found.</p>
              <button onClick={() => setAddEmpModal(true)} className="btn-primary text-xs">
                <Plus size={13} /> Add Employee
              </button>
            </div>
          ) : (
            <div className="p-2 max-h-80 overflow-y-auto">
              {availableEmps.map(e => {
                const mCount = measurements.filter(m => m.employeeId === e.id).length
                return (
                  <button
                    key={e.id}
                    onClick={() => { setSelEmp(e); setStep(2); setSelType(null) }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-50 transition-colors text-left group ${selEmp?.id === e.id ? 'bg-brand-50 ring-1 ring-brand-200' : ''}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-surface-100 flex items-center justify-center shrink-0">
                      <User size={15} className="text-surface-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-surface-800 text-sm">{e.name}</p>
                      <p className="text-xs text-surface-400">{e.role} · {e.gender}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`badge text-[11px] ${
                        e.status === 'pending'    ? 'badge-pending' :
                        e.status === 'measured'   ? 'badge-measured' :
                        e.status === 'production' ? 'badge-production' : 'badge-completed'
                      }`}>
                        {e.status === 'pending' ? 'Pending' : e.status === 'measured' ? 'Measured' : e.status === 'production' ? 'In Prod.' : 'Done'}
                      </span>
                      <p className="text-[11px] text-surface-400 mt-0.5">{mCount} records</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Uniform type selection — visible once employee is selected */}
          {selEmp && (
            <div className="border-t border-surface-100 px-5 py-4 bg-surface-50/50">
              <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">
                Select Uniform Type for <span className="text-surface-800">{selEmp.name}</span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {UNIFORM_TYPES.map(u => {
                  const hasMeasurement = measurements.some(m => m.employeeId === selEmp.id && m.uniformType === u.id)
                  return (
                    <button
                      key={u.id}
                      onClick={() => handleSelectType(u.id)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${
                        hasMeasurement
                          ? 'bg-brand-50 border-brand-200 text-brand-700'
                          : 'bg-white border-surface-200 text-surface-700 hover:border-brand-400 hover:bg-brand-50'
                      }`}
                    >
                      <span>{u.label}</span>
                      {hasMeasurement && <Check size={13} className="text-brand-600 shrink-0 ml-1" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="px-5 py-3 border-t border-surface-100">
            <button onClick={goBack} className="btn-ghost text-xs">← Back</button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Enter Measurements ───────────────────────────────────────── */}
      {step === 3 && selType && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-semibold text-surface-800 flex items-center gap-2">
                  <Ruler size={17} className="text-brand-600" />
                  {existingMeasurement ? 'Edit' : 'Enter'} Measurements
                </h2>
                <p className="text-xs text-surface-400 mt-0.5">
                  {selEmp?.name} · {UNIFORM_TYPES.find(u => u.id === selType)?.label}
                </p>
              </div>
              {existingMeasurement && (
                <span className="badge bg-amber-50 text-amber-700 border-amber-200 text-xs">Updating existing</span>
              )}
            </div>
          </div>

          <div className="p-5">
            <MeasurementForm
              uniformTypeId={selType}
              unit={unit}
              onUnitChange={handleUnitChange}
              values={values}
              onChange={handleValueChange}
            />
          </div>

          <div className="px-5 py-4 border-t border-surface-100 bg-surface-50 flex gap-3">
            <button onClick={goBack} className="btn-secondary">← Back</button>
            <button onClick={handleSave} className="btn-primary flex-1 justify-center">
              <Save size={15} /> Save Measurements
            </button>
          </div>
        </div>
      )}

      {/* Quick add employee modal */}
      <Modal isOpen={addEmpModal} onClose={() => setAddEmpModal(false)} title={`Add Employee — ${selDept?.name}`} size="sm">
        <QuickAddEmployee
          hotelId={selHotel?.id}
          deptId={selDept?.id}
          employees={employees}
          onAdd={handleAddEmployee}
          onClose={() => setAddEmpModal(false)}
        />
      </Modal>
    </div>
  )
}

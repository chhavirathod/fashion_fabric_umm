import React, { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/shared/Toast'
import Modal from '../../components/shared/Modal'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import SearchInput from '../../components/shared/SearchInput'
import EmptyState from '../../components/shared/EmptyState'
import { genId, StatusBadge } from '../../utils/helpers'
import { GENDER_OPTIONS, STATUS_OPTIONS } from '../../data/seed'
import { Users, Plus, Pencil, Trash2, User } from 'lucide-react'

function EmployeeForm({ emp, hotels, departments, onSave, onClose }) {
  const [form, setForm] = useState({
    name:    emp?.name    || '',
    gender:  emp?.gender  || 'Male',
    role:    emp?.role    || '',
    hotelId: emp?.hotelId || hotels[0]?.id || '',
    deptId:  emp?.deptId  || '',
    status:  emp?.status  || 'pending',
  })
  const s = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const depts = departments.filter(d => d.hotelId === form.hotelId && d.isActive)

  const handleSave = () => {
    if (!form.name.trim() || !form.hotelId || !form.deptId) return
    onSave(form)
    onClose()
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Full Name *</label>
          <input className="input" value={form.name} onChange={s('name')} placeholder="Employee name" />
        </div>
        <div>
          <label className="label">Gender</label>
          <div className="flex gap-2 mt-1">
            {GENDER_OPTIONS.map(g => (
              <label key={g} className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="gender" value={g} checked={form.gender === g}
                  onChange={s('gender')} className="accent-brand-700" />
                <span className="text-sm text-surface-700">{g}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={s('status')}>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="label">Role / Designation *</label>
          <input className="input" value={form.role} onChange={s('role')} placeholder="e.g. Head Chef, Receptionist" />
        </div>
        <div>
          <label className="label">Client / Hotel *</label>
          <select className="input" value={form.hotelId} onChange={e => setForm(f => ({ ...f, hotelId: e.target.value, deptId: '' }))}>
            <option value="">Select client…</option>
            {hotels.filter(h => h.isActive).map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Department *</label>
          <select className="input" value={form.deptId} onChange={s('deptId')} disabled={!form.hotelId}>
            <option value="">Select dept…</option>
            {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
        <button className="btn-primary flex-1" onClick={handleSave}
          disabled={!form.name.trim() || !form.hotelId || !form.deptId}>
          {emp ? 'Save Changes' : 'Add Employee'}
        </button>
      </div>
    </div>
  )
}

export default function EmployeesPage() {
  const { state, dispatch } = useApp()
  const { hotels, departments, employees, measurements } = state
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [filterHotel, setFilterHotel] = useState('all')
  const [filterDept, setFilterDept]   = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const [empModal, setEmpModal]       = useState({ open: false, emp: null })
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null })

  const filteredDepts = filterHotel === 'all' ? departments : departments.filter(d => d.hotelId === filterHotel)

  const filtered = useMemo(() => {
    return employees.filter(e => {
      const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.empCode.toLowerCase().includes(search.toLowerCase())
      const matchHotel  = filterHotel === 'all'  || e.hotelId === filterHotel
      const matchDept   = filterDept  === 'all'  || e.deptId  === filterDept
      const matchStatus = filterStatus === 'all' || e.status  === filterStatus
      return matchSearch && matchHotel && matchDept && matchStatus
    })
  }, [employees, search, filterHotel, filterDept, filterStatus])

  const handleSave = (form) => {
    if (empModal.emp) {
      dispatch({ type: 'UPDATE_EMPLOYEE', payload: { ...empModal.emp, ...form } })
      toast('Employee updated.', 'success')
    } else {
      const hotelEmps = employees.filter(e => e.hotelId === form.hotelId).length
      const empCode = `FF-${form.hotelId.toUpperCase()}-${String(hotelEmps + 1).padStart(3, '0')}`
      dispatch({ type: 'ADD_EMPLOYEE', payload: { id: genId('e'), ...form, empCode } })
      toast('Employee added!', 'success')
    }
  }

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_EMPLOYEE', payload: id })
    toast('Employee removed.', 'info')
  }

  const handleStatusChange = (emp, status) => {
    dispatch({ type: 'UPDATE_EMPLOYEE_STATUS', payload: { id: emp.id, status } })
    toast('Status updated.', 'success')
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-2xl text-surface-900">Employees</h1>
          <p className="text-sm text-surface-500 mt-1">{employees.length} staff across all clients.</p>
        </div>
        <button className="btn-primary" onClick={() => setEmpModal({ open: true, emp: null })}>
          <Plus size={16} /> Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Name or code…" className="w-52" />
        <select className="input w-auto" value={filterHotel} onChange={e => { setFilterHotel(e.target.value); setFilterDept('all') }}>
          <option value="all">All Clients</option>
          {hotels.filter(h => h.isActive).map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
        <select className="input w-auto" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="all">All Departments</option>
          {filteredDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select className="input w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No employees found" description="Adjust filters or add a new employee." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Employee</th>
                  <th className="table-th">Code</th>
                  <th className="table-th">Client</th>
                  <th className="table-th">Department</th>
                  <th className="table-th">Gender</th>
                  <th className="table-th">Measurements</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => {
                  const hotel = hotels.find(h => h.id === e.hotelId)
                  const dept  = departments.find(d => d.id === e.deptId)
                  const mCount = measurements.filter(m => m.employeeId === e.id).length
                  return (
                    <tr key={e.id} className="hover:bg-surface-50 transition-colors">
                      <td className="table-td">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-surface-100 flex items-center justify-center shrink-0">
                            <User size={14} className="text-surface-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-surface-800">{e.name}</p>
                            <p className="text-xs text-surface-400">{e.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-td font-mono text-xs text-surface-500">{e.empCode}</td>
                      <td className="table-td text-xs text-surface-600">{hotel?.name || '—'}</td>
                      <td className="table-td text-xs text-surface-600">{dept?.name  || '—'}</td>
                      <td className="table-td text-xs text-surface-500">{e.gender}</td>
                      <td className="table-td">
                        <span className="font-mono text-xs font-semibold text-surface-700 bg-surface-100 px-2 py-0.5 rounded-md">{mCount}</span>
                      </td>
                      <td className="table-td">
                        <select
                          value={e.status}
                          onChange={ev => handleStatusChange(e, ev.target.value)}
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
                      <td className="table-td">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setEmpModal({ open: true, emp: e })} className="btn-ghost p-1.5" title="Edit">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setDeleteConfirm({ open: true, id: e.id })} className="btn-ghost p-1.5 hover:text-red-600 hover:bg-red-50" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-surface-100 bg-surface-50">
            <p className="text-xs text-surface-400">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      )}

      <Modal isOpen={empModal.open} onClose={() => setEmpModal({ open: false, emp: null })}
        title={empModal.emp ? 'Edit Employee' : 'Add Employee'}>
        <EmployeeForm
          emp={empModal.emp}
          hotels={hotels}
          departments={departments}
          onSave={handleSave}
          onClose={() => setEmpModal({ open: false, emp: null })}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null })}
        onConfirm={() => handleDelete(deleteConfirm.id)}
        title="Delete Employee"
        message="This will permanently remove the employee and all their measurement data."
        danger
      />
    </div>
  )
}

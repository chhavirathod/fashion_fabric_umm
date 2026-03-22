import React, { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/shared/Toast'
import Modal from '../../components/shared/Modal'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import SearchInput from '../../components/shared/SearchInput'
import EmptyState from '../../components/shared/EmptyState'
import { genId } from '../../utils/helpers'
import { VERTICALS, DEPT_PRESETS } from '../../data/seed'
import {
  Building2, Plus, Pencil, ToggleLeft, ToggleRight,
  ChevronDown, ChevronRight, Layers, Hash, Phone, MapPin, Trash2
} from 'lucide-react'

// ─── Hotel Form Modal ──────────────────────────────────────────────────────────
function HotelForm({ hotel, onSave, onClose }) {
  const [form, setForm] = useState({
    name: hotel?.name || '',
    address: hotel?.address || '',
    contact: hotel?.contact || '',
    vertical: hotel?.vertical || 'hospitality',
  })
  const s = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = () => {
    if (!form.name.trim()) return
    onSave({ ...form })
    onClose()
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Client / Hotel Name *</label>
        <input className="input" value={form.name} onChange={s('name')} placeholder="e.g. The Oberoi Grand" />
      </div>
      <div>
        <label className="label">Industry Vertical *</label>
        <select className="input" value={form.vertical} onChange={s('vertical')}>
          {VERTICALS.map(v => (
            <option key={v.id} value={v.id}>{v.icon} {v.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Address</label>
        <input className="input" value={form.address} onChange={s('address')} placeholder="Street, City" />
      </div>
      <div>
        <label className="label">Contact</label>
        <input className="input" value={form.contact} onChange={s('contact')} placeholder="+91 …" />
      </div>
      <div className="flex gap-3 pt-2">
        <button className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
        <button className="btn-primary flex-1" onClick={handleSave} disabled={!form.name.trim()}>
          {hotel ? 'Save Changes' : 'Add Client'}
        </button>
      </div>
    </div>
  )
}

// ─── Department Form ───────────────────────────────────────────────────────────
function DeptForm({ dept, hotelVertical, hotelId, onSave, onClose }) {
  const presets = DEPT_PRESETS[hotelVertical] || []
  const [name, setName] = useState(dept?.name || '')

  const handleSave = () => {
    if (!name.trim()) return
    onSave(name.trim())
    onClose()
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Department Name *</label>
        <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Front Desk" />
      </div>
      {presets.length > 0 && (
        <div>
          <label className="label">Quick Add from Presets</label>
          <div className="flex flex-wrap gap-2">
            {presets.map(p => (
              <button key={p} type="button"
                onClick={() => setName(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${name === p ? 'bg-brand-700 text-white border-brand-700' : 'bg-white text-surface-600 border-surface-200 hover:border-brand-400'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-3 pt-2">
        <button className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
        <button className="btn-primary flex-1" onClick={handleSave} disabled={!name.trim()}>
          {dept ? 'Save Changes' : 'Add Department'}
        </button>
      </div>
    </div>
  )
}

// ─── Hotel Row (accordion) ─────────────────────────────────────────────────────
function HotelRow({ hotel, departments, employees, onEditHotel, onToggleHotel, onAddDept, onEditDept, onToggleDept }) {
  const [open, setOpen] = useState(false)
  const vert = VERTICALS.find(v => v.id === hotel.vertical)
  const hotelDepts = departments.filter(d => d.hotelId === hotel.id)
  const hotelEmps  = employees.filter(e => e.hotelId === hotel.id)

  return (
    <div className={`card overflow-hidden transition-all ${!hotel.isActive ? 'opacity-60' : ''}`}>
      {/* Hotel header */}
      <div className="px-5 py-4 flex items-center gap-4">
        <button onClick={() => setOpen(v => !v)} className="text-surface-400 hover:text-surface-600 transition-colors shrink-0">
          {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-semibold text-surface-900">{hotel.name}</h3>
            {vert && <span className={`badge text-[11px] ${vert.color}`}>{vert.icon} {vert.label}</span>}
            {!hotel.isActive && <span className="badge bg-surface-100 text-surface-500 border border-surface-200 text-[11px]">Archived</span>}
          </div>
          <div className="flex items-center gap-4 mt-1 flex-wrap">
            {hotel.address && <span className="flex items-center gap-1 text-xs text-surface-400"><MapPin size={11} />{hotel.address}</span>}
            {hotel.contact && <span className="flex items-center gap-1 text-xs text-surface-400"><Phone size={11} />{hotel.contact}</span>}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-surface-700">{hotelDepts.length} depts</p>
            <p className="text-xs text-surface-400">{hotelEmps.length} employees</p>
          </div>
          <button onClick={() => onEditHotel(hotel)} className="btn-ghost p-2" title="Edit"><Pencil size={15} /></button>
          <button onClick={() => onToggleHotel(hotel.id)} className="btn-ghost p-2" title={hotel.isActive ? 'Archive' : 'Restore'}>
            {hotel.isActive ? <ToggleRight size={18} className="text-brand-600" /> : <ToggleLeft size={18} className="text-surface-400" />}
          </button>
        </div>
      </div>

      {/* Departments accordion */}
      {open && (
        <div className="border-t border-surface-100 bg-surface-50/50 px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={13} /> Departments
            </p>
            <button onClick={() => onAddDept(hotel)} className="btn-primary py-1.5 px-3 text-xs">
              <Plus size={13} /> Add Dept
            </button>
          </div>
          {hotelDepts.length === 0 ? (
            <p className="text-sm text-surface-400 text-center py-4">No departments yet. Add one to get started.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {hotelDepts.map(d => {
                const deptEmps = employees.filter(e => e.deptId === d.id)
                return (
                  <div key={d.id} className={`flex items-center justify-between p-3 rounded-xl bg-white border border-surface-200 ${!d.isActive ? 'opacity-60' : ''}`}>
                    <div>
                      <p className="text-sm font-semibold text-surface-800">{d.name}</p>
                      <p className="text-xs text-surface-400 flex items-center gap-1"><Hash size={10} />{deptEmps.length} staff</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => onEditDept(d, hotel)} className="btn-ghost p-1.5" title="Edit"><Pencil size={13} /></button>
                      <button onClick={() => onToggleDept(d.id)} className="btn-ghost p-1.5" title={d.isActive ? 'Archive' : 'Restore'}>
                        {d.isActive ? <ToggleRight size={16} className="text-brand-600" /> : <ToggleLeft size={16} />}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Hotels Page ──────────────────────────────────────────────────────────
export default function HotelsPage() {
  const { state, dispatch } = useApp()
  const { hotels, departments, employees } = state
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [filterVertical, setFilterVertical] = useState('all')
  const [filterActive, setFilterActive] = useState('active')

  const [hotelModal, setHotelModal] = useState({ open: false, hotel: null })
  const [deptModal, setDeptModal] = useState({ open: false, dept: null, hotel: null })

  const filtered = useMemo(() => {
    return hotels.filter(h => {
      const matchSearch = h.name.toLowerCase().includes(search.toLowerCase())
      const matchVert = filterVertical === 'all' || h.vertical === filterVertical
      const matchActive = filterActive === 'all' || (filterActive === 'active' ? h.isActive : !h.isActive)
      return matchSearch && matchVert && matchActive
    })
  }, [hotels, search, filterVertical, filterActive])

  // ── Hotel handlers ───────────────────────────────────────────────────────────
  const handleSaveHotel = (form) => {
    if (hotelModal.hotel) {
      dispatch({ type: 'UPDATE_HOTEL', payload: { ...hotelModal.hotel, ...form } })
      toast('Client updated.', 'success')
    } else {
      dispatch({ type: 'ADD_HOTEL', payload: { id: genId('h'), ...form, isActive: true, createdAt: new Date().toISOString() } })
      toast('Client added!', 'success')
    }
  }
  const handleToggleHotel = (id) => {
    dispatch({ type: 'TOGGLE_HOTEL_ACTIVE', payload: id })
    toast('Client status updated.', 'info')
  }

  // ── Dept handlers ────────────────────────────────────────────────────────────
  const handleSaveDept = (name) => {
    if (deptModal.dept) {
      dispatch({ type: 'UPDATE_DEPARTMENT', payload: { ...deptModal.dept, name } })
      toast('Department updated.', 'success')
    } else {
      dispatch({ type: 'ADD_DEPARTMENT', payload: { id: genId('d'), hotelId: deptModal.hotel.id, name, isActive: true } })
      toast('Department added!', 'success')
    }
  }
  const handleToggleDept = (id) => {
    dispatch({ type: 'TOGGLE_DEPT_ACTIVE', payload: id })
    toast('Department status updated.', 'info')
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-2xl text-surface-900">Clients & Hotels</h1>
          <p className="text-sm text-surface-500 mt-1">Manage all client accounts and their departments.</p>
        </div>
        <button className="btn-primary" onClick={() => setHotelModal({ open: true, hotel: null })}>
          <Plus size={16} /> Add Client
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search clients…" className="w-60" />
        <select className="input w-auto" value={filterVertical} onChange={e => setFilterVertical(e.target.value)}>
          <option value="all">All Verticals</option>
          {VERTICALS.map(v => <option key={v.id} value={v.id}>{v.icon} {v.label}</option>)}
        </select>
        <select className="input w-auto" value={filterActive} onChange={e => setFilterActive(e.target.value)}>
          <option value="active">Active Only</option>
          <option value="archived">Archived</option>
          <option value="all">All</option>
        </select>
      </div>

      {/* Hotel list */}
      {filtered.length === 0 ? (
        <EmptyState icon={Building2} title="No clients found" description="Try adjusting your filters or add a new client." />
      ) : (
        <div className="space-y-3">
          {filtered.map(h => (
            <HotelRow
              key={h.id}
              hotel={h}
              departments={departments}
              employees={employees}
              onEditHotel={(hotel) => setHotelModal({ open: true, hotel })}
              onToggleHotel={handleToggleHotel}
              onAddDept={(hotel) => setDeptModal({ open: true, dept: null, hotel })}
              onEditDept={(dept, hotel) => setDeptModal({ open: true, dept, hotel })}
              onToggleDept={handleToggleDept}
            />
          ))}
        </div>
      )}

      {/* Hotel modal */}
      <Modal
        isOpen={hotelModal.open}
        onClose={() => setHotelModal({ open: false, hotel: null })}
        title={hotelModal.hotel ? 'Edit Client' : 'Add New Client'}
      >
        <HotelForm
          hotel={hotelModal.hotel}
          onSave={handleSaveHotel}
          onClose={() => setHotelModal({ open: false, hotel: null })}
        />
      </Modal>

      {/* Department modal */}
      <Modal
        isOpen={deptModal.open}
        onClose={() => setDeptModal({ open: false, dept: null, hotel: null })}
        title={deptModal.dept ? 'Edit Department' : `Add Department — ${deptModal.hotel?.name}`}
      >
        <DeptForm
          dept={deptModal.dept}
          hotelVertical={deptModal.hotel?.vertical}
          hotelId={deptModal.hotel?.id}
          onSave={handleSaveDept}
          onClose={() => setDeptModal({ open: false, dept: null, hotel: null })}
        />
      </Modal>
    </div>
  )
}

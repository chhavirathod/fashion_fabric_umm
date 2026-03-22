import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

// ─── Unit Conversion ──────────────────────────────────────────────────────────
export const inToCm = (val) => {
  const n = parseFloat(val)
  return isNaN(n) ? '' : (n * 2.54).toFixed(1)
}
export const cmToIn = (val) => {
  const n = parseFloat(val)
  return isNaN(n) ? '' : (n / 2.54).toFixed(2)
}
export const convertValue = (val, fromUnit, toUnit) => {
  if (fromUnit === toUnit || !val) return val
  return fromUnit === 'in' ? inToCm(val) : cmToIn(val)
}

// ─── ID Generators ────────────────────────────────────────────────────────────
export const genId = (prefix = '') =>
  `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

export const genEmpCode = (hotelId, existingCount) => {
  const num = String(existingCount + 1).padStart(3, '0')
  return `FF-${hotelId.toUpperCase()}-${num}`
}

// ─── Status Helpers ───────────────────────────────────────────────────────────
export const STATUS_META = {
  pending:    { label: 'Pending',        className: 'badge-pending' },
  measured:   { label: 'Measured',       className: 'badge-measured' },
  production: { label: 'In Production',  className: 'badge-production' },
  completed:  { label: 'Completed',      className: 'badge-completed' },
}

export const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.pending
  return <span className={`badge ${meta.className}`}>{meta.label}</span>
}

// ─── Date Formatter ───────────────────────────────────────────────────────────
export const fmtDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
export const fmtDateTime = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ─── Export Helpers ───────────────────────────────────────────────────────────
export const exportToCSV = (rows, filename = 'export.csv') => {
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Measurements')
  const csvData = XLSX.utils.sheet_to_csv(ws)
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, filename)
}

export const exportToExcel = (rows, filename = 'export.xlsx', sheetName = 'Measurements') => {
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([buf], { type: 'application/octet-stream' })
  saveAs(blob, filename)
}

// ─── Build flat export rows from state ────────────────────────────────────────
export const buildExportRows = ({ hotels, departments, employees, measurements, filters = {} }) => {
  const rows = []
  measurements.forEach(m => {
    const emp = employees.find(e => e.id === m.employeeId)
    if (!emp) return
    if (filters.hotelId && emp.hotelId !== filters.hotelId) return
    if (filters.deptId && emp.deptId !== filters.deptId) return
    if (filters.status && emp.status !== filters.status) return
    const dept  = departments.find(d => d.id === emp.deptId)
    const hotel = hotels.find(h => h.id === emp.hotelId)
    const base = {
      'Hotel':        hotel?.name || '—',
      'Department':   dept?.name  || '—',
      'Emp Code':     emp.empCode,
      'Employee':     emp.name,
      'Gender':       emp.gender,
      'Role':         emp.role,
      'Status':       STATUS_META[emp.status]?.label || emp.status,
      'Uniform Type': m.uniformType,
      'Unit':         m.unit === 'in' ? 'Inches' : 'CM',
      'Recorded At':  fmtDateTime(m.recordedAt),
      'Recorded By':  m.recordedBy,
    }
    Object.entries(m.values).forEach(([k, v]) => { base[k] = v })
    rows.push(base)
  })
  return rows
}

import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/shared/Toast'
import { exportToCSV, exportToExcel, buildExportRows } from '../../utils/helpers'
import { STATUS_OPTIONS, UNIFORM_TYPES } from '../../data/seed'
import { Download, FileSpreadsheet, FileText, Printer } from 'lucide-react'

export default function ExportPage() {
  const { state } = useApp()
  const { hotels, departments, employees, measurements } = state
  const toast = useToast()

  const [filters, setFilters] = useState({ hotelId: '', deptId: '', status: '' })
  const s = (k) => (e) => setFilters(f => ({ ...f, [k]: e.target.value }))

  const filteredDepts = filters.hotelId
    ? departments.filter(d => d.hotelId === filters.hotelId && d.isActive)
    : []

  const previewRows = buildExportRows({ hotels, departments, employees, measurements, filters: {
    hotelId: filters.hotelId || undefined,
    deptId:  filters.deptId  || undefined,
    status:  filters.status  || undefined,
  }})

  const fileName = () => {
    const hotel = hotels.find(h => h.id === filters.hotelId)
    const dept  = departments.find(d => d.id === filters.deptId)
    const parts = ['UMMS', hotel?.name || 'AllClients', dept?.name || 'AllDepts', new Date().toISOString().slice(0, 10)]
    return parts.join('_').replace(/\s+/g, '-')
  }

  const handleCSV = () => {
    if (!previewRows.length) { toast('No data to export.', 'warning'); return }
    exportToCSV(previewRows, fileName() + '.csv')
    toast(`Exported ${previewRows.length} rows as CSV.`, 'success')
  }

  const handleExcel = () => {
    if (!previewRows.length) { toast('No data to export.', 'warning'); return }
    const hotel = hotels.find(h => h.id === filters.hotelId)
    exportToExcel(previewRows, fileName() + '.xlsx', hotel?.name || 'Measurements')
    toast(`Exported ${previewRows.length} rows as Excel.`, 'success')
  }

  const handlePrint = () => window.print()

  return (
    <div className="p-6 lg:p-8 space-y-8 fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-surface-900">Export Data</h1>
        <p className="text-sm text-surface-500 mt-1">Download measurement sheets filtered by client, department or status.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Filters */}
        <div className="lg:col-span-1 card p-5 space-y-4">
          <h2 className="font-display font-semibold text-surface-800">Filter Options</h2>

          <div>
            <label className="label">Client / Hotel</label>
            <select className="input" value={filters.hotelId} onChange={e => setFilters(f => ({ ...f, hotelId: e.target.value, deptId: '' }))}>
              <option value="">All Clients</option>
              {hotels.filter(h => h.isActive).map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Department</label>
            <select className="input" value={filters.deptId} onChange={s('deptId')} disabled={!filters.hotelId}>
              <option value="">All Departments</option>
              {filteredDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            {!filters.hotelId && <p className="text-xs text-surface-400 mt-1">Select a client first.</p>}
          </div>

          <div>
            <label className="label">Order Status</label>
            <select className="input" value={filters.status} onChange={s('status')}>
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="pt-2 border-t border-surface-100">
            <p className="text-sm font-semibold text-surface-700 mb-3">
              {previewRows.length} row{previewRows.length !== 1 ? 's' : ''} will be exported
            </p>
            <div className="space-y-2">
              <button onClick={handleExcel} className="btn-primary w-full justify-center">
                <FileSpreadsheet size={16} /> Download Excel (.xlsx)
              </button>
              <button onClick={handleCSV} className="btn-secondary w-full justify-center">
                <FileText size={16} /> Download CSV
              </button>
              <button onClick={handlePrint} className="btn-secondary w-full justify-center no-print">
                <Printer size={16} /> Print Preview
              </button>
            </div>
          </div>
        </div>

        {/* Preview table */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
            <h2 className="font-display font-semibold text-surface-800">Data Preview</h2>
            <span className="text-xs text-surface-400 font-mono">{previewRows.length} rows</span>
          </div>
          {previewRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Download size={28} className="text-surface-300 mb-3" />
              <p className="text-sm text-surface-400">No data matches the current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-xs">
                <thead className="sticky top-0 z-10">
                  <tr>
                    {Object.keys(previewRows[0]).map(k => (
                      <th key={k} className="table-th whitespace-nowrap">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.slice(0, 50).map((row, i) => (
                    <tr key={i} className="hover:bg-surface-50 transition-colors">
                      {Object.values(row).map((v, j) => (
                        <td key={j} className="table-td whitespace-nowrap font-mono">{v || '—'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewRows.length > 50 && (
                <p className="text-xs text-surface-400 text-center py-3 border-t border-surface-100">
                  Showing first 50 of {previewRows.length} rows. All rows included in download.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

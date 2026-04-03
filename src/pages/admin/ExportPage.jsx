import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/shared/Toast'
import { buildExportRows } from '../../utils/helpers'
import { generateExportData, parseImportFile } from '../../utils/excel'
import { STATUS_OPTIONS, UNIFORM_TYPES, MEASUREMENT_FIELDS } from '../../data/seed'
import { Download, Upload } from 'lucide-react'

export default function ExportPage() {
  const { state, dispatch } = useApp()
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
    const now = new Date()
    const date = now.toISOString().slice(0, 10)
    const time = now.toTimeString().slice(0, 8).replace(/:/g, '-')
    const parts = ['UMMS', hotel?.name || 'AllClients', dept?.name || 'AllDepts', `${date}_${time}`]
    return parts.join('_').replace(/\s+/g, '-')
  }

  const handleDownloadTemplate = () => {
    toast('Generating Master Excel...', 'info')
    generateExportData({
      hotels,
      departments,
      employees,
      measurements,
      filename: fileName() + '.xlsx',
      filters: {
        hotelId: filters.hotelId || undefined,
        deptId: filters.deptId || undefined,
        status: filters.status || undefined,
      }
    })
      .then(() => {
        toast(`Master file downloaded (${fileName()}.xlsx).`, 'success')
      })
      .catch(e => {
        console.error(e)
        toast('Error generating export: ' + (e.message || 'Unknown'), 'error')
      })
  }

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      toast('Importing...', 'info')
      const sheetsData = await parseImportFile(file)
      if (sheetsData.length === 0) throw new Error("No valid client data found in the template.")
      
      let importedEmps = 0
      let failed = 0
      
      for (const sheet of sheetsData) {
        const { hotelId, rows } = sheet
        const hotel = hotels.find(h => h.id === hotelId)
        if (!hotel) {
          failed += rows.length
          continue
        }

        for (const row of rows) {
          try {
            const empName = row['Employee Name']
            const deptName = row['Department']
            const uniformType = row['Uniform Type'] // Now directly the id from new format
            const rawUnit = String(row['Unit (in/cm)'] || 'in').toLowerCase()
            const unit = rawUnit.includes('cm') ? 'cm' : 'in'

            let dept = departments.find(d => d.hotelId === hotelId && (d.name.toLowerCase() === deptName?.toLowerCase()))
            if (!dept && deptName) {
              dept = await dispatch({ type: 'ADD_DEPARTMENT', payload: { hotelId, name: deptName, isActive: true } })
            }
            if (!dept) throw new Error("Missing department")

            let newEmp = employees.find(e => e.hotelId === hotelId && e.name.toLowerCase() === empName.toLowerCase())
            if (!newEmp) {
              newEmp = await dispatch({ type: 'ADD_EMPLOYEE', payload: {
                hotelId, deptId: dept.id, name: empName,
                gender: row['Gender'] || 'Other',
                role: row['Role'] || 'Staff',
                status: 'measured'
              }})
              employees.push(newEmp)
            }

            const values = {}
            const possibleFields = MEASUREMENT_FIELDS[uniformType] || []
            possibleFields.forEach(f => {
              if (row[f] && row[f] !== '') values[f] = String(row[f])
            })

            if (Object.keys(values).length > 0) {
              await dispatch({ type: 'ADD_MEASUREMENT', payload: {
                employeeId: newEmp.id,
                uniformType,
                values,
                recordedBy: 'admin1'
              }})
            }
            importedEmps++
          } catch (err) {
            console.error(err)
            failed++
          }
        } // end for row
      } // end for sheet
      toast(`Imported ${importedEmps} employees. ${failed ? `${failed} failed.` : ''}`, 'success')
    } catch (err) {
      toast(err.message || 'Error parsing file. Check template format.', 'error')
    } finally {
      e.target.value = ''
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-surface-900">Import / Export Data</h1>
        <p className="text-sm text-surface-500 mt-1">Import new measurements using Excel templates or download existing data.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          {/* Import Card */}
          <div className="card p-5 space-y-4">
            <h2 className="font-display font-semibold text-surface-800 border-b border-surface-100 pb-2">Batch Import Measurements</h2>
            <div>
              <label className="label">Step 1: Download Master File</label>
              <p className="text-xs text-surface-400 mb-3">Choose filters (or keep All) and download a master Excel template for those records.</p>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="label">Client / Hotel (Optional)</label>
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
              </div>

              <button className="btn-secondary w-full justify-center" onClick={handleDownloadTemplate}>
                <Download size={16} /> Download Master File
              </button>
            </div>

            <div>
              <label className="label">Step 2: Upload Completed Template</label>
              <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-brand-200 rounded-xl bg-brand-50 hover:bg-brand-100 transition-colors cursor-pointer text-brand-700 font-medium text-sm">
                <Upload size={18} className="mr-2" /> Upload Excel File
                <input type="file" className="hidden" accept=".xlsx" onChange={handleImport} />
              </label>
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

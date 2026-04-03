import React, { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { ChevronLeft, Layers, Download } from 'lucide-react'
import { generateExportData } from '../../utils/excel'
import UnitToggle from '../../components/shared/UnitToggle'
import EmptyState from '../../components/shared/EmptyState'
import { UNIFORM_TYPES, VERTICALS } from '../../data/seed'

export default function AdminClientDetail() {
  const { hotelId } = useParams()
  const navigate = useNavigate()
  const { state } = useApp()
  const { hotels, departments, employees, measurements } = state
  const [selectedDept, setSelectedDept] = useState(null)
  const [unit, setUnit] = useState('in')

  const hotel = useMemo(() => hotels.find(h => h.id === hotelId), [hotels, hotelId])
  const hotelDepts = useMemo(() => {
    return departments.filter(d => d.hotelId === hotelId && d.isActive)
  }, [departments, hotelId])
  
  const deptMeasurements = useMemo(() => {
    if (!selectedDept) return []
    const deptEmps = employees.filter(e => e.deptId === selectedDept.id)
    const deptEmpIds = deptEmps.map(e => e.id)
    return measurements.filter(m => deptEmpIds.includes(m.employeeId))
  }, [selectedDept, employees, measurements])

  const groupedByType = useMemo(() => {
    const grouped = {}
    deptMeasurements.forEach(m => {
      if (!grouped[m.uniformType]) {
        grouped[m.uniformType] = []
      }
      grouped[m.uniformType].push(m)
    })
    return grouped
  }, [deptMeasurements])

  const handleExport = (format) => {
    if (!selectedDept) return
    if (format !== 'xlsx') return

    generateExportData({
      hotels,
      departments,
      employees,
      measurements,
      filters: {
        hotelId: hotelId,
        deptId: selectedDept.id,
      },
      filename: `${hotel.name}_${selectedDept.name}_${new Date().toISOString().slice(0, 10)}.xlsx`,
    })
  }

  if (!hotel) {
    return (
      <div className="p-6 lg:p-8">
        <EmptyState title="Client not found" description="The client you're looking for doesn't exist." />
      </div>
    )
  }

  const vert = VERTICALS.find(v => v.id === hotel.vertical)

  return (
    <div className="p-6 lg:p-8 space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin')}
          className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="font-display font-bold text-3xl text-surface-900">{hotel.name}</h1>
          {vert && (
            <span className={`inline-block badge text-[11px] mt-2 ${vert.color}`}>
              {vert.icon} {vert.label}
            </span>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Departments List */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="px-5 py-4 border-b border-surface-100">
              <h2 className="font-display font-semibold text-surface-800 flex items-center gap-2">
                <Layers size={16} /> Departments
              </h2>
              <p className="text-xs text-surface-400 mt-1">{hotelDepts.length} total</p>
            </div>
            {hotelDepts.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-surface-400">No departments</p>
              </div>
            ) : (
              <div className="divide-y divide-surface-100">
                {hotelDepts.map(dept => (
                  <button
                    key={dept.id}
                    onClick={() => setSelectedDept(dept)}
                    className={`w-full text-left px-5 py-3 transition-colors ${
                      selectedDept?.id === dept.id
                        ? 'bg-brand-50 border-l-3 border-brand-600'
                        : 'hover:bg-surface-50 border-l-3 border-transparent'
                    }`}
                  >
                    <p className="font-semibold text-sm text-surface-800">{dept.name}</p>
                    <p className="text-xs text-surface-400 mt-0.5">
                      {employees.filter(e => e.deptId === dept.id).length} employees
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Measurements View */}
        <div className="lg:col-span-3">
          {!selectedDept ? (
            <EmptyState title="Select a department" description="Choose a department to view measurements." />
          ) : deptMeasurements.length === 0 ? (
            <EmptyState title="No measurements" description="This department has no recorded measurements yet." />
          ) : (
            <div className="space-y-6">
              {/* Export Controls */}
              <div className="card p-4 bg-brand-50 border border-brand-200 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="font-semibold text-surface-800">Export Measurements</p>
                  <p className="text-xs text-surface-600 mt-0.5">{deptMeasurements.length} entries from {selectedDept.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExport('xlsx')}
                    className="btn-primary text-xs py-1.5 px-3 flex items-center gap-2"
                  >
                    <Download size={14} /> Excel
                  </button>
                </div>
              </div>

              {/* Measurements by Uniform Type */}
              <div className="space-y-4">
                {Object.entries(groupedByType).map(([typeId, typeMeasurements]) => {
                  const uType = UNIFORM_TYPES.find(u => u.id === typeId)
                  return (
                    <div key={typeId} className="card overflow-hidden">
                      <div className="px-5 py-4 border-b border-surface-100 bg-surface-50">
                        <h3 className="font-semibold text-surface-800">
                          {uType?.label || typeId}
                        </h3>
                        <p className="text-xs text-surface-400 mt-1">
                          {typeMeasurements.length} measurements
                        </p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-surface-100 bg-surface-50">
                              <th className="text-left px-4 py-2.5 font-semibold text-surface-700">Employee</th>
                              <th className="text-left px-4 py-2.5 font-semibold text-surface-700">Role</th>
                              {Object.keys(typeMeasurements[0]?.values || {}).map(field => (
                                <th
                                  key={field}
                                  className="text-center px-4 py-2.5 font-semibold text-surface-700 whitespace-nowrap"
                                >
                                  {field} ({unit})
                                </th>
                              ))}
                              <th className="text-center px-4 py-2.5 font-semibold text-surface-700">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {typeMeasurements.map(m => {
                              const emp = employees.find(e => e.id === m.employeeId)
                              return (
                                <tr key={m.id} className="border-b border-surface-100 hover:bg-surface-50">
                                  <td className="px-4 py-2.5 font-semibold text-surface-800">
                                    {emp?.name || '—'}
                                  </td>
                                  <td className="px-4 py-2.5 text-surface-600">
                                    {emp?.role || '—'}
                                  </td>
                          {Object.entries(m.values).map(([field, val]) => {
                                    let displayVal = val
                                    // m.unit is always 'in', values[field] is in inches
                                    if (unit === 'cm') {
                                      displayVal = (parseFloat(val) * 2.54).toFixed(1)
                                    } else {
                                      displayVal = parseFloat(val).toFixed(2)
                                    }
                                    return (
                                      <td
                                        key={field}
                                        className="text-center px-4 py-2.5 font-mono text-surface-700"
                                      >
                                        {displayVal}
                                      </td>
                                    )
                                  })}
                                  <td className="text-center px-4 py-2.5 text-xs text-surface-500">
                                    {new Date(m.recordedAt).toLocaleDateString()}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

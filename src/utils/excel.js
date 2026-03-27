import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { MEASUREMENT_FIELDS, UNIFORM_TYPES } from '../data/seed'

export async function generateExportData({ hotels, departments, employees, measurements }) {
  const wb = new ExcelJS.Workbook()
  const allFields = [...new Set(Object.values(MEASUREMENT_FIELDS).flat())]

  const activeHotels = hotels.filter(h => h.isActive)
  for (const hotel of activeHotels) {
    let baseName = (hotel.name || 'Client').replace(/[*?:/\\[\]]/g, '').trim()
    let sheetName = `${baseName.substring(0, 25)}_${hotel.id.substring(0, 4)}`
    const ws = wb.addWorksheet(sheetName)
    
    const columns = [
      { header: 'Employee Name', key: 'name', width: 25 },
      { header: 'Gender (Male/Female/Other)', key: 'gender', width: 20 },
      { header: 'Role (e.g. Receptionist)', key: 'role', width: 25 },
      { header: 'Department', key: 'department', width: 25 },
      { header: 'Uniform Type', key: 'uniformType', width: 25 },
      { header: 'Unit (in/cm)', key: 'unit', width: 15 },
      ...allFields.map(f => ({ header: f, key: f, width: 15 }))
    ]

    ws.columns = columns
    ws.spliceRows(1, 0, [])
    ws.spliceRows(1, 0, [])

    ws.mergeCells('A1:K1')
    const titleCell = ws.getCell('A1')
    titleCell.value = `Client Name: ${hotel.name} [ID: ${hotel.id}]`
    titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } }
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0f172a' } }
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' }
    ws.getRow(1).height = 40

    ws.mergeCells('A2:K2')
    const instCell = ws.getCell('A2')
    instCell.value = 'Instructions: Do not modify Row 1 or Headers. Fill in details. For Uniform Type see system labels.'
    instCell.font = { italic: true, color: { argb: 'FF475569' } }
    instCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } }
    instCell.alignment = { vertical: 'middle', horizontal: 'left' }
    ws.getRow(2).height = 30

    const headerRow = ws.getRow(3)
    headerRow.values = columns.map(c => c.header)
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } }
    
    ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 3 }]

    const hotelEmps = employees.filter(e => e.hotelId === hotel.id)
    for (const emp of hotelEmps) {
      const dept = departments.find(d => d.id === emp.deptId)
      const empMeasurements = measurements.filter(m => m.employeeId === emp.id)
      
      if (empMeasurements.length === 0) {
        ws.addRow({
          name: emp.name,
          gender: emp.gender,
          role: emp.role,
          department: dept ? dept.name : '',
          uniformType: '',
          unit: 'in'
        })
      } else {
        for (const m of empMeasurements) {
          const rowData = {
            name: emp.name,
            gender: emp.gender,
            role: emp.role,
            department: dept ? dept.name : '',
            uniformType: UNIFORM_TYPES.find(u => u.id === m.uniformType)?.label || m.uniformType,
            unit: m.unit || 'in'
          }
          if (m.values) {
            Object.entries(m.values).forEach(([k, v]) => {
              rowData[k] = v
            })
          }
          ws.addRow(rowData)
        }
      }
    }
  }

  if (activeHotels.length === 0) {
    wb.addWorksheet('No Clients Available')
  }

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, `UMMS_Master_Measurements.xlsx`)
}

export async function parseImportFile(file) {
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(file)
  const results = []

  wb.eachSheet((ws) => {

  const title = ws.getCell('A1').text || ''
  const match = title.match(/\[ID:\s*(.+?)\]/)
  const hotelId = match ? match[1].trim() : null

    if (!hotelId) return // skip sheets without proper hotel id

  const headers = []
  ws.getRow(3).eachCell((cell, colNumber) => {
    headers[colNumber] = cell.text.trim()
  })

  const rows = []
  ws.eachRow((row, rowNumber) => {
    if (rowNumber <= 3) return
    
    const rowData = {}
    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber]
      if (header) {
        rowData[header] = cell.value
      }
    })
    if (rowData['Employee Name']) {
      rows.push(rowData)
    }
  })

  if (rows.length > 0) {
    results.push({ hotelId, rows })
  }
})

  return results
}


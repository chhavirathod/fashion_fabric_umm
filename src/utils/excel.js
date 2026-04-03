import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { MEASUREMENT_FIELDS, UNIFORM_TYPES } from '../data/seed'

const getColumnWidth = (title) => Math.min(Math.max(String(title).length + 2, 12), 28)

const writeRow = (ws, rowNumber, values) => {
  const row = ws.getRow(rowNumber)
  values.forEach((value, index) => {
    row.getCell(index + 1).value = value
  })
}

export async function generateExportData({ hotels, departments, employees, measurements, filters = {}, filename = 'UMMS_Master_Measurements.xlsx' }) {
  const wb = new ExcelJS.Workbook()

  const activeHotels = hotels.filter(h => {
    if (!h.isActive) return false
    if (filters.hotelId && h.id !== filters.hotelId) return false
    return true
  })

  for (const hotel of activeHotels) {
    let baseName = (hotel.name || 'Client').replace(/[*?:/\\[\]]/g, '').trim()
    let sheetName = `${baseName.substring(0, 25)}_${hotel.id.substring(0, 4)}`
    const ws = wb.addWorksheet(sheetName)

    // Get filtered employees for this hotel
    const hotelEmps = employees.filter(e => {
      if (e.hotelId !== hotel.id) return false
      if (filters.deptId && e.deptId !== filters.deptId) return false
      if (filters.status && e.status !== filters.status) return false
      return true
    })

    // Get all measurements for these employees
    const empIds = new Set(hotelEmps.map(e => e.id))
    const empMeasurements = measurements.filter(m => empIds.has(m.employeeId))

    // Group measurements by uniform type
    const uniformTypeGroups = {}
    empMeasurements.forEach(m => {
      if (!uniformTypeGroups[m.uniformType]) {
        uniformTypeGroups[m.uniformType] = []
      }
      uniformTypeGroups[m.uniformType].push(m)
    })

    const sectionDefinitions = Object.keys(uniformTypeGroups)
      .sort()
      .map((uniformTypeId) => {
        const uniformTypeLabel = UNIFORM_TYPES.find(u => u.id === uniformTypeId)?.label || uniformTypeId
        const relevantFields = MEASUREMENT_FIELDS[uniformTypeId] || []
        const headers = ['Employee Name', 'Gender', 'Role', 'Department', 'Unit (in/cm)', ...relevantFields]
        return { uniformTypeId, uniformTypeLabel, relevantFields, headers }
      })

    const sheetWidth = Math.max(
      6,
      ...sectionDefinitions.map(section => section.headers.length)
    )

    for (let columnIndex = 1; columnIndex <= sheetWidth; columnIndex++) {
      ws.getColumn(columnIndex).width = getColumnWidth('W')
    }

    // Add title section
    ws.mergeCells(`A1:${ws.getColumn(sheetWidth).letter}1`)
    const titleCell = ws.getCell('A1')
    titleCell.value = `Client Name: ${hotel.name} [ID: ${hotel.id}]`
    titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } }
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0f172a' } }
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' }
    ws.getRow(1).height = 40

    ws.mergeCells(`A2:${ws.getColumn(sheetWidth).letter}2`)
    const instCell = ws.getCell('A2')
    instCell.value = 'Instructions: Do not modify headers. Each uniform type has its own section with relevant measurements only.'
    instCell.font = { italic: true, color: { argb: 'FF475569' } }
    instCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } }
    instCell.alignment = { vertical: 'middle', horizontal: 'left' }
    ws.getRow(2).height = 30

    let currentRow = 4

    // For each uniform type with measurements
    for (const section of sectionDefinitions) {
      const { uniformTypeId, uniformTypeLabel, relevantFields, headers } = section
      const sectionWidth = headers.length

      // Add uniform type header
      ws.mergeCells(`A${currentRow}:${ws.getColumn(sectionWidth).letter}${currentRow}`)
      const typeCell = ws.getCell(`A${currentRow}`)
      typeCell.value = `Uniform Type: ${uniformTypeLabel}`
      typeCell.font = { size: 12, bold: true, color: { argb: 'FFFFFFFF' } }
      typeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1e40af' } }
      typeCell.alignment = { vertical: 'middle', horizontal: 'left' }
      ws.getRow(currentRow).height = 25
      currentRow++

      // Build column headers for this uniform type
      headers.forEach((header, index) => {
        const column = ws.getColumn(index + 1)
        column.width = Math.max(column.width || 0, getColumnWidth(header))
      })

      // Add header row for this section
      writeRow(ws, currentRow, headers)
      const headerRow = ws.getRow(currentRow)
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } }
      currentRow++

      // Add employee data for this uniform type
      const empsWithThisType = Array.from(new Set(
        uniformTypeGroups[uniformTypeId]
          .filter(m => empIds.has(m.employeeId))
          .map(m => m.employeeId)
      ))

      for (const empId of empsWithThisType) {
        const emp = hotelEmps.find(e => e.id === empId)
        if (!emp) continue

        const dept = departments.find(d => d.id === emp.deptId)
        const empMeasForType = measurements.filter(
          m => m.employeeId === empId && m.uniformType === uniformTypeId
        )

        for (const m of empMeasForType) {
          const rowValues = [
            emp.name,
            emp.gender,
            emp.role,
            dept ? dept.name : '',
            m.unit || 'in',
            ...relevantFields.map(field => (m.values && m.values[field] !== undefined ? m.values[field] : '')),
          ]
          writeRow(ws, currentRow, rowValues)
          currentRow++
        }
      }

      // Add spacing between uniform type sections
      currentRow++
    }

    ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 3 }]
  }

  if (activeHotels.length === 0) {
    wb.addWorksheet('No Clients Available')
  }

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, filename)
}

export async function parseImportFile(file) {
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(file)
  const results = []

  wb.eachSheet((ws) => {
    const title = ws.getCell('A1').text || ''
    const match = title.match(/\[ID:\s*(.+?)\]/)
    const hotelId = match ? match[1].trim() : null

    if (!hotelId) return

    // Find all uniform type sections
    let currentRow = 3
    const maxRows = ws.rowCount

    while (currentRow <= maxRows) {
      const cell = ws.getCell(`A${currentRow}`)
      const cellText = (cell.text || '').trim()

      // Look for "Uniform Type:" marker
      if (cellText.startsWith('Uniform Type:')) {
        const uniformTypeText = cellText.replace('Uniform Type:', '').trim()
        // Find the uniform type id by matching the label
        const uniformType = UNIFORM_TYPES.find(u => u.label === uniformTypeText)?.id || null

        if (!uniformType) {
          currentRow++
          continue
        }

        // Next row should have headers
        const headerRow = currentRow + 1
        const headers = []
        ws.getRow(headerRow).eachCell((cell, colNumber) => {
          headers[colNumber] = cell.text.trim()
        })

        // Parse all data rows for this uniform type until next section or end
        const rows = []
        let dataRow = headerRow + 1
        while (dataRow <= maxRows) {
          const firstCell = ws.getCell(`A${dataRow}`)
          const firstCellText = (firstCell.text || '').trim()

          // Stop if we hit another uniform type section or empty row
          if (firstCellText.startsWith('Uniform Type:') || firstCellText === '') {
            break
          }

          const rowData = {}
          ws.getRow(dataRow).eachCell((cell, colNumber) => {
            const header = headers[colNumber]
            if (header && header !== '') {
              rowData[header] = cell.value
            }
          })

          if (rowData['Employee Name']) {
            rowData['Uniform Type'] = uniformType
            rows.push(rowData)
          }
          dataRow++
        }

        if (rows.length > 0) {
          results.push({ hotelId, rows })
        }

        currentRow = dataRow
      } else {
        currentRow++
      }
    }
  })

  return results
}


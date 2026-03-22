import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [hotels,       setHotels]       = useState([])
  const [departments,  setDepartments]  = useState([])
  const [employees,    setEmployees]    = useState([])
  const [measurements, setMeasurements] = useState([])
  const [loadingData,  setLoadingData]  = useState(true)

  // ── Fetch all data on mount ──────────────────────────────────────────────
  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoadingData(true)
    await Promise.all([fetchHotels(), fetchDepartments(), fetchEmployees(), fetchMeasurements()])
    setLoadingData(false)
  }

  // ── Hotels ───────────────────────────────────────────────────────────────
  const fetchHotels = async () => {
    const { data } = await supabase.from('hotels').select('*').order('name')
    if (data) setHotels(data.map(camelHotel))
  }

  const addHotel = async (form) => {
    const { data, error } = await supabase.from('hotels').insert([snakeHotel(form)]).select().single()
    if (error) throw error
    setHotels(prev => [...prev, camelHotel(data)])
    return data
  }

  const updateHotel = async (hotel) => {
    const { error } = await supabase.from('hotels').update(snakeHotel(hotel)).eq('id', hotel.id)
    if (error) throw error
    setHotels(prev => prev.map(h => h.id === hotel.id ? hotel : h))
  }

  const toggleHotelActive = async (id) => {
    const hotel = hotels.find(h => h.id === id)
    const { error } = await supabase.from('hotels').update({ is_active: !hotel.isActive }).eq('id', id)
    if (error) throw error
    setHotels(prev => prev.map(h => h.id === id ? { ...h, isActive: !h.isActive } : h))
  }

  // ── Departments ──────────────────────────────────────────────────────────
  const fetchDepartments = async () => {
    const { data } = await supabase.from('departments').select('*').order('name')
    if (data) setDepartments(data.map(camelDept))
  }

  const addDepartment = async (form) => {
    const { data, error } = await supabase.from('departments').insert([snakeDept(form)]).select().single()
    if (error) throw error
    setDepartments(prev => [...prev, camelDept(data)])
    return data
  }

  const updateDepartment = async (dept) => {
    const { error } = await supabase.from('departments').update(snakeDept(dept)).eq('id', dept.id)
    if (error) throw error
    setDepartments(prev => prev.map(d => d.id === dept.id ? dept : d))
  }

  const toggleDeptActive = async (id) => {
    const dept = departments.find(d => d.id === id)
    const { error } = await supabase.from('departments').update({ is_active: !dept.isActive }).eq('id', id)
    if (error) throw error
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, isActive: !d.isActive } : d))
  }

  // ── Employees ────────────────────────────────────────────────────────────
  const fetchEmployees = async () => {
    const { data } = await supabase.from('employees').select('*').order('name')
    if (data) setEmployees(data.map(camelEmp))
  }

  const addEmployee = async (form) => {
    const { data, error } = await supabase.from('employees').insert([snakeEmp(form)]).select().single()
    if (error) throw error
    setEmployees(prev => [...prev, camelEmp(data)])
    return data
  }

  const updateEmployee = async (emp) => {
    const { error } = await supabase.from('employees').update(snakeEmp(emp)).eq('id', emp.id)
    if (error) throw error
    setEmployees(prev => prev.map(e => e.id === emp.id ? emp : e))
  }

  const deleteEmployee = async (id) => {
    const { error } = await supabase.from('employees').delete().eq('id', id)
    if (error) throw error
    setEmployees(prev => prev.filter(e => e.id !== id))
  }

  const updateEmployeeStatus = async (id, status) => {
    const { error } = await supabase.from('employees').update({ status }).eq('id', id)
    if (error) throw error
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, status } : e))
  }

  // ── Measurements ─────────────────────────────────────────────────────────
  const fetchMeasurements = async () => {
    const { data } = await supabase.from('measurements').select('*').order('recorded_at', { ascending: false })
    if (data) setMeasurements(data.map(camelMeasurement))
  }

  // The frontend stores measurements as { employeeId, uniformType, values: { field: value } }
  // The DB stores one row per field. This function handles the translation.
  const saveMeasurements = async ({ employeeId, uniformType, values, recordedBy }) => {
  const rows = Object.entries(values)
    .filter(([, v]) => v !== '' && v != null)
    .map(([field_name, val]) => ({
      employee_id:  employeeId,
      uniform_type: uniformType,
      field_name,
      value_inches: parseFloat(val),
      recorded_by:  recordedBy,   // must be auth.uid() UUID
      recorded_at:  new Date().toISOString(),
      updated_at:   new Date().toISOString(),
    }))

  const { data, error } = await supabase
    .from('measurements')
    .upsert(rows, {
      onConflict:        'employee_id,uniform_type,field_name',
      ignoreDuplicates:  false,
    })
    .select()

  if (error) throw error
  await fetchMeasurements()
  return data
}

  const deleteMeasurement = async (id) => {
    const { error } = await supabase.from('measurements').delete().eq('id', id)
    if (error) throw error
    setMeasurements(prev => prev.filter(m => m.id !== id))
  }

  // ── camelCase ↔ snake_case mappers ───────────────────────────────────────
  const camelHotel  = (r) => ({ id: r.id, name: r.name, address: r.address, contact: r.contact, vertical: r.vertical, isActive: r.is_active, createdAt: r.created_at })
  const snakeHotel  = (r) => ({ name: r.name, address: r.address, contact: r.contact, vertical: r.vertical, is_active: r.isActive ?? true })

  const camelDept   = (r) => ({ id: r.id, hotelId: r.hotel_id, name: r.name, isActive: r.is_active })
  const snakeDept   = (r) => ({ hotel_id: r.hotelId, name: r.name, is_active: r.isActive ?? true })

  const camelEmp    = (r) => ({ id: r.id, hotelId: r.hotel_id, deptId: r.dept_id, name: r.name, gender: r.gender, role: r.role, empCode: r.emp_code, status: r.status })
  const snakeEmp    = (r) => ({ hotel_id: r.hotelId, dept_id: r.deptId, name: r.name, gender: r.gender, role: r.role, emp_code: r.empCode, status: r.status })

  // Measurements from DB are flat rows — group them back into the shape the frontend expects
  const camelMeasurement = (r) => ({
    id:          r.id,
    employeeId:  r.employee_id,
    uniformType: r.uniform_type,
    fieldName:   r.field_name,
    valueInches: r.value_inches,
    valueCm:     r.value_cm,
    recordedBy:  r.recorded_by,
    recordedAt:  r.recorded_at,
  })

  // Group flat DB rows into the { employeeId, uniformType, values: {} } shape the UI uses
  const groupedMeasurements = measurements.reduce((acc, row) => {
    const key = `${row.employeeId}__${row.uniformType}`
    if (!acc[key]) {
      acc[key] = {
        id:          key,
        employeeId:  row.employeeId,
        uniformType: row.uniformType,
        unit:        'in',
        recordedBy:  row.recordedBy,
        recordedAt:  row.recordedAt,
        values:      {},
      }
    }
    acc[key].values[row.fieldName] = String(row.valueInches)
    return acc
  }, {})

  const state = {
    hotels, departments, employees,
    measurements: Object.values(groupedMeasurements),
    loadingData,
  }

  const dispatch = useCallback((action) => {
    switch (action.type) {
      case 'ADD_HOTEL':              return addHotel(action.payload)
      case 'UPDATE_HOTEL':           return updateHotel(action.payload)
      case 'TOGGLE_HOTEL_ACTIVE':    return toggleHotelActive(action.payload)
      case 'ADD_DEPARTMENT':         return addDepartment(action.payload)
      case 'UPDATE_DEPARTMENT':      return updateDepartment(action.payload)
      case 'TOGGLE_DEPT_ACTIVE':     return toggleDeptActive(action.payload)
      case 'ADD_EMPLOYEE':           return addEmployee(action.payload)
      case 'UPDATE_EMPLOYEE':        return updateEmployee(action.payload)
      case 'DELETE_EMPLOYEE':        return deleteEmployee(action.payload)
      case 'UPDATE_EMPLOYEE_STATUS': return updateEmployeeStatus(action.payload.id, action.payload.status)
      case 'ADD_MEASUREMENT':        return saveMeasurements(action.payload)
      case 'UPDATE_MEASUREMENT':     return saveMeasurements(action.payload)
      case 'DELETE_MEASUREMENT':     return deleteMeasurement(action.payload)
      default: console.warn('Unknown action:', action.type)
    }
  }, [hotels, departments, employees, measurements])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
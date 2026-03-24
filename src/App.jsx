import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import { ToastProvider } from './components/shared/Toast'
import ProtectedRoute from './components/shared/ProtectedRoute'

// Layouts
import AdminLayout from './components/admin/AdminLayout'
import StaffLayout from './components/staff/StaffLayout'

// Pages
import LoginPage from './pages/LoginPage'
import OAuthCallback from './pages/OAuthCallback'
import AdminDashboard from './pages/admin/AdminDashboard'
import HotelsPage from './pages/admin/HotelsPage'
import EmployeesPage from './pages/admin/EmployeesPage'
import MeasurementsPage from './pages/admin/MeasurementsPage'
import OrderStatusPage from './pages/admin/OrderStatusPage'
import ExportPage from './pages/admin/ExportPage'
import StaffMeasurementEntry from './pages/staff/StaffMeasurementEntry'
import StaffMyEntries from './pages/staff/StaffMyEntries'

function AdminApp() {
  return (
    <ProtectedRoute role="admin">
      <AdminLayout>
        <Routes>
          <Route path="/"            element={<AdminDashboard />} />
          <Route path="/hotels"      element={<HotelsPage />} />
          <Route path="/employees"   element={<EmployeesPage />} />
          <Route path="/measurements"element={<MeasurementsPage />} />
          <Route path="/orders"      element={<OrderStatusPage />} />
          <Route path="/export"      element={<ExportPage />} />
          <Route path="*"            element={<Navigate to="/admin" replace />} />
        </Routes>
      </AdminLayout>
    </ProtectedRoute>
  )
}

function StaffApp() {
  return (
    <ProtectedRoute role="staff">
      <StaffLayout>
        <Routes>
          <Route path="/"            element={<StaffMeasurementEntry />} />
          <Route path="/my-entries"  element={<StaffMyEntries />} />
          <Route path="*"            element={<Navigate to="/staff" replace />} />
        </Routes>
      </StaffLayout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login"           element={<LoginPage />} />
            <Route path="/auth/callback"   element={<OAuthCallback />} />
            <Route path="/admin/*"         element={<AdminApp />} />
            <Route path="/staff/*"         element={<StaffApp />} />
            <Route path="*"                element={<Navigate to="/login" replace />} />
          </Routes>
        </ToastProvider>
      </AppProvider>
    </AuthProvider>
  )
}

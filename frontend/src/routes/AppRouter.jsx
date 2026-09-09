import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProtectedRoute from '../components/common/ProtectedRoute'
import AuthLayout from '../layouts/AuthLayout'
import FarmerLayout from '../layouts/FarmerLayout'
import AdminLayout from '../layouts/AdminLayout'
import Login from '../pages/auth/Login'
import SignUp from '../pages/auth/SignUp'
import FarmerDashboard from '../pages/farmer/FarmerDashboard'
import Recommendations from '../pages/farmer/Recommendations'
import FertilizerLog from '../pages/farmer/FertilizerLog'
import Alerts from '../pages/farmer/Alerts'
import FarmerReports from '../pages/farmer/FarmerReports'
import AdminDashboard from '../pages/admin/AdminDashboard'
import DeviceMonitoring from '../pages/admin/DeviceMonitoring'
import ReferenceConfig from '../pages/admin/ReferenceConfig'
import UserManagement from '../pages/admin/UserManagement'
import ActivityLogs from '../pages/admin/ActivityLogs'
import AdminReports from '../pages/admin/AdminReports'

export default function AppRouter() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-prime-200 border-t-prime-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading PRIME System...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Route>

      {/* Farmer routes */}
      <Route path="/farmer" element={
        <ProtectedRoute allowedRoles={['farmer']}>
          <FarmerLayout />
        </ProtectedRoute>
      }>
        <Route index element={<FarmerDashboard />} />
        <Route path="recommendations" element={<Recommendations />} />
        <Route path="fertilizer-log" element={<FertilizerLog />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="reports" element={<FarmerReports />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="devices" element={<DeviceMonitoring />} />
        <Route path="reference" element={<ReferenceConfig />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="activity" element={<ActivityLogs />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={
        user ? <Navigate to={user.role === 'admin' ? '/admin' : '/farmer'} replace /> : <Navigate to="/login" replace />
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

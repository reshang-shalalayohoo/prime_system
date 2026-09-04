import { Outlet } from 'react-router-dom'
import Sidebar from '../components/common/Sidebar'
import Topbar from '../components/common/Topbar'
import { LayoutDashboard, Cpu, SlidersHorizontal, Users, ScrollText, FileBarChart } from 'lucide-react'

const adminNav = [
  { path: '', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/devices', label: 'Devices', icon: Cpu },
  { path: '/reference', label: 'SSNM Config', icon: SlidersHorizontal },
  { path: '/users', label: 'Users', icon: Users },
  { path: '/activity', label: 'Activity', icon: ScrollText },
  { path: '/reports', label: 'Reports', icon: FileBarChart },
]

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar items={adminNav} basePath="/admin" />
      <div className="md:ml-60">
        <Topbar />
        <main className="p-4 md:p-6 pb-20 md:pb-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

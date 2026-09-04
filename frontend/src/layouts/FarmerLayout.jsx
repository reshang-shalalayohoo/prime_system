import { Outlet } from 'react-router-dom'
import Sidebar from '../components/common/Sidebar'
import Topbar from '../components/common/Topbar'
import { LayoutDashboard, Lightbulb, FlaskConical, Bell, FileBarChart } from 'lucide-react'

const farmerNav = [
  { path: '', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/recommendations', label: 'Recommendations', icon: Lightbulb },
  { path: '/fertilizer-log', label: 'Fertilizer Log', icon: FlaskConical },
  { path: '/alerts', label: 'Alerts', icon: Bell },
  { path: '/reports', label: 'Reports', icon: FileBarChart },
]

export default function FarmerLayout() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar items={farmerNav} basePath="/farmer" />
      <div className="md:ml-60">
        <Topbar />
        <main className="p-4 md:p-6 pb-20 md:pb-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

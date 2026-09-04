import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Card from '../../components/common/Card'
import reportService from '../../services/report.service'
import activityService from '../../services/activity.service'
import { Map, Cpu, Users, Bell, Lightbulb, Clock } from 'lucide-react'

export default function AdminDashboard() {
  const { socket } = useAuth()
  const [report, setReport] = useState(null)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      reportService.getAdminReport(),
      activityService.getRecent({ limit: 8 })
    ])
      .then(([reportData, actData]) => {
        setReport(reportData)
        setActivities(actData)
      })
      .catch(err => console.error('Failed to fetch admin dashboard:', err))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!socket) return
    socket.emit('join-admin')
    const handleNewReading = () => {
      reportService.getAdminReport().then(setReport).catch(() => {})
    }
    socket.on('new-sensor-reading', handleNewReading)
    return () => socket.off('new-sensor-reading', handleNewReading)
  }, [socket])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-28 loading-shimmer rounded-xl" />)}
        </div>
      </div>
    )
  }

  const ov = report?.overview || {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">System Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">PRIME system overview and monitoring</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card title="Fields" value={ov.totalFields || 0} icon={Map} color="prime" />
        <Card title="Devices Online" value={ov.totalDevices || 0} icon={Cpu} color="water" />
        <Card title="Active Farmers" value={ov.totalFarmers || 0} icon={Users} color="earth" />
        <Card title="Unread Alerts" value={ov.unreadAlerts || 0} icon={Bell} color="red" />
        <Card title="Total Readings" value={ov.totalReadings || 0} icon={Lightbulb} color="purple" />
        <Card title="Recommendations" value={ov.totalRecommendations || 0} icon={Lightbulb} color="prime" />
      </div>

      {/* System Stats & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sensor Stats */}
        <Card title="System-wide Sensor Averages">
          {report?.sensorStats ? (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Avg Soil Moisture', value: `${report.sensorStats.avg_moisture || 0}%`, color: 'text-green-600' },
                { label: 'Avg Water Level', value: `${report.sensorStats.avg_water_level || 0}%`, color: 'text-blue-600' },
                { label: 'Avg Nitrogen', value: `${report.sensorStats.avg_nitrogen || 0} mg/kg`, color: 'text-green-700' },
                { label: 'Avg Phosphorus', value: `${report.sensorStats.avg_phosphorus || 0} mg/kg`, color: 'text-blue-700' },
                { label: 'Avg Potassium', value: `${report.sensorStats.avg_potassium || 0} mg/kg`, color: 'text-amber-700' },
                { label: 'Total Readings', value: report.sensorStats.total_readings || 0, color: 'text-gray-700' },
              ].map(item => (
                <div key={item.label} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-6">No sensor data available</p>
          )}
        </Card>

        {/* Recent Activity */}
        <Card title="Recent System Activity">
          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map(act => (
                <div key={act.id} className="flex items-start gap-3 p-2.5 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-prime-100 text-prime-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{act.user_name || 'System'}</span>
                      {' — '}
                      {act.action}
                    </p>
                    {act.details && <p className="text-xs text-gray-400 mt-0.5 truncate">{act.details}</p>}
                    <p className="text-[10px] text-gray-300 mt-0.5">{new Date(act.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-6">No recent activity</p>
          )}
        </Card>
      </div>
    </div>
  )
}

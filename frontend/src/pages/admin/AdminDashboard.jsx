import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/common/Card'
import DeviceMapView from '../../components/DeviceMapView'
import DeviceDetailModal from '../../components/DeviceDetailModal'
import reportService from '../../services/report.service'
import activityService from '../../services/activity.service'
import deviceService from '../../services/device.service'
import { Map, Cpu, Users, Bell, Lightbulb, Clock } from 'lucide-react'

export default function AdminDashboard() {
  const { socket } = useAuth()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [activities, setActivities] = useState([])
  const [mapDevices, setMapDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDeviceId, setSelectedDeviceId] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const fetchData = () => {
    Promise.all([
      reportService.getAdminReport(),
      activityService.getRecent({ limit: 8 }),
      deviceService.getMapData()
    ])
      .then(([reportData, actData, mapData]) => {
        setReport(reportData)
        setActivities(actData)
        setMapDevices(mapData)
      })
      .catch(err => console.error('Failed to fetch admin dashboard:', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  useEffect(() => {
    if (!socket) return
    socket.emit('join-admin')
    const handleNewReading = () => { fetchData() }
    socket.on('new-sensor-reading', handleNewReading)
    return () => socket.off('new-sensor-reading', handleNewReading)
  }, [socket])

  const handleViewDevice = (deviceId) => {
    setSelectedDeviceId(deviceId)
    setShowDetailModal(true)
  }

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
  const attentionDevices = mapDevices.filter(d => d.severity?.overallColor === 'red' || d.severity?.overallColor === 'yellow')

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

      {/* Sensor Map */}
      <Card title="Sensor Map — All Devices">
        <div className="mb-3 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500" /><span className="text-xs text-gray-500">Sufficient</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-xs text-gray-500">Moderate</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500" /><span className="text-xs text-gray-500">Critical</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gray-400" /><span className="text-xs text-gray-500">No Data</span></div>
          <span className="text-xs text-gray-400 ml-auto">{mapDevices.filter(d => d.latitude).length} devices with GPS</span>
        </div>
        <DeviceMapView devices={mapDevices} onDeviceClick={handleViewDevice} height="350px" />
      </Card>

      {/* Attention + Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Devices Needing Attention */}
        <Card title={`Devices Needing Attention (${attentionDevices.length})`}>
          {attentionDevices.length > 0 ? (
            <div className="space-y-2 max-h-[320px] overflow-y-auto">
              {attentionDevices.map(device => {
                const overallC = device.severity?.overallColor
                return (
                  <div key={device.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                    overallC === 'red' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                  }`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-3 h-3 rounded-full flex-shrink-0 ${overallC === 'red' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{device.device_name || device.device_code}</p>
                        <p className="text-xs text-gray-500 truncate">{device.field_name || 'Unassigned'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewDevice(device.id)}
                      className="text-xs font-medium text-prime-600 hover:text-prime-700 hover:underline flex-shrink-0 ml-2"
                    >
                      View →
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <i className="bi bi-check-circle text-3xl text-green-400 block mb-2" />
              <p className="text-sm text-gray-400">All sensors are within normal range</p>
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card title="Recent System Activity">
          {activities.length > 0 ? (
            <div className="space-y-3 max-h-[320px] overflow-y-auto">
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

      {/* Sensor Stats */}
      <Card title="System-wide Sensor Averages">
        {report?.sensorStats ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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

      {/* Device Detail Modal */}
      <DeviceDetailModal
        deviceId={selectedDeviceId}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </div>
  )
}

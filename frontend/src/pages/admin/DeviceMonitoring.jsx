import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Card from '../../components/common/Card'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import DeviceMapView from '../../components/DeviceMapView'
import DeviceDetailModal from '../../components/DeviceDetailModal'
import deviceService from '../../services/device.service'
import { Cpu } from 'lucide-react'

export default function DeviceMonitoring() {
  const { socket } = useAuth()
  const [devices, setDevices] = useState([])
  const [mapDevices, setMapDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDeviceId, setSelectedDeviceId] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const fetchDevices = () => {
    Promise.all([
      deviceService.getAll(),
      deviceService.getMapData()
    ])
      .then(([allDevices, mapData]) => {
        setDevices(allDevices)
        setMapDevices(mapData)
      })
      .catch(err => console.error('Failed to fetch devices:', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchDevices() }, [])

  // Real-time updates
  useEffect(() => {
    if (!socket) return
    const handleNewReading = () => { fetchDevices() }
    socket.on('new-sensor-reading', handleNewReading)
    return () => socket.off('new-sensor-reading', handleNewReading)
  }, [socket])

  const handleViewDevice = (deviceId) => {
    setSelectedDeviceId(deviceId)
    setShowDetailModal(true)
  }

  const columns = [
    { key: 'device_code', label: 'Device Code', render: (val) => <span className="font-mono text-sm font-semibold text-gray-800">{val}</span> },
    { key: 'device_name', label: 'Name' },
    { key: 'field_name', label: 'Field', render: (val) => val || <span className="text-gray-400 italic">Unassigned</span> },
    { key: 'field_location', label: 'Location', render: (val) => val || '—' },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
    { key: 'latitude', label: 'GPS', render: (val, row) => {
      if (val && row.longitude) {
        return (
          <span className="text-xs text-gray-600">
            <i className="bi bi-geo-alt-fill text-prime-600 mr-0.5" />
            {Number(val).toFixed(4)}, {Number(row.longitude).toFixed(4)}
          </span>
        )
      }
      return <span className="text-xs text-gray-400 italic">Not set</span>
    }},
    { key: 'battery_level', label: 'Battery', render: (val) => {
      const level = val || 0
      const color = level > 60 ? 'text-green-600' : level > 30 ? 'text-amber-600' : 'text-red-600'
      return (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${level > 60 ? 'bg-green-500' : level > 30 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${level}%` }} />
          </div>
          <span className={`text-xs font-medium ${color}`}>{level}%</span>
        </div>
      )
    }},
    { key: 'last_communication', label: 'Last Comms', render: (val) => val ? new Date(val).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—' },
    { key: 'id', label: '', render: (val) => (
      <button
        onClick={() => handleViewDevice(val)}
        className="text-xs font-medium text-white bg-prime-600 hover:bg-prime-700 px-3 py-1.5 rounded-md transition-colors inline-flex items-center gap-1"
      >
        <i className="bi bi-eye" />
        View
      </button>
    )}
  ]

  // Count devices needing attention from map data
  const attentionDevices = mapDevices.filter(d => d.severity?.overallColor === 'red' || d.severity?.overallColor === 'yellow')

  if (loading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 loading-shimmer rounded-xl" />)}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Device Monitoring</h1>
        <p className="text-sm text-gray-500 mt-0.5">ESP32 sensor node status, location, and health</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Total Devices" value={devices.length} icon={Cpu} color="water" />
        <Card title="Online" value={devices.filter(d => d.status === 'online').length} icon={Cpu} color="prime" />
        <Card title="Offline / Fault" value={devices.filter(d => d.status !== 'online').length} icon={Cpu} color="red" />
        <Card title="Needs Attention" value={attentionDevices.length} icon={Cpu} color={attentionDevices.length > 0 ? 'red' : 'prime'} />
      </div>

      {/* Sensor Map */}
      <Card title="Sensor Locations">
        <div className="mb-3 flex items-center gap-4">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500" /><span className="text-xs text-gray-500">Sufficient</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-xs text-gray-500">Moderate</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500" /><span className="text-xs text-gray-500">Critical</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gray-400" /><span className="text-xs text-gray-500">No Data</span></div>
        </div>
        <DeviceMapView devices={mapDevices} onDeviceClick={handleViewDevice} height="350px" />
      </Card>

      {/* Devices Needing Attention */}
      {attentionDevices.length > 0 && (
        <Card title={`⚠ Devices Needing Attention (${attentionDevices.length})`}>
          <div className="space-y-2">
            {attentionDevices.map(device => {
              const overallC = device.severity?.overallColor
              return (
                <div key={device.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                  overallC === 'red' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${overallC === 'red' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{device.device_name || device.device_code}</p>
                      <p className="text-xs text-gray-500">{device.field_name || 'Unassigned'} — {device.field_location || ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      overallC === 'red' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {device.severity?.overall}
                    </span>
                    <button
                      onClick={() => handleViewDevice(device.id)}
                      className="text-xs font-medium text-prime-600 hover:text-prime-700 hover:underline"
                    >
                      View →
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Device Table */}
      <Card>
        <DataTable columns={columns} data={devices} emptyMessage="No devices registered." emptyIcon={Cpu} />
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

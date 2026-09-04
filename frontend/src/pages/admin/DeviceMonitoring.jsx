import { useState, useEffect } from 'react'
import Card from '../../components/common/Card'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import deviceService from '../../services/device.service'
import { Cpu } from 'lucide-react'

export default function DeviceMonitoring() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    deviceService.getAll()
      .then(data => setDevices(data))
      .catch(err => console.error('Failed to fetch devices:', err))
      .finally(() => setLoading(false))
  }, [])

  const columns = [
    { key: 'device_code', label: 'Device Code', render: (val) => <span className="font-mono text-sm font-semibold text-gray-800">{val}</span> },
    { key: 'device_name', label: 'Name' },
    { key: 'field_name', label: 'Assigned Field', render: (val) => val || <span className="text-gray-400 italic">Unassigned</span> },
    { key: 'field_location', label: 'Location', render: (val) => val || '—' },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
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
    { key: 'last_communication', label: 'Last Communication', render: (val) => val ? new Date(val).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—' },
  ]

  if (loading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 loading-shimmer rounded-xl" />)}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Device Monitoring</h1>
        <p className="text-sm text-gray-500 mt-0.5">ESP32 sensor node status and health</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card title="Total Devices" value={devices.length} icon={Cpu} color="water" />
        <Card title="Online" value={devices.filter(d => d.status === 'online').length} icon={Cpu} color="prime" />
        <Card title="Offline/Fault" value={devices.filter(d => d.status !== 'online').length} icon={Cpu} color="red" />
      </div>

      <Card>
        <DataTable columns={columns} data={devices} emptyMessage="No devices registered." emptyIcon={Cpu} />
      </Card>
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import Card from '../../components/common/Card'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import Modal from '../../components/common/Modal'
import DeviceMapView from '../../components/DeviceMapView'
import DeviceDetailModal from '../../components/DeviceDetailModal'
import deviceService from '../../services/device.service'
import { Cpu, Plus, MapPin, Navigation } from 'lucide-react'

export default function DeviceMonitoring() {
  const { socket } = useAuth()
  const toast = useToast()
  const mapSectionRef = useRef(null)

  const [devices, setDevices] = useState([])
  const [mapDevices, setMapDevices] = useState([])
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDeviceId, setSelectedDeviceId] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [focusDeviceId, setFocusDeviceId] = useState(null)

  // Registration modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [registerForm, setRegisterForm] = useState({
    device_code: '',
    device_name: '',
    field_id: '',
    latitude: '',
    longitude: ''
  })

  // Location edit modal state
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [locationDevice, setLocationDevice] = useState(null)
  const [locationForm, setLocationForm] = useState({
    latitude: '',
    longitude: ''
  })

  const [submitting, setSubmitting] = useState(false)

  const fetchDevices = () => {
    Promise.all([
      deviceService.getAll(),
      deviceService.getMapData()
    ])
      .then(([allDevices, mapData]) => {
        setDevices(allDevices)
        setMapDevices(mapData)
      })
      .catch(err => {
        console.error('Failed to fetch devices:', err)
        toast.error('Failed to load device data')
      })
      .finally(() => setLoading(false))
  }

  const loadFields = () => {
    deviceService.getFields()
      .then(data => setFields(data || []))
      .catch(err => console.error('Failed to load fields:', err))
  }

  useEffect(() => {
    fetchDevices()
    loadFields()
  }, [])

  // Real-time updates via Socket.io
  useEffect(() => {
    if (!socket) return
    const handleNewReading = () => {
      fetchDevices()
    }
    socket.on('new-sensor-reading', handleNewReading)
    return () => socket.off('new-sensor-reading', handleNewReading)
  }, [socket])

  const handleViewDevice = (deviceId) => {
    setSelectedDeviceId(deviceId)
    setShowDetailModal(true)
  }

  const handleLocateDevice = (deviceId) => {
    setFocusDeviceId(null)
    setTimeout(() => {
      setFocusDeviceId(deviceId)
      mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  // Open register device modal
  const handleOpenRegister = () => {
    setRegisterForm({
      device_code: '',
      device_name: '',
      field_id: '',
      latitude: '',
      longitude: ''
    })
    loadFields()
    setShowRegisterModal(true)
  }

  // Handle register device submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    if (!registerForm.device_code.trim()) {
      toast.warning('Please enter a device code')
      return
    }

    setSubmitting(true)
    try {
      await deviceService.create({
        device_code: registerForm.device_code.trim(),
        device_name: registerForm.device_name.trim() || registerForm.device_code.trim(),
        field_id: registerForm.field_id ? parseInt(registerForm.field_id) : null,
        latitude: registerForm.latitude ? parseFloat(registerForm.latitude) : null,
        longitude: registerForm.longitude ? parseFloat(registerForm.longitude) : null
      })
      toast.success(`Device ${registerForm.device_code} registered successfully!`)
      setShowRegisterModal(false)
      fetchDevices()
    } catch (err) {
      console.error('Registration error:', err)
      toast.error(err.response?.data?.error || 'Failed to register device')
    } finally {
      setSubmitting(false)
    }
  }

  // Open location assignment modal
  const handleOpenLocationModal = (device) => {
    setLocationDevice(device)
    setLocationForm({
      latitude: device.latitude !== null && device.latitude !== undefined ? String(device.latitude) : '',
      longitude: device.longitude !== null && device.longitude !== undefined ? String(device.longitude) : ''
    })
    setShowLocationModal(true)
  }

  // Handle save location submit
  const handleLocationSubmit = async (e) => {
    e.preventDefault()
    const lat = parseFloat(locationForm.latitude)
    const lng = parseFloat(locationForm.longitude)

    if (isNaN(lat) || isNaN(lng)) {
      toast.warning('Please provide valid latitude and longitude numbers')
      return
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.warning('Latitude must be between -90 and 90, Longitude between -180 and 180')
      return
    }

    setSubmitting(true)
    try {
      await deviceService.updateLocation(locationDevice.id, {
        latitude: lat,
        longitude: lng
      })
      toast.success(`Location updated for ${locationDevice.device_code}!`)
      setShowLocationModal(false)
      fetchDevices()
    } catch (err) {
      console.error('Location update error:', err)
      toast.error(err.response?.data?.error || 'Failed to update device location')
    } finally {
      setSubmitting(false)
    }
  }

  // Helper to use current browser GPS location
  const handleUseCurrentLocation = (isRegister = false) => {
    if (!navigator.geolocation) {
      toast.warning('Geolocation is not supported by your browser')
      return
    }
    toast.info('Fetching current GPS coordinates...')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6)
        const lng = pos.coords.longitude.toFixed(6)
        if (isRegister) {
          setRegisterForm(prev => ({ ...prev, latitude: lat, longitude: lng }))
        } else {
          setLocationForm({ latitude: lat, longitude: lng })
        }
        toast.success(`Acquired GPS: ${lat}, ${lng}`)
      },
      (err) => {
        console.warn('GPS error:', err)
        toast.error('Unable to retrieve your current location. Please enter coordinates manually.')
      }
    )
  }

  const columns = [
    {
      key: 'device_code',
      label: 'Device Code',
      render: (val) => <span className="font-mono text-sm font-semibold text-gray-800">{val}</span>
    },
    { key: 'device_name', label: 'Name' },
    {
      key: 'field_name',
      label: 'Field',
      render: (val) => val || <span className="text-gray-400 italic">Unassigned</span>
    },
    { key: 'field_location', label: 'Location', render: (val) => val || '—' },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
    {
      key: 'latitude',
      label: 'GPS Location',
      render: (val, row) => {
        if (val && row.longitude) {
          return (
            <button
              onClick={() => handleLocateDevice(row.id)}
              className="text-xs text-prime-700 hover:text-prime-800 font-medium hover:underline inline-flex items-center gap-1"
              title="Click to locate on map"
            >
              <i className="bi bi-geo-alt-fill text-prime-600" />
              {Number(val).toFixed(4)}, {Number(row.longitude).toFixed(4)}
            </button>
          )
        }
        return (
          <button
            onClick={() => handleOpenLocationModal(row)}
            className="text-xs text-amber-600 hover:text-amber-700 font-medium underline inline-flex items-center gap-1"
          >
            <i className="bi bi-plus-circle" /> Set GPS
          </button>
        )
      }
    },
    {
      key: 'battery_level',
      label: 'Battery',
      render: (val) => {
        const level = val || 0
        const color = level > 60 ? 'text-green-600' : level > 30 ? 'text-amber-600' : 'text-red-600'
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${level > 60 ? 'bg-green-500' : level > 30 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${level}%` }}
              />
            </div>
            <span className={`text-xs font-medium ${color}`}>{level}%</span>
          </div>
        )
      }
    },
    {
      key: 'last_communication',
      label: 'Last Comms',
      render: (val) =>
        val
          ? new Date(val).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : '—'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          {row.latitude && row.longitude && (
            <button
              onClick={() => handleLocateDevice(row.id)}
              className="text-xs font-medium text-gray-700 hover:text-prime-700 bg-gray-100 hover:bg-prime-50 px-2.5 py-1.5 rounded-md transition-colors inline-flex items-center gap-1"
              title="Locate device marker on map"
            >
              <Navigation size={12} />
              Locate
            </button>
          )}
          <button
            onClick={() => handleOpenLocationModal(row)}
            className="text-xs font-medium text-gray-700 hover:text-prime-700 bg-gray-100 hover:bg-prime-50 px-2.5 py-1.5 rounded-md transition-colors inline-flex items-center gap-1"
            title="Edit GPS Coordinates"
          >
            <MapPin size={12} />
            GPS
          </button>
          <button
            onClick={() => handleViewDevice(row.id)}
            className="text-xs font-medium text-white bg-prime-600 hover:bg-prime-700 px-3 py-1.5 rounded-md transition-colors inline-flex items-center gap-1"
          >
            <i className="bi bi-eye" />
            View
          </button>
        </div>
      )
    }
  ]

  const attentionDevices = mapDevices.filter(
    d => d.severity?.overallColor === 'red' || d.severity?.overallColor === 'yellow'
  )

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 loading-shimmer rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Register Device Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Device Monitoring</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            ESP32 sensor node status, registered GPS locations, and real-time health
          </p>
        </div>
        <button
          onClick={handleOpenRegister}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-prime-600 hover:bg-prime-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
        >
          <Plus size={16} />
          Register Device
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Total Devices" value={devices.length} icon={Cpu} color="water" />
        <Card
          title="Online"
          value={devices.filter(d => d.status === 'online').length}
          icon={Cpu}
          color="prime"
        />
        <Card
          title="Offline / Fault"
          value={devices.filter(d => d.status !== 'online').length}
          icon={Cpu}
          color="red"
        />
        <Card
          title="Needs Attention"
          value={attentionDevices.length}
          icon={Cpu}
          color={attentionDevices.length > 0 ? 'red' : 'prime'}
        />
      </div>

      {/* Leaflet Sensor Map Section */}
      <div ref={mapSectionRef}>
        <Card title="PRIME Sensor Locations (Interactive Leaflet Map)">
          <DeviceMapView
            devices={mapDevices}
            onDeviceClick={handleViewDevice}
            focusDeviceId={focusDeviceId}
            height="380px"
          />
        </Card>
      </div>

      {/* Devices Needing Attention */}
      {attentionDevices.length > 0 && (
        <Card title={`⚠ Devices Needing Attention (${attentionDevices.length})`}>
          <div className="space-y-2">
            {attentionDevices.map(device => {
              const overallC = device.severity?.overallColor
              return (
                <div
                  key={device.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    overallC === 'red'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        overallC === 'red' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {device.device_name || device.device_code}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {device.field_name || 'Unassigned'} — {device.field_location || ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        overallC === 'red'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {device.severity?.overall}
                    </span>
                    {device.latitude && device.longitude && (
                      <button
                        onClick={() => handleLocateDevice(device.id)}
                        className="text-xs font-medium text-gray-600 hover:text-prime-700 px-2 py-1 bg-white/80 rounded border border-gray-200"
                        title="Locate on map"
                      >
                        Locate
                      </button>
                    )}
                    <button
                      onClick={() => handleViewDevice(device.id)}
                      className="text-xs font-medium text-prime-600 hover:text-prime-700 hover:underline"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Device Table */}
      <Card title={`All Registered Devices (${devices.length})`}>
        <DataTable
          columns={columns}
          data={devices}
          emptyMessage="No devices registered yet. Click 'Register Device' to add an ESP32 node."
          emptyIcon={Cpu}
        />
      </Card>

      {/* Device Detail Modal */}
      <DeviceDetailModal
        deviceId={selectedDeviceId}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />

      {/* Register Device Modal */}
      <Modal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        title="Register New PRIME Sensor Node"
        size="md"
      >
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Device Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ESP32-NODE-01"
              value={registerForm.device_code}
              onChange={e => setRegisterForm({ ...registerForm, device_code: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-prime-500 focus:border-transparent font-mono"
            />
            <p className="text-[11px] text-gray-400 mt-1">Unique identifier used by the ESP32 hardware.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Device Friendly Name
            </label>
            <input
              type="text"
              placeholder="e.g. North Paddy Node 1"
              value={registerForm.device_name}
              onChange={e => setRegisterForm({ ...registerForm, device_name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-prime-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Assign to Field
            </label>
            <select
              value={registerForm.field_id}
              onChange={e => setRegisterForm({ ...registerForm, field_id: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-prime-500 focus:border-transparent"
            >
              <option value="">-- No Field Assigned (Unassigned) --</option>
              {fields.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.location || 'No location'}) — Farmer: {f.farmer_name || f.farmer_username || 'None'}
                </option>
              ))}
            </select>
          </div>

          {/* GPS Coordinates Section */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
                <i className="bi bi-geo-alt-fill text-prime-600" />
                Field GPS Coordinates
              </span>
              <button
                type="button"
                onClick={() => handleUseCurrentLocation(true)}
                className="text-[11px] text-prime-700 hover:text-prime-800 font-semibold inline-flex items-center gap-1 hover:underline"
              >
                <i className="bi bi-crosshair" /> Use My Location
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 14.5995"
                  value={registerForm.latitude}
                  onChange={e => setRegisterForm({ ...registerForm, latitude: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 120.9842"
                  value={registerForm.longitude}
                  onChange={e => setRegisterForm({ ...registerForm, longitude: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg font-mono"
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-400">
              When coordinates are provided, the device appears dynamically on the Leaflet map.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowRegisterModal(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-prime-600 hover:bg-prime-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
            >
              {submitting ? 'Registering...' : 'Register Device'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit / Assign Location Modal */}
      <Modal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        title={`Configure GPS Location: ${locationDevice?.device_code || ''}`}
        size="sm"
      >
        <form onSubmit={handleLocationSubmit} className="space-y-4">
          <div className="text-xs text-gray-600">
            Configure geographic coordinates for <strong>{locationDevice?.device_name || locationDevice?.device_code}</strong>.
            The device will immediately appear or update on the Leaflet interactive map.
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => handleUseCurrentLocation(false)}
              className="text-xs text-prime-700 hover:text-prime-800 font-semibold inline-flex items-center gap-1 hover:underline"
            >
              <i className="bi bi-crosshair" /> Use My Current Location
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Latitude (-90 to 90) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="e.g. 14.599512"
                value={locationForm.latitude}
                onChange={e => setLocationForm({ ...locationForm, latitude: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-prime-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Longitude (-180 to 180) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="e.g. 120.984222"
                value={locationForm.longitude}
                onChange={e => setLocationForm({ ...locationForm, longitude: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-prime-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowLocationModal(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-prime-600 hover:bg-prime-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
            >
              {submitting ? 'Saving...' : 'Save Location'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}


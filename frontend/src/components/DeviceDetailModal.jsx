import { useState, useEffect } from 'react'
import Modal from './common/Modal'
import deviceService from '../services/device.service'
import DeviceMapView from './DeviceMapView'

const colorClasses = {
  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', bar: 'bg-green-500', dot: 'bg-green-500' },
  yellow: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', bar: 'bg-amber-500', dot: 'bg-amber-500' },
  red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', bar: 'bg-red-500', dot: 'bg-red-500' },
  gray: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-500', bar: 'bg-gray-400', dot: 'bg-gray-400' }
}

function ReadingBar({ label, value, unit, severity, min, max }) {
  const c = colorClasses[severity?.color] || colorClasses.gray
  
  // Calculate bar fill percentage (clamped 0-100)
  let fillPct = 50
  if (min !== undefined && max !== undefined && value !== null && value !== undefined) {
    const range = max - min
    const buffer = range * 0.3
    const totalRange = range + buffer * 2
    fillPct = Math.max(5, Math.min(95, ((value - (min - buffer)) / totalRange) * 100))
  } else if (value !== null && value !== undefined) {
    fillPct = Math.max(5, Math.min(95, value))
  }

  return (
    <div className={`p-3 rounded-lg border ${c.bg} ${c.border}`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
          <span className="text-xs font-medium text-gray-700">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-800">
            {value !== null && value !== undefined ? value.toFixed(1) : '—'} {unit}
          </span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${c.bg} ${c.text} border ${c.border}`}>
            {severity?.label || 'No Data'}
          </span>
        </div>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${c.bar}`} style={{ width: `${fillPct}%` }} />
      </div>
      {min !== undefined && max !== undefined && (
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-gray-400">Min: {min}</span>
          <span className="text-[9px] text-gray-400">Range: {min}–{max} {unit}</span>
          <span className="text-[9px] text-gray-400">Max: {max}</span>
        </div>
      )}
    </div>
  )
}

export default function DeviceDetailModal({ deviceId, isOpen, onClose }) {
  const [device, setDevice] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isOpen || !deviceId) return
    setLoading(true)
    deviceService.getDetail(deviceId)
      .then(data => setDevice(data))
      .catch(err => console.error('Failed to fetch device detail:', err))
      .finally(() => setLoading(false))
  }, [deviceId, isOpen])

  if (!isOpen) return null

  const overallC = colorClasses[device?.severity?.overallColor] || colorClasses.gray

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Device Details" size="lg">
      {loading ? (
        <div className="space-y-4 py-4">
          {[1,2,3,4].map(i => <div key={i} className="h-12 loading-shimmer rounded-lg" />)}
        </div>
      ) : !device ? (
        <p className="text-center text-gray-400 py-8">Device not found</p>
      ) : (
        <div className="space-y-5">
          {/* Device Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800">{device.device_name || device.device_code}</h3>
              <p className="text-xs font-mono text-gray-400 mt-0.5">{device.device_code}</p>
              {device.field_name && (
                <p className="text-sm text-gray-600 mt-1">
                  <i className="bi bi-pin-map-fill text-prime-600 mr-1" />
                  {device.field_name} — {device.field_location || 'No location'}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                device.status === 'online' ? 'bg-green-100 text-green-700' :
                device.status === 'fault' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                <i className={`bi ${device.status === 'online' ? 'bi-wifi' : 'bi-wifi-off'} mr-1`} />
                {device.status}
              </span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${overallC.bg} ${overallC.text} ${overallC.border}`}>
                Overall: {device.severity?.overall || 'Unknown'}
              </span>
            </div>
          </div>

          {/* Device Info Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-2.5 bg-gray-50 rounded-lg text-center">
              <p className="text-[10px] text-gray-400">Battery</p>
              <p className={`text-sm font-bold ${device.battery_level > 60 ? 'text-green-600' : device.battery_level > 30 ? 'text-amber-600' : 'text-red-600'}`}>
                {device.battery_level || 0}%
              </p>
            </div>
            <div className="p-2.5 bg-gray-50 rounded-lg text-center">
              <p className="text-[10px] text-gray-400">Crop</p>
              <p className="text-sm font-bold text-gray-700">{device.field_crop_type || '—'}</p>
            </div>
            <div className="p-2.5 bg-gray-50 rounded-lg text-center">
              <p className="text-[10px] text-gray-400">Growth Stage</p>
              <p className="text-sm font-bold text-gray-700">{device.field_growth_stage || '—'}</p>
            </div>
            <div className="p-2.5 bg-gray-50 rounded-lg text-center">
              <p className="text-[10px] text-gray-400">Last Reading</p>
              <p className="text-xs font-medium text-gray-700">
                {device.latest_reading?.timestamp
                  ? new Date(device.latest_reading.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : '—'}
              </p>
            </div>
          </div>

          {/* Mini Map */}
          {device.latitude && device.longitude && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                <i className="bi bi-geo-alt-fill mr-1" />Sensor Location
              </h4>
              <DeviceMapView
                devices={[{ ...device, severity: device.severity }]}
                height="200px"
                showLegend={false}
              />
              <p className="text-[10px] text-gray-400 mt-1 text-center">
                Coordinates: {device.latitude.toFixed(6)}, {device.longitude.toFixed(6)}
              </p>
            </div>
          )}

          {/* Sensor Readings with Color-Coded Status */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              <i className="bi bi-speedometer2 mr-1" />Current Sensor Readings
            </h4>
            <div className="space-y-2">
              <ReadingBar
                label="Nitrogen (N)"
                value={device.severity?.nitrogen?.value}
                unit="mg/kg"
                severity={device.severity?.nitrogen}
                min={device.severity?.nitrogen?.min}
                max={device.severity?.nitrogen?.max}
              />
              <ReadingBar
                label="Phosphorus (P)"
                value={device.severity?.phosphorus?.value}
                unit="mg/kg"
                severity={device.severity?.phosphorus}
                min={device.severity?.phosphorus?.min}
                max={device.severity?.phosphorus?.max}
              />
              <ReadingBar
                label="Potassium (K)"
                value={device.severity?.potassium?.value}
                unit="mg/kg"
                severity={device.severity?.potassium}
                min={device.severity?.potassium?.min}
                max={device.severity?.potassium?.max}
              />
              <ReadingBar
                label="Soil Moisture"
                value={device.severity?.soil_moisture?.value}
                unit="%"
                severity={device.severity?.soil_moisture}
              />
              <ReadingBar
                label="Water Level"
                value={device.severity?.water_level?.value}
                unit="%"
                severity={device.severity?.water_level}
              />
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex items-center justify-center gap-4 py-2 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /><span className="text-[10px] text-gray-500">Sufficient</span></div>
            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /><span className="text-[10px] text-gray-500">Moderate</span></div>
            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className="text-[10px] text-gray-500">Critical</span></div>
          </div>

          {/* Latest Recommendation */}
          {device.latest_recommendation && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                <i className="bi bi-lightbulb mr-1" />Latest Recommendation
              </h4>
              <div className="p-3 bg-prime-50 border border-prime-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-prime-700 bg-prime-100 px-2 py-0.5 rounded-full">
                    {device.latest_recommendation.fertilizer_type || 'None'}
                  </span>
                  {device.latest_recommendation.application_rate && (
                    <span className="text-xs text-prime-600">@ {device.latest_recommendation.application_rate}</span>
                  )}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{device.latest_recommendation.recommendation_text}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

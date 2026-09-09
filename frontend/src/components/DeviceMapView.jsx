import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Custom colored markers using SVG
function createColoredIcon(color) {
  const colorMap = {
    green: '#22c55e',
    yellow: '#eab308',
    red: '#ef4444',
    gray: '#9ca3af'
  }
  const fill = colorMap[color] || colorMap.gray

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <svg width="28" height="40" viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z" fill="${fill}" stroke="#fff" stroke-width="2"/>
        <circle cx="14" cy="14" r="6" fill="white" opacity="0.9"/>
      </svg>
    `,
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -40]
  })
}

const statusLabel = { green: 'Sufficient', yellow: 'Moderate', red: 'Critical', gray: 'No Data' }

export default function DeviceMapView({ devices = [], onDeviceClick, height = '400px' }) {
  // Filter devices with valid coordinates
  const mappableDevices = devices.filter(d => d.latitude && d.longitude)

  // Default center: Philippines (approximate central point)
  const defaultCenter = [14.5, 121.0]
  const center = mappableDevices.length > 0
    ? [mappableDevices[0].latitude, mappableDevices[0].longitude]
    : defaultCenter

  if (mappableDevices.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center" style={{ height }}>
        <div className="text-center py-8">
          <i className="bi bi-geo-alt text-4xl text-gray-300 block mb-2" />
          <p className="text-sm text-gray-400">No devices with GPS coordinates</p>
          <p className="text-xs text-gray-300 mt-1">Register a device with latitude/longitude to see it on the map</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ height }}>
      <MapContainer
        center={center}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mappableDevices.map(device => {
          const color = device.severity?.overallColor || 'gray'
          return (
            <Marker
              key={device.id}
              position={[device.latitude, device.longitude]}
              icon={createColoredIcon(color)}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-sm">{device.device_name || device.device_code}</h3>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      device.status === 'online' ? 'bg-green-100 text-green-700' :
                      device.status === 'fault' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {device.status}
                    </span>
                  </div>

                  {device.field_name && (
                    <p className="text-xs text-gray-500 mb-2">
                      <i className="bi bi-pin-map mr-1" />{device.field_name} — {device.field_location || 'No location'}
                    </p>
                  )}

                  {device.latest_reading ? (
                    <div className="space-y-1.5 border-t border-gray-100 pt-2">
                      {[
                        { key: 'nitrogen', label: 'N', unit: 'mg/kg' },
                        { key: 'phosphorus', label: 'P', unit: 'mg/kg' },
                        { key: 'potassium', label: 'K', unit: 'mg/kg' },
                        { key: 'soil_moisture', label: 'Moisture', unit: '%' },
                        { key: 'water_level', label: 'Water', unit: '%' },
                      ].map(param => {
                        const sev = device.severity?.[param.key]
                        const dotColor = sev?.color === 'green' ? 'bg-green-500' :
                                         sev?.color === 'yellow' ? 'bg-yellow-500' :
                                         sev?.color === 'red' ? 'bg-red-500' : 'bg-gray-400'
                        return (
                          <div key={param.key} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                              <span className="text-gray-600">{param.label}</span>
                            </div>
                            <span className="font-semibold text-gray-800">
                              {device.latest_reading[param.key]?.toFixed(1)} {param.unit}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No readings yet</p>
                  )}

                  {onDeviceClick && (
                    <button
                      onClick={() => onDeviceClick(device.id)}
                      className="mt-2 w-full text-center text-xs font-medium text-white bg-prime-600 hover:bg-prime-700 rounded-md py-1.5 transition-colors"
                    >
                      <i className="bi bi-eye mr-1" />View Details
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}

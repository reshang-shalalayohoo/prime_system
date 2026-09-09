import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Helper for severity colors
const SEVERITY_COLORS = {
  green: '#16a34a',  // Good / Normal / Sufficient
  yellow: '#ca8a04', // Moderate / Needs Attention
  red: '#dc2626',    // Critical / Bad
  gray: '#6b7280'    // No Data / Unknown
}

/**
 * Creates custom SVG Leaflet DivIcon reflecting severity color and connection status
 */
function createColoredIcon(overallColor, status) {
  const pinColor = SEVERITY_COLORS[overallColor] || SEVERITY_COLORS.gray
  const isOnline = status === 'online'
  const isFault = status === 'fault'
  const statusRing = isOnline ? '#22c55e' : (isFault ? '#ef4444' : '#9ca3af')
  const statusGlyph = isOnline ? '✓' : (isFault ? '!' : '✕')

  const svgHtml = `
    <div style="position: relative; width: 34px; height: 46px; cursor: pointer; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));">
      <svg width="34" height="46" viewBox="0 0 34 46" xmlns="http://www.w3.org/2000/svg">
        <!-- Pin Base Body -->
        <path d="M17 0C7.611 0 0 7.611 0 17c0 12.5 17 29 17 29s17-16.5 17-29C34 7.611 26.389 0 17 0z" fill="${pinColor}" stroke="#ffffff" stroke-width="2"/>
        <!-- Inner Center Dot -->
        <circle cx="17" cy="17" r="7.5" fill="#ffffff" opacity="0.95"/>
        <circle cx="17" cy="17" r="4.5" fill="${pinColor}"/>
      </svg>
      <!-- Connection Status Badge (top right) -->
      <div style="position: absolute; top: -2px; right: -2px; width: 15px; height: 15px; border-radius: 50%; background: ${statusRing}; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-size: 8px; font-weight: bold; line-height: 1;">
        ${statusGlyph}
      </div>
    </div>
  `

  return L.divIcon({
    className: 'prime-custom-marker',
    html: svgHtml,
    iconSize: [34, 46],
    iconAnchor: [17, 46],
    popupAnchor: [0, -44]
  })
}

/**
 * Builds standard DOM element for Leaflet .bindPopup()
 */
function createPopupElement(device, onDeviceClick) {
  const container = document.createElement('div')
  container.className = 'prime-popup-content'
  container.style.fontFamily = 'inherit'
  container.style.minWidth = '270px'
  container.style.maxWidth = '310px'
  container.style.padding = '4px 0'

  const sev = device.severity || {}
  const reading = device.latest_reading || {}
  const isOnline = device.status === 'online'
  const isFault = device.status === 'fault'
  const statusBg = isOnline ? '#dcfce7' : (isFault ? '#fee2e2' : '#f3f4f6')
  const statusColor = isOnline ? '#166534' : (isFault ? '#991b1b' : '#374151')
  const statusLabel = isOnline ? 'Online' : (isFault ? 'Fault' : 'Offline')

  const overallLabel = sev.overall || 'No Assessment'
  const overallColorCode = SEVERITY_COLORS[sev.overallColor] || SEVERITY_COLORS.gray

  // Formatted timestamp
  const lastTime = reading.timestamp
    ? new Date(reading.timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : (device.last_communication
        ? new Date(device.last_communication).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'No updates yet')

  // Helper row renderer
  const renderRow = (label, value, unit, paramSev) => {
    const valText = (value !== null && value !== undefined) ? `${Number(value).toFixed(1)} ${unit}` : '—'
    const color = SEVERITY_COLORS[paramSev?.color] || '#9ca3af'
    const statusText = paramSev?.label || (value !== null && value !== undefined ? 'Normal' : 'No Data')

    return `
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; padding: 2px 0;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background-color: ${color};"></span>
          <span style="color: #4b5563; font-weight: 500;">${label}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-weight: 600; color: #1f2937;">${valText}</span>
          <span style="font-size: 9px; padding: 1px 5px; border-radius: 9999px; background: ${color}20; color: ${color}; font-weight: 600;">
            ${statusText}
          </span>
        </div>
      </div>
    `
  }

  container.innerHTML = `
    <!-- Header -->
    <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 8px;">
      <div>
        <div style="font-size: 14px; font-weight: 700; color: #1e293b; line-height: 1.2;">
          ${device.device_name || device.device_code}
        </div>
        <div style="font-size: 10px; font-family: monospace; color: #64748b; margin-top: 2px;">
          ${device.device_code}
        </div>
      </div>
      <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 3px;">
        <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; background: ${statusBg}; color: ${statusColor};">
          ${statusLabel}
        </span>
      </div>
    </div>

    <!-- Field & Location Info -->
    <div style="font-size: 11px; color: #475569; margin-bottom: 8px; line-height: 1.3;">
      <div style="font-weight: 600; color: #0f172a;">
        📍 ${device.field_name || 'Unassigned Field'}
      </div>
      <div style="color: #64748b; font-size: 10px; margin-top: 1px;">
        ${device.field_location || 'No location name recorded'}
      </div>
      <div style="color: #94a3b8; font-size: 9px; margin-top: 2px;">
        Last updated: ${lastTime}
      </div>
    </div>

    <!-- Overall Severity Badge -->
    <div style="background: ${overallColorCode}15; border: 1px solid ${overallColorCode}40; border-radius: 6px; padding: 4px 8px; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
      <span style="font-size: 10px; font-weight: 600; color: #475569;">Overall Condition:</span>
      <span style="font-size: 11px; font-weight: 700; color: ${overallColorCode};">
        ${overallLabel}
      </span>
    </div>

    <!-- Sensor Readings -->
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px; margin-bottom: 10px;">
      <div style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 4px;">
        Sensor Readings & Assessment
      </div>
      ${renderRow('Nitrogen (N)', reading.nitrogen, 'mg/kg', sev.nitrogen)}
      ${renderRow('Phosphorus (P)', reading.phosphorus, 'mg/kg', sev.phosphorus)}
      ${renderRow('Potassium (K)', reading.potassium, 'mg/kg', sev.potassium)}
      ${renderRow('Soil Moisture', reading.soil_moisture, '%', sev.soil_moisture)}
      ${renderRow('Water Level', reading.water_level, '%', sev.water_level)}
    </div>

    <!-- View Details Action Button -->
    <button class="prime-popup-view-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; background-color: #15803d; color: white; border: none; border-radius: 6px; padding: 6px 12px; font-size: 11px; font-weight: 600; cursor: pointer; transition: background 0.15s ease;">
      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
      </svg>
      VIEW DETAILS
    </button>
  `

  // Attach click event to VIEW DETAILS button
  const btn = container.querySelector('.prime-popup-view-btn')
  if (btn && onDeviceClick) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      onDeviceClick(device.id)
    })
    btn.addEventListener('mouseenter', () => { btn.style.backgroundColor = '#166534' })
    btn.addEventListener('mouseleave', () => { btn.style.backgroundColor = '#15803d' })
  }

  return container
}

export default function DeviceMapView({
  devices = [],
  onDeviceClick,
  height = '400px',
  focusDeviceId = null,
  interactive = true,
  showLegend = true
}) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({})

  // Filter devices with valid stored coordinates
  const mappableDevices = devices.filter(d =>
    d.latitude !== null && d.latitude !== undefined &&
    d.longitude !== null && d.longitude !== undefined &&
    !isNaN(Number(d.latitude)) && !isNaN(Number(d.longitude))
  )

  const unconfiguredCount = devices.length - mappableDevices.length

  // Initialize Leaflet Map using standard Leaflet structure
  useEffect(() => {
    if (!mapContainerRef.current) return

    // If map already initialized, remove it
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    // Default center (Philippines archipelago)
    const initialCenter = [14.5995, 120.9842]
    const initialZoom = 11

    // Initialize map using L.map()
    const map = L.map(mapContainerRef.current, {
      zoomControl: interactive,
      scrollWheelZoom: interactive,
      dragging: interactive,
      doubleClickZoom: interactive
    }).setView(initialCenter, initialZoom)

    // Add OpenStreetMap tile layer with required attribution
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
    }).addTo(map)

    mapInstanceRef.current = map

    // Fix map rendering when inside tab/modal container
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 150)

    // Properly clean up the Leaflet map when component unmounts
    return () => {
      clearTimeout(timer)
      map.remove()
      mapInstanceRef.current = null
      markersRef.current = {}
    }
  }, [interactive])

  // Update Markers dynamically when device data or socket readings change
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    // Clean up existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove())
    markersRef.current = {}

    if (mappableDevices.length === 0) {
      map.setView([14.5995, 120.9842], 7)
      return
    }

    const latLngs = []

    mappableDevices.forEach(device => {
      const lat = parseFloat(device.latitude)
      const lng = parseFloat(device.longitude)
      latLngs.push([lat, lng])

      // Determine severity color from backend assessment
      const overallColor = device.severity?.overallColor || 'gray'

      // Create Leaflet marker using standard L.marker()
      const icon = createColoredIcon(overallColor, device.status)
      const marker = L.marker([lat, lng], { icon }).addTo(map)

      // Bind dynamic popup with full sensor and device information
      const popupEl = createPopupElement(device, onDeviceClick)
      marker.bindPopup(popupEl, {
        maxWidth: 320,
        minWidth: 270,
        className: 'prime-leaflet-popup'
      })

      markersRef.current[device.id] = marker
    })

    // Center and zoom appropriately based on available registered sensor locations
    if (latLngs.length === 1) {
      map.setView(latLngs[0], 15)
    } else if (latLngs.length > 1) {
      const bounds = L.latLngBounds(latLngs)
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 })
    }
  }, [devices, onDeviceClick, mappableDevices.length])

  // Focus on specific device when requested (e.g. from "Locate / View" action)
  useEffect(() => {
    if (!focusDeviceId || !mapInstanceRef.current) return
    const targetMarker = markersRef.current[focusDeviceId]
    if (targetMarker) {
      mapInstanceRef.current.setView(targetMarker.getLatLng(), 16, { animate: true })
      targetMarker.openPopup()
    }
  }, [focusDeviceId])

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 flex flex-col">
      {/* Notice for unconfigured devices */}
      {unconfiguredCount > 0 && mappableDevices.length > 0 && (
        <div className="bg-amber-50 border-b border-amber-200 px-3 py-1.5 flex items-center justify-between text-xs text-amber-800 z-10">
          <div className="flex items-center gap-1.5">
            <i className="bi bi-geo-alt text-amber-600" />
            <span>
              <strong>{unconfiguredCount}</strong> registered device{unconfiguredCount > 1 ? 's' : ''} location not yet configured
            </span>
          </div>
          <span className="text-[11px] text-amber-600 italic">
            Assign GPS coordinates in Device Management
          </span>
        </div>
      )}

      {/* Leaflet Map Container */}
      <div
        ref={mapContainerRef}
        style={{ height, width: '100%' }}
        className="relative z-0"
      />

      {/* Empty State Overlay when 0 devices have coordinates */}
      {mappableDevices.length === 0 && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10">
          <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-3">
            <i className="bi bi-geo-alt text-2xl" />
          </div>
          <h3 className="font-bold text-gray-800 text-base">No Device Locations Configured</h3>
          <p className="text-xs text-gray-500 max-w-sm mt-1">
            {devices.length > 0
              ? `${devices.length} sensor device(s) are registered in the system, but their latitude and longitude coordinates have not yet been assigned.`
              : 'No sensor devices registered yet. Register a device with field coordinates to view it on the interactive map.'}
          </p>
        </div>
      )}

      {/* Map Legend Overlay */}
      {showLegend && (
        <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200 px-3 py-2 flex items-center justify-between flex-wrap gap-2 text-xs z-10">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-semibold text-gray-600 text-[11px]">Legend:</span>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-green-600 inline-block" />
              <span className="text-gray-600 text-[11px]">Good / Normal</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" />
              <span className="text-gray-600 text-[11px]">Moderate / Attention</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
              <span className="text-gray-600 text-[11px]">Critical / Bad</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block" />
              <span className="text-gray-600 text-[11px]">No Data</span>
            </div>
            <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
              <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-gray-200 text-[9px] font-bold text-gray-700">✕</span>
              <span className="text-gray-500 text-[11px]">Offline</span>
            </div>
          </div>
          <div className="text-[11px] text-gray-500">
            <strong>{mappableDevices.length}</strong> of <strong>{devices.length}</strong> devices mapped
          </div>
        </div>
      )}
    </div>
  )
}

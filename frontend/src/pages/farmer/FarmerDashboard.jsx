import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Card from '../../components/common/Card'
import StatusBadge from '../../components/common/StatusBadge'
import NutrientTrendChart from '../../components/charts/NutrientTrendChart'
import SoilMoistureChart from '../../components/charts/SoilMoistureChart'
import sensorService from '../../services/sensor.service'
import recommendationService from '../../services/recommendation.service'
import { Droplets, Waves, Leaf, Clock, Lightbulb, FlaskConical } from 'lucide-react'

export default function FarmerDashboard() {
  const { socket } = useAuth()
  const [latest, setLatest] = useState(null)
  const [latestRec, setLatestRec] = useState(null)
  const [readings, setReadings] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [latestData, latestRecData, readingsData] = await Promise.all([
        sensorService.getLatest(),
        recommendationService.getLatest(),
        sensorService.getReadings({ limit: 20 }),
      ])
      setLatest(latestData)
      setLatestRec(latestRecData)
      setReadings(readingsData)
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // Socket.io real-time updates
  useEffect(() => {
    if (!socket) return

    const handleNewReading = (data) => {
      setLatest(data.reading)
      setReadings(prev => [data.reading, ...prev].slice(0, 20))
    }

    const handleNewRec = (data) => {
      setLatestRec(data.recommendation)
    }

    socket.on('new-sensor-reading', handleNewReading)
    socket.on('new-recommendation', handleNewRec)

    return () => {
      socket.off('new-sensor-reading', handleNewReading)
      socket.off('new-recommendation', handleNewRec)
    }
  }, [socket])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 loading-shimmer rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 loading-shimmer rounded-xl" />
          <div className="h-80 loading-shimmer rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Farm Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Real-time soil and nutrient monitoring</p>
        </div>
        {latest && (
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-white px-3 py-1.5 rounded-full shadow-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full live-dot" />
            Live
          </div>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Soil Moisture" value={latest ? `${latest.soil_moisture}%` : '—'} icon={Droplets} color="prime" subtitle="Current level" />
        <Card title="Water Level" value={latest ? `${latest.water_level}%` : '—'} icon={Waves} color="water" subtitle="Irrigation" />
        <Card title="NPK Reading" value={latest ? `${latest.nitrogen} / ${latest.phosphorus} / ${latest.potassium}` : '—'} icon={Leaf} color="earth" subtitle="N / P / K (mg/kg)" />
        <Card title="Last Reading" value={latest ? new Date(latest.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'} icon={Clock} color="purple" subtitle={latest ? new Date(latest.timestamp).toLocaleDateString() : 'No data'} />
      </div>

      {/* Nutrient Status & Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Nutrient Status */}
        <Card title="Current Nutrient Status" className="col-span-1">
          {latestRec ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Nitrogen</p>
                  <StatusBadge status={latestRec.n_status} />
                  <p className="text-lg font-bold text-gray-700 mt-1">{latest?.nitrogen || '—'}</p>
                  <p className="text-[10px] text-gray-400">mg/kg</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Phosphorus</p>
                  <StatusBadge status={latestRec.p_status} />
                  <p className="text-lg font-bold text-gray-700 mt-1">{latest?.phosphorus || '—'}</p>
                  <p className="text-[10px] text-gray-400">mg/kg</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Potassium</p>
                  <StatusBadge status={latestRec.k_status} />
                  <p className="text-lg font-bold text-gray-700 mt-1">{latest?.potassium || '—'}</p>
                  <p className="text-[10px] text-gray-400">mg/kg</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-6">No assessment data yet</p>
          )}
        </Card>

        {/* Fertilizer Recommendation */}
        <Card title="Fertilizer Recommendation" className="col-span-1">
          {latestRec ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-prime-50 rounded-lg border border-prime-100">
                <FlaskConical size={18} className="text-prime-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-prime-800">{latestRec.fertilizer_type}</p>
                  <p className="text-xs text-prime-600 mt-0.5">Application Rate: {latestRec.application_rate}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Lightbulb size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600 leading-relaxed">{latestRec.recommendation_text}</p>
              </div>
              <p className="text-[10px] text-gray-400">
                Generated: {new Date(latestRec.created_at).toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-6">No recommendation available yet</p>
          )}
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Nutrient Trend (N/P/K)">
          <NutrientTrendChart data={readings} />
        </Card>
        <Card title="Soil Moisture & Water Level">
          <SoilMoistureChart data={readings} />
        </Card>
      </div>
    </div>
  )
}

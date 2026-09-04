import { useState, useEffect } from 'react'
import Card from '../../components/common/Card'
import DataTable from '../../components/common/DataTable'
import reportService from '../../services/report.service'
import { BarChart3, Droplets, Waves, Leaf, FileBarChart } from 'lucide-react'

export default function FarmerReports() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    reportService.getFarmerReport()
      .then(data => setReport(data))
      .catch(err => console.error('Failed to fetch report:', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-28 loading-shimmer rounded-xl" />)}</div>
  }

  if (!report || !report.stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <FileBarChart size={40} className="mb-3 opacity-50" />
            <p className="text-sm">No monitoring data available yet</p>
          </div>
        </Card>
      </div>
    )
  }

  const stats = report.stats
  const recStats = report.recommendations?.stats

  const fertColumns = [
    { key: 'applied_at', label: 'Date', render: (val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
    { key: 'fertilizer_type', label: 'Fertilizer Type' },
    { key: 'amount_kg', label: 'Amount (kg/ha)', render: (val) => `${val} kg/ha` },
    { key: 'applied_by', label: 'Applied By' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <p className="text-sm text-gray-500 mt-0.5">Historical monitoring statistics and analysis</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card title="Total Readings" value={stats.total_readings} icon={BarChart3} color="prime" />
        <Card title="Avg Moisture" value={`${stats.avg_moisture}%`} icon={Droplets} color="prime" />
        <Card title="Avg Water Level" value={`${stats.avg_water_level}%`} icon={Waves} color="water" />
        <Card title="Avg Nitrogen" value={`${stats.avg_nitrogen}`} icon={Leaf} color="prime" subtitle="mg/kg" />
        <Card title="Avg Phosphorus" value={`${stats.avg_phosphorus}`} icon={Leaf} color="water" subtitle="mg/kg" />
        <Card title="Avg Potassium" value={`${stats.avg_potassium}`} icon={Leaf} color="earth" subtitle="mg/kg" />
      </div>

      {/* Recommendation Stats */}
      {recStats && (
        <Card title="Nutrient Assessment Summary">
          <div className="grid grid-cols-3 gap-4">
            {['Nitrogen', 'Phosphorus', 'Potassium'].map((nutrient) => {
              const key = nutrient[0].toLowerCase()
              return (
                <div key={nutrient} className="text-center p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">{nutrient}</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-red-600">Deficient</span>
                      <span className="font-bold">{recStats[`${key}_deficient`] || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-green-600">Sufficient</span>
                      <span className="font-bold">{recStats[`${key}_sufficient`] || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-amber-600">Excess</span>
                      <span className="font-bold">{recStats[`${key}_excess`] || 0}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Fertilizer Application History */}
      <Card title="Fertilizer Application History">
        <DataTable
          columns={fertColumns}
          data={report.fertilizerLogs}
          emptyMessage="No fertilizer applications recorded."
        />
      </Card>
    </div>
  )
}

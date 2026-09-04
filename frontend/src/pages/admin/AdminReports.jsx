import { useState, useEffect } from 'react'
import Card from '../../components/common/Card'
import reportService from '../../services/report.service'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { BarChart3, FileBarChart } from 'lucide-react'

const COLORS = { Deficient: '#ef4444', Sufficient: '#22c55e', Excess: '#f59e0b' }

export default function AdminReports() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    reportService.getAdminReport()
      .then(data => setReport(data))
      .catch(err => console.error('Failed to fetch admin report:', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-64 loading-shimmer rounded-xl" />)}</div>
  }

  if (!report) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports & Evaluation</h1>
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <FileBarChart size={40} className="mb-3 opacity-50" />
            <p className="text-sm">No report data available</p>
          </div>
        </Card>
      </div>
    )
  }

  const recStats = report.recommendationStats
  const ov = report.overview

  // Bar chart data for nutrient classifications
  const barData = [
    {
      nutrient: 'Nitrogen',
      Deficient: recStats?.n_deficient || 0,
      Sufficient: recStats?.n_sufficient || 0,
      Excess: recStats?.n_excess || 0,
    },
    {
      nutrient: 'Phosphorus',
      Deficient: recStats?.p_deficient || 0,
      Sufficient: recStats?.p_sufficient || 0,
      Excess: recStats?.p_excess || 0,
    },
    {
      nutrient: 'Potassium',
      Deficient: recStats?.k_deficient || 0,
      Sufficient: recStats?.k_sufficient || 0,
      Excess: recStats?.k_excess || 0,
    },
  ]

  // Pie chart data for overall distribution
  const totalDef = (recStats?.n_deficient || 0) + (recStats?.p_deficient || 0) + (recStats?.k_deficient || 0)
  const totalSuf = (recStats?.n_sufficient || 0) + (recStats?.p_sufficient || 0) + (recStats?.k_sufficient || 0)
  const totalExc = (recStats?.n_excess || 0) + (recStats?.p_excess || 0) + (recStats?.k_excess || 0)
  const pieData = [
    { name: 'Deficient', value: totalDef },
    { name: 'Sufficient', value: totalSuf },
    { name: 'Excess', value: totalExc },
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reports & Evaluation</h1>
        <p className="text-sm text-gray-500 mt-0.5">System-wide nutrient classifications and statistics</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Total Readings" value={ov?.totalReadings || 0} icon={BarChart3} color="prime" />
        <Card title="Recommendations" value={ov?.totalRecommendations || 0} icon={BarChart3} color="water" />
        <Card title="Fertilizer Apps" value={ov?.totalFertilizerApplications || 0} icon={BarChart3} color="earth" />
        <Card title="Active Farmers" value={ov?.totalFarmers || 0} icon={BarChart3} color="purple" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nutrient Classification Bar Chart */}
        <Card title="Nutrient Classification Distribution">
          {recStats?.total_recommendations > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="nutrient" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Deficient" fill={COLORS.Deficient} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Sufficient" fill={COLORS.Sufficient} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Excess" fill={COLORS.Excess} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">No classification data</div>
          )}
        </Card>

        {/* Overall Distribution Pie Chart */}
        <Card title="Overall Nutrient Status Distribution">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">No distribution data</div>
          )}
        </Card>
      </div>

      {/* Detailed Stats */}
      <Card title="System-wide Sensor Averages">
        {report.sensorStats ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Avg Moisture', value: `${report.sensorStats.avg_moisture}%` },
              { label: 'Avg Water Level', value: `${report.sensorStats.avg_water_level}%` },
              { label: 'Avg Nitrogen', value: `${report.sensorStats.avg_nitrogen} mg/kg` },
              { label: 'Avg Phosphorus', value: `${report.sensorStats.avg_phosphorus} mg/kg` },
              { label: 'Avg Potassium', value: `${report.sensorStats.avg_potassium} mg/kg` },
            ].map(item => (
              <div key={item.label} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="text-xl font-bold text-gray-700 mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-6">No sensor statistics available</p>
        )}
      </Card>
    </div>
  )
}

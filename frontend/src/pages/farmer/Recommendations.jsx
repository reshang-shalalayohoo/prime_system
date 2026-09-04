import { useState, useEffect } from 'react'
import Card from '../../components/common/Card'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import recommendationService from '../../services/recommendation.service'
import { Lightbulb } from 'lucide-react'

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    recommendationService.getAll()
      .then(data => setRecommendations(data))
      .catch(err => console.error('Failed to fetch recommendations:', err))
      .finally(() => setLoading(false))
  }, [])

  const columns = [
    {
      key: 'created_at',
      label: 'Date/Time',
      render: (val) => new Date(val).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    },
    { key: 'n_status', label: 'Nitrogen', render: (val) => <StatusBadge status={val} size="sm" /> },
    { key: 'p_status', label: 'Phosphorus', render: (val) => <StatusBadge status={val} size="sm" /> },
    { key: 'k_status', label: 'Potassium', render: (val) => <StatusBadge status={val} size="sm" /> },
    { key: 'fertilizer_type', label: 'Fertilizer Type' },
    { key: 'application_rate', label: 'Rate' },
    {
      key: 'recommendation_text',
      label: 'Recommendation',
      render: (val) => <span className="text-xs text-gray-600 line-clamp-2 max-w-xs">{val}</span>
    },
  ]

  if (loading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 loading-shimmer rounded-xl" />)}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Recommendations</h1>
        <p className="text-sm text-gray-500 mt-0.5">Fertilizer recommendations based on SSNM/NOPT analysis</p>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={recommendations}
          emptyMessage="No recommendations generated yet. Sensor readings will trigger automatic assessments."
          emptyIcon={Lightbulb}
        />
      </Card>
    </div>
  )
}

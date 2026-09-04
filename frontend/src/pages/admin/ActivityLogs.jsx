import { useState, useEffect } from 'react'
import Card from '../../components/common/Card'
import DataTable from '../../components/common/DataTable'
import activityService from '../../services/activity.service'
import { ScrollText, Clock } from 'lucide-react'

export default function ActivityLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    activityService.getAll({ limit: 100 })
      .then(data => setLogs(data))
      .catch(err => console.error('Failed to fetch activity logs:', err))
      .finally(() => setLoading(false))
  }, [])

  const columns = [
    {
      key: 'timestamp',
      label: 'Date/Time',
      render: (val) => (
        <div className="flex items-center gap-2">
          <Clock size={13} className="text-gray-400" />
          <span>{new Date(val).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )
    },
    { key: 'user_name', label: 'User', render: (val, row) => (
      <div>
        <p className="font-medium text-gray-800">{val || 'System'}</p>
        {row.username && <p className="text-[10px] text-gray-400">@{row.username}</p>}
      </div>
    )},
    { key: 'action', label: 'Action', render: (val) => (
      <span className="text-xs font-medium px-2 py-1 rounded-full bg-prime-50 text-prime-700">{val}</span>
    )},
    { key: 'entity_type', label: 'Entity', render: (val) => val ? val.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '—' },
    { key: 'details', label: 'Details', render: (val) => <span className="text-xs text-gray-500 line-clamp-2 max-w-sm">{val || '—'}</span> },
  ]

  if (loading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 loading-shimmer rounded-xl" />)}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Activity Logs</h1>
        <p className="text-sm text-gray-500 mt-0.5">System-wide activity audit trail</p>
      </div>

      <Card>
        <DataTable columns={columns} data={logs} emptyMessage="No activity recorded yet." emptyIcon={ScrollText} />
      </Card>
    </div>
  )
}

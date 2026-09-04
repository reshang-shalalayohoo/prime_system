import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/common/StatusBadge'
import AlertBanner from '../../components/common/AlertBanner'
import alertService from '../../services/alert.service'
import { Bell, CheckCheck, AlertTriangle, Info, AlertCircle } from 'lucide-react'

export default function Alerts() {
  const { socket } = useAuth()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    alertService.getAll()
      .then(data => setAlerts(data))
      .catch(err => console.error('Failed to fetch alerts:', err))
      .finally(() => setLoading(false))
  }, [])

  // Socket.io for new alerts
  useEffect(() => {
    if (!socket) return
    const handleNewAlert = (alert) => {
      setAlerts(prev => [alert, ...prev])
    }
    socket.on('new-alert', handleNewAlert)
    return () => socket.off('new-alert', handleNewAlert)
  }, [socket])

  const handleMarkRead = async (id) => {
    try {
      await alertService.markAsRead(id)
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: 1 } : a))
    } catch (err) {
      console.error('Failed to mark alert as read:', err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await alertService.markAllAsRead()
      setAlerts(prev => prev.map(a => ({ ...a, is_read: 1 })))
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'nutrient_deficiency': return <AlertTriangle size={18} className="text-amber-500" />
      case 'nutrient_excess': return <AlertCircle size={18} className="text-amber-600" />
      case 'invalid_reading': return <AlertCircle size={18} className="text-red-500" />
      case 'device_offline': return <AlertCircle size={18} className="text-red-600" />
      default: return <Info size={18} className="text-blue-500" />
    }
  }

  const unreadCount = alerts.filter(a => !a.is_read).length

  if (loading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 loading-shimmer rounded-xl" />)}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Alerts</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck size={14} />
            Mark All as Read
          </Button>
        )}
      </div>

      {alerts.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Bell size={40} className="mb-3 opacity-50" />
            <p className="text-sm">No alerts at this time</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`flex items-start gap-4 p-4 bg-white rounded-xl border transition-all ${
                alert.is_read ? 'border-gray-100 opacity-70' : 'border-l-4 border-l-amber-400 border-gray-100 shadow-sm'
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">{getIcon(alert.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={alert.severity} size="sm" />
                  {alert.field_name && <span className="text-xs text-gray-400">{alert.field_name}</span>}
                </div>
                <p className="text-sm text-gray-700">{alert.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(alert.created_at).toLocaleString()}</p>
              </div>
              {!alert.is_read && (
                <Button variant="ghost" size="sm" onClick={() => handleMarkRead(alert.id)}>
                  Mark Read
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

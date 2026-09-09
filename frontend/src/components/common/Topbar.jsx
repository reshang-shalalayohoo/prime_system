import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import alertService from '../../services/alert.service'
import primeLogo from '../../assets/PRIME-logo.jpg'

export default function Topbar() {
  const { user, logout, socket } = useAuth()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [alerts, setAlerts] = useState([])
  const [showNotifPanel, setShowNotifPanel] = useState(false)
  const [loadingAlerts, setLoadingAlerts] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const panelRef = useRef(null)

  // Fetch unread count on mount
  useEffect(() => {
    alertService.getUnreadCount()
      .then(data => setUnreadCount(data.count))
      .catch(() => {})
  }, [])

  // Listen for new alerts via Socket.io
  useEffect(() => {
    if (!socket) return
    const handleNewAlert = (alert) => {
      setAlerts(prev => [alert, ...prev].slice(0, 10))
      setUnreadCount(prev => prev + 1)
    }
    socket.on('new-alert', handleNewAlert)
    return () => socket.off('new-alert', handleNewAlert)
  }, [socket])

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowNotifPanel(false)
      }
    }
    if (showNotifPanel) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showNotifPanel])

  const toggleNotifPanel = async () => {
    const willOpen = !showNotifPanel
    setShowNotifPanel(willOpen)

    if (willOpen && alerts.length === 0) {
      setLoadingAlerts(true)
      try {
        const data = await alertService.getAll({ limit: 8 })
        setAlerts(data)
      } catch (err) {
        console.error('Failed to fetch alerts:', err)
      } finally {
        setLoadingAlerts(false)
      }
    }
  }

  const handleMarkRead = async (id) => {
    try {
      await alertService.markAsRead(id)
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: 1 } : a))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await alertService.markAllAsRead()
      setAlerts(prev => prev.map(a => ({ ...a, is_read: 1 })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const handleViewAll = () => {
    setShowNotifPanel(false)
    if (user?.role === 'admin') {
      navigate('/admin/activity')
    } else {
      navigate('/farmer/alerts')
    }
  }

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false)
    logout()
    navigate('/login', {
      replace: true,
      state: { message: 'You have been logged out successfully.', type: 'success' }
    })
  }

  const handleLogoutCancel = () => {
    setShowLogoutModal(false)
  }

  const getAlertIcon = (type) => {
    switch (type) {
      case 'nutrient_deficiency': return 'bi-exclamation-triangle-fill text-amber-500'
      case 'nutrient_excess': return 'bi-arrow-up-circle-fill text-amber-600'
      case 'invalid_reading': return 'bi-x-circle-fill text-red-500'
      case 'device_offline': return 'bi-wifi-off text-red-600'
      default: return 'bi-info-circle-fill text-blue-500'
    }
  }

  return (
    <>
      <header className="h-14 md:h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 md:hidden">
          <img src={primeLogo} alt="PRIME" className="w-8 h-8 object-contain rounded" />
          <span className="text-sm font-bold text-prime-800">PRIME</span>
        </div>

        {/* Desktop date */}
        <div className="hidden md:block">
          <h2 className="text-sm font-medium text-gray-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h2>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          {/* Notification bell with dropdown panel */}
          <div className="relative" ref={panelRef}>
            <button
              onClick={toggleNotifPanel}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="View notifications"
            >
              <i className="bi bi-bell text-gray-500 text-lg" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifPanel && (
              <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in z-50">
                {/* Panel Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <i className="bi bi-bell-fill text-prime-600 text-sm" />
                    <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-prime-600 hover:text-prime-700 font-medium hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Panel Content */}
                <div className="max-h-80 overflow-y-auto">
                  {loadingAlerts ? (
                    <div className="py-8 text-center">
                      <div className="w-6 h-6 border-2 border-prime-200 border-t-prime-600 rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-xs text-gray-400">Loading...</p>
                    </div>
                  ) : alerts.length === 0 ? (
                    <div className="py-10 text-center">
                      <i className="bi bi-bell-slash text-3xl text-gray-300 block mb-2" />
                      <p className="text-sm text-gray-400">No notifications yet</p>
                      <p className="text-[10px] text-gray-300 mt-1">Alerts will appear when sensor readings trigger events</p>
                    </div>
                  ) : (
                    alerts.map(alert => (
                      <div
                        key={alert.id}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50/80 transition-colors cursor-pointer ${
                          !alert.is_read ? 'bg-prime-50/40' : ''
                        }`}
                        onClick={() => !alert.is_read && handleMarkRead(alert.id)}
                      >
                        <i className={`bi ${getAlertIcon(alert.type)} text-base mt-0.5 flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                              alert.severity === 'critical' ? 'bg-red-100 text-red-700' :
                              alert.severity === 'warning' ? 'bg-amber-100 text-amber-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {alert.severity}
                            </span>
                            {!alert.is_read && <span className="w-1.5 h-1.5 bg-prime-500 rounded-full" />}
                          </div>
                          <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">{alert.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            <i className="bi bi-clock mr-1" />
                            {new Date(alert.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Panel Footer */}
                <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
                  <button
                    onClick={handleViewAll}
                    className="w-full text-center text-xs font-medium text-prime-600 hover:text-prime-700 py-1 hover:underline"
                  >
                    <i className="bi bi-arrow-right mr-1" />
                    View all {user?.role === 'admin' ? 'activity' : 'alerts'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User info */}
          <div className="flex items-center gap-2 md:gap-3 pl-3 md:pl-4 border-l border-gray-100">
            <div className="w-8 h-8 bg-prime-100 text-prime-700 rounded-full flex items-center justify-center">
              <i className="bi bi-person-fill text-sm" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-700">{user?.fullName || user?.username}</p>
              <p className="text-[10px] text-gray-400 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogoutClick}
              className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors ml-1"
              title="Logout"
            >
              <i className="bi bi-box-arrow-right text-base" />
            </button>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleLogoutCancel} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full animate-fade-in">
            <div className="p-6 text-center">
              {/* Icon */}
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="bi bi-box-arrow-right text-2xl text-red-500" />
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-2">Log Out</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to log out of your PRIME account?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleLogoutCancel}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-sm"
                >
                  <i className="bi bi-box-arrow-right mr-1.5" />
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

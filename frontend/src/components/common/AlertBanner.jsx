import { useState, useEffect } from 'react'
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react'

export default function AlertBanner({ type = 'info', message, onDismiss, autoDismiss = 5000 }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => { setVisible(false); onDismiss?.() }, autoDismiss)
      return () => clearTimeout(timer)
    }
  }, [autoDismiss, onDismiss])

  if (!visible) return null

  const config = {
    success: { bg: 'bg-green-50 border-green-200', text: 'text-green-800', icon: CheckCircle },
    warning: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', icon: AlertTriangle },
    error: { bg: 'bg-red-50 border-red-200', text: 'text-red-800', icon: XCircle },
    info: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', icon: Info },
  }

  const { bg, text, icon: Icon } = config[type] || config.info

  return (
    <div className={`flex items-center gap-3 p-3 ${bg} ${text} rounded-lg border animate-slide-in`}>
      <Icon size={18} className="flex-shrink-0" />
      <p className="text-sm flex-1">{message}</p>
      <button onClick={() => { setVisible(false); onDismiss?.() }} className="p-0.5 hover:opacity-70">
        <X size={14} />
      </button>
    </div>
  )
}

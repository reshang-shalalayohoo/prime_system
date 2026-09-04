export default function StatusBadge({ status, size = 'md' }) {
  const config = {
    'Deficient': { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
    'Sufficient': { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
    'Excess': { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
    'online': { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
    'offline': { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
    'fault': { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
    'active': { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
    'inactive': { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
    'warning': { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
    'critical': { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
    'info': { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  }

  const { bg, text, dot } = config[status] || { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' }
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'

  return (
    <span className={`inline-flex items-center gap-1.5 ${bg} ${text} ${sizeClass} rounded-full font-medium`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} ${status === 'online' ? 'live-dot' : ''}`} />
      {status}
    </span>
  )
}

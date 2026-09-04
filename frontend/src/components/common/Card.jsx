export default function Card({ title, value, subtitle, icon: Icon, trend, color = 'prime', className = '', children }) {
  const colorMap = {
    prime: 'from-prime-600 to-prime-700',
    water: 'from-water-500 to-water-700',
    earth: 'from-earth-500 to-earth-700',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-700',
  }

  if (children) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-fade-in ${className}`}>
        {title && <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{title}</h3>}
        {children}
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-br ${colorMap[color] || colorMap.prime} rounded-xl shadow-lg p-5 text-white animate-fade-in ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value ?? '—'}</p>
          {subtitle && <p className="text-xs text-white/70 mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-xs mt-1 ${trend > 0 ? 'text-green-200' : 'text-red-200'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last reading
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-2 bg-white/20 rounded-lg">
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  )
}

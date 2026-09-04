import { NavLink } from 'react-router-dom'
import primeLogo from '../../assets/PRIME-logo.jpg'

export default function Sidebar({ items, basePath }) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-60 bg-sidebar flex-col z-30 hidden md:flex">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <img src={primeLogo} alt="PRIME Logo" className="w-10 h-10 object-contain rounded-lg" />
          <div>
            <h1 className="text-white font-bold text-base leading-tight">PRIME</h1>
            <p className="text-[10px] text-white/50 leading-tight">Nutrient Monitoring</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {items.map(item => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={`${basePath}${item.path}`}
                end={item.path === ''}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                  ${isActive 
                    ? 'bg-prime-600 text-white shadow-lg shadow-prime-600/30' 
                    : 'text-white/60 hover:text-white hover:bg-sidebar-hover'}`
                }
              >
                <Icon size={18} className="flex-shrink-0" />
                <span>{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10">
          <p className="text-[10px] text-white/30">PRIME System v1.0</p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-sidebar border-t border-white/10 flex md:hidden safe-area-bottom">
        {items.map(item => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={`${basePath}${item.path}`}
              end={item.path === ''}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center py-2 pt-2.5 text-[10px] font-medium transition-all duration-200 relative
                ${isActive 
                  ? 'text-prime-400' 
                  : 'text-white/40 hover:text-white/70'}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-prime-400 rounded-full" />
                  )}
                  <Icon size={20} className="mb-0.5" />
                  <span className="truncate max-w-[60px]">{item.label}</span>
                  {item.badge != null && item.badge > 0 && (
                    <span className="absolute top-1 right-1/4 bg-red-500 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>
    </>
  )
}

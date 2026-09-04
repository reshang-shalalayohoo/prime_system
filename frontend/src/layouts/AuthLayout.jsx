import { Outlet } from 'react-router-dom'
import primeLogo from '../assets/PRIME-logo.jpg'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-prime-900 via-prime-800 to-prime-950 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-prime-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-prime-400/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg shadow-prime-600/20 mb-4">
            <img src={primeLogo} alt="PRIME Logo" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white">PRIME</h1>
          <p className="text-prime-300 text-sm mt-1">Palay Resource & Irrigation Monitoring for Fertilizer Efficiency</p>
        </div>

        <Outlet />
      </div>
    </div>
  )
}

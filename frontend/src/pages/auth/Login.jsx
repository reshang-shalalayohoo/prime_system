import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/common/Button'
import AlertBanner from '../../components/common/AlertBanner'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await login(username, password)
      navigate(user.role === 'admin' ? '/admin' : '/farmer', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
      <h2 className="text-xl font-semibold text-white text-center mb-6">Sign In</h2>

      {error && <AlertBanner type="error" message={error} onDismiss={() => setError('')} autoDismiss={0} />}

      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-prime-200 mb-1.5">Username</label>
          <input
            id="login-username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-prime-400 focus:border-transparent transition-all"
            placeholder="Enter your username"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-prime-200 mb-1.5">Password</label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-prime-400 focus:border-transparent transition-all pr-10"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors text-sm"
            >
              <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
            </button>
          </div>
        </div>

        <Button type="submit" loading={loading} className="w-full mt-6" size="lg">
          <i className="bi bi-box-arrow-in-right" />
          Sign In
        </Button>
      </form>

      <div className="mt-6 pt-4 border-t border-white/10">
        <p className="text-xs text-white/40 text-center">Demo Accounts</p>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <button
            type="button"
            onClick={() => { setUsername('farmer1'); setPassword('password123') }}
            className="text-xs text-prime-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg py-2 px-3 transition-colors text-center"
          >
            <i className="bi bi-tree mr-1" /> Farmer
          </button>
          <button
            type="button"
            onClick={() => { setUsername('admin1'); setPassword('password123') }}
            className="text-xs text-prime-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg py-2 px-3 transition-colors text-center"
          >
            <i className="bi bi-gear mr-1" /> Admin
          </button>
        </div>
      </div>
    </div>
  )
}

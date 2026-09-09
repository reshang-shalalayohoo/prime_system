import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import Button from '../../components/common/Button'
import AlertBanner from '../../components/common/AlertBanner'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  // Show messages passed via navigation state (from signup or logout)
  useEffect(() => {
    if (location.state?.message) {
      if (location.state.type === 'success') {
        setSuccessMessage(location.state.message)
        toast.success(location.state.message)
      } else if (location.state.type === 'info') {
        toast.info(location.state.message)
      }
      // Clear navigation state so message doesn't re-appear on refresh
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)

    try {
      const user = await login(username, password)
      toast.success(`Welcome back, ${user.fullName || user.username}!`)
      navigate(user.role === 'admin' ? '/admin' : '/farmer', { replace: true })
    } catch (err) {
      const serverError = err.response?.data?.error
      if (serverError) {
        setError(serverError)
      } else {
        setError('Login failed. Please check your credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
      <h2 className="text-xl font-semibold text-white text-center mb-6">Sign In</h2>

      {successMessage && (
        <div className="flex items-start gap-2.5 px-4 py-3 bg-green-500/15 border border-green-400/30 rounded-lg mb-4">
          <i className="bi bi-check-circle-fill text-green-400 mt-0.5" />
          <p className="text-sm text-green-200">{successMessage}</p>
        </div>
      )}

      {error && <AlertBanner type="error" message={error} onDismiss={() => setError('')} autoDismiss={0} />}

      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-prime-200 mb-1.5">Username or Email</label>
          <input
            id="login-username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-prime-400 focus:border-transparent transition-all"
            placeholder="Enter your username or email"
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

      <div className="mt-6 pt-4 border-t border-white/10 text-center">
        <p className="text-sm text-white/50">
          Don't have an account?{' '}
          <Link to="/signup" className="text-prime-300 hover:text-white font-medium transition-colors">
            Sign Up as Farmer
          </Link>
        </p>
      </div>
    </div>
  )
}

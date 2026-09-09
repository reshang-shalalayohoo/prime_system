import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import authService from '../../services/auth.service'
import Button from '../../components/common/Button'
import AlertBanner from '../../components/common/AlertBanner'

export default function SignUp() {
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Client-side validation
    if (!form.fullName.trim() || !form.username.trim() || !form.password) {
      setError('Full name, username, and password are required.')
      return
    }

    if (form.username.trim().length < 3) {
      setError('Username must be at least 3 characters.')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      await authService.register({
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        email: form.email.trim() || undefined,
        password: form.password
      })

      // Redirect to login with success message (do NOT auto-login)
      navigate('/login', {
        replace: true,
        state: { message: 'Account created successfully! Please log in using your new credentials.', type: 'success' }
      })
    } catch (err) {
      const serverError = err.response?.data?.error
      if (serverError) {
        setError(serverError)
      } else if (!err.response) {
        setError('Cannot connect to backend server. Please verify the API server is online.')
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-prime-400 focus:border-transparent transition-all'

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
      <h2 className="text-xl font-semibold text-white text-center mb-1">Create Account</h2>
      <p className="text-sm text-prime-300 text-center mb-6">Register as a PRIME Farmer</p>

      {error && <AlertBanner type="error" message={error} onDismiss={() => setError('')} autoDismiss={0} />}

      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-prime-200 mb-1.5">Full Name</label>
          <input
            id="signup-fullname"
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            className={inputClass}
            placeholder="e.g. Juan Dela Cruz"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-prime-200 mb-1.5">Username</label>
          <input
            id="signup-username"
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            className={inputClass}
            placeholder="Choose a username (min. 3 characters)"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-prime-200 mb-1.5">
            Email <span className="text-white/30">(optional)</span>
          </label>
          <input
            id="signup-email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className={inputClass}
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-prime-200 mb-1.5">Password</label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              className={`${inputClass} pr-10`}
              placeholder="Min. 6 characters"
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

        <div>
          <label className="block text-sm font-medium text-prime-200 mb-1.5">Confirm Password</label>
          <input
            id="signup-confirm-password"
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            className={inputClass}
            placeholder="Re-enter your password"
            required
          />
        </div>

        <Button type="submit" loading={loading} className="w-full mt-6" size="lg">
          <i className="bi bi-person-plus" />
          Create Farmer Account
        </Button>
      </form>

      <div className="mt-6 pt-4 border-t border-white/10 text-center">
        <p className="text-sm text-white/50">
          Already have an account?{' '}
          <Link to="/login" className="text-prime-300 hover:text-white font-medium transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

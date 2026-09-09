import axios from 'axios'

// Determine base API URL:
// 1. Explicit VITE_API_URL from environment variables (e.g. Vercel production)
// 2. Local development fallback to http://localhost:3000/api
// 3. Fallback to relative /api
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/$/, '')
  }
  if (import.meta.env.DEV) {
    return 'http://localhost:3000/api'
  }
  return '/api'
}

const API_URL = getApiBaseUrl()

const api = axios.create({ 
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('prime_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    const url = error.config?.url || ''
    const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/register')
    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('prime_token')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

const authService = {
  async login(username, password) {
    const { data } = await api.post('/auth/login', { username, password })
    return data
  },
  async register(userData) {
    const { data } = await api.post('/auth/register', userData)
    return data
  },
  async getMe() {
    const { data } = await api.get('/auth/me')
    return data
  }
}

export { api, API_URL }
export default authService

import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('prime_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('prime_token')
      window.location.href = '/login'
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

export { api }
export default authService

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { io } from 'socket.io-client'
import authService, { API_URL } from '../services/auth.service'

const AuthContext = createContext(null)

// Determine Socket.IO server URL:
// 1. Explicit VITE_SOCKET_URL from environment
// 2. Derived from VITE_API_URL or API_URL (stripping trailing /api)
// 3. Local development fallback to http://localhost:3000
// 4. Production fallback to window.location.origin
const getSocketUrl = () => {
  const envSocketUrl = import.meta.env.VITE_SOCKET_URL
  if (envSocketUrl && typeof envSocketUrl === 'string' && envSocketUrl.trim() !== '') {
    return envSocketUrl.trim().replace(/\/$/, '')
  }
  const currentApiUrl = import.meta.env.VITE_API_URL || API_URL
  if (currentApiUrl && typeof currentApiUrl === 'string' && currentApiUrl.startsWith('http')) {
    return currentApiUrl.replace(/\/api\/?$/, '')
  }
  if (import.meta.env.DEV) {
    return 'http://localhost:3000'
  }
  return window.location.origin
}

const SOCKET_URL = getSocketUrl()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('prime_token'))
  const [loading, setLoading] = useState(true)
  const [socket, setSocket] = useState(null)
  const socketRef = useRef(null)

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setSocket(null)
    }
  }, [])

  const connectSocket = useCallback((currentUser) => {
    disconnectSocket()

    const newSocket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      withCredentials: true
    })

    newSocket.on('connect', () => {
      if (currentUser?.role === 'admin') {
        newSocket.emit('join-admin')
      }
    })

    socketRef.current = newSocket
    setSocket(newSocket)
    return newSocket
  }, [disconnectSocket])

  useEffect(() => {
    let isMounted = true

    if (token) {
      authService.getMe()
        .then(userData => {
          if (isMounted) {
            setUser(userData)
            connectSocket(userData)
          }
        })
        .catch(() => {
          if (isMounted) {
            localStorage.removeItem('prime_token')
            setToken(null)
            setUser(null)
            disconnectSocket()
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false)
        })
    } else {
      setLoading(false)
      disconnectSocket()
    }

    return () => {
      isMounted = false
    }
  }, [token, connectSocket, disconnectSocket])

  useEffect(() => {
    return () => {
      disconnectSocket()
    }
  }, [disconnectSocket])

  const login = useCallback(async (username, password) => {
    const data = await authService.login(username, password)
    localStorage.setItem('prime_token', data.token)
    setToken(data.token)
    setUser(data.user)
    connectSocket(data.user)
    return data.user
  }, [connectSocket])

  const logout = useCallback(() => {
    localStorage.removeItem('prime_token')
    setToken(null)
    setUser(null)
    disconnectSocket()
  }, [disconnectSocket])

  const value = { user, token, loading, socket, login, logout, isAuthenticated: !!user }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export default AuthContext

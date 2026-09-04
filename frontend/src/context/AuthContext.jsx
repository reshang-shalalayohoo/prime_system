import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { io } from 'socket.io-client'
import authService from '../services/auth.service'

const AuthContext = createContext(null)

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || `${window.location.protocol}//${window.location.hostname}:3000`

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('prime_token'))
  const [loading, setLoading] = useState(true)
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    if (token) {
      authService.getMe()
        .then(userData => {
          setUser(userData)
          // Connect socket
          const newSocket = io(SOCKET_URL, { transports: ['websocket', 'polling'] })
          setSocket(newSocket)
        })
        .catch(() => {
          localStorage.removeItem('prime_token')
          setToken(null)
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }

    return () => {
      if (socket) socket.disconnect()
    }
  }, [token])

  const login = useCallback(async (username, password) => {
    const data = await authService.login(username, password)
    localStorage.setItem('prime_token', data.token)
    setToken(data.token)
    setUser(data.user)
    const newSocket = io(SOCKET_URL, { transports: ['websocket', 'polling'] })
    setSocket(newSocket)
    return data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('prime_token')
    setToken(null)
    setUser(null)
    if (socket) {
      socket.disconnect()
      setSocket(null)
    }
  }, [socket])

  const value = { user, token, loading, socket, login, logout, isAuthenticated: !!user }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export default AuthContext

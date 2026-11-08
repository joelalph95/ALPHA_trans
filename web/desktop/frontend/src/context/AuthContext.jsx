import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored && token) {
      const parsedUser = JSON.parse(stored)
      setUser(parsedUser)
      authService.getProfile(parsedUser.id)
        .then(res => {
          if (res.data.success) {
            setUser(res.data.user)
            localStorage.setItem('user', JSON.stringify(res.data.user))
          }
        })
        .catch(() => {
          setUser(null)
          setToken(null)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        })
    }
    setLoading(false)
  }, [token])

  const login = (userData, jwtToken) => {
    setUser(userData)
    setToken(jwtToken)
    localStorage.setItem('token', jwtToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

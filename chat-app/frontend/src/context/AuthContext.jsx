import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetchMe() {
      try {
        const { data } = await api.get('/api/auth/me')
        if (!cancelled) setUser(data.user)
      } catch (_) {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchMe()
    return () => { cancelled = true }
  }, [])

  async function login(email, password) {
    await api.post('/api/auth/login', { email, password })
    const { data } = await api.get('/api/auth/me')
    setUser(data.user)
  }

  async function signup(name, email, password) {
    await api.post('/api/auth/signup', { name, email, password })
    const { data } = await api.get('/api/auth/me')
    setUser(data.user)
  }

  async function logout() {
    await api.post('/api/auth/logout')
    setUser(null)
  }

  async function updateUser(updatedUser) {
    setUser(updatedUser)
  }

  const value = useMemo(() => ({ user, loading, login, signup, logout, updateUser }), [user, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}



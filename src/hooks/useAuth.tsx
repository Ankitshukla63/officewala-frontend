import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '@/lib/api'
import { signOut as doSignOut } from '@/lib/auth'

type AuthUser = { id: string; email: string; displayName: string }
type AuthValue = { user: AuthUser | null; loading: boolean; displayName: string; signOut: () => void }

const AuthContext = createContext<AuthValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const queryToken = params.get('auth_token')
      if (queryToken) {
        localStorage.setItem('ow_token', queryToken)
        params.delete('auth_token')
        const cleanQuery = params.toString()
        const cleanUrl = window.location.pathname + (cleanQuery ? `?${cleanQuery}` : '')
        window.history.replaceState({}, '', cleanUrl)
      }
    }

    const token = localStorage.getItem('ow_token')
    if (!token) {
      setLoading(false)
      return
    }

    api.get('/api/auth/me')
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('ow_token')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const value = {
    user,
    loading,
    displayName: user?.displayName || user?.email || '',
    signOut: doSignOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

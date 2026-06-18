'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Toaster } from 'sonner'

import { type AuthUser, fetchMe, logout as logoutApi } from '../lib/auth'
import { useScreenInit } from '../useScreenInit'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  logout: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function Providers({ children }: { children: React.ReactNode }) {
  useScreenInit()

  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMe().then((me) => {
      setUser(me)
      setLoading(false)
    })
  }, [])

  const logout = async () => {
    await logoutApi()
    setUser(null)
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      <Toaster position="bottom-right" />
      {children}
    </AuthContext.Provider>
  )
}

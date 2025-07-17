"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { dbClient } from '@/lib/database-client'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  isLoading: boolean
  token: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing session on mount
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem('user')
      const savedToken = localStorage.getItem('authToken')
      const sessionExpiry = localStorage.getItem('sessionExpiry')
      
      if (savedUser && savedToken && sessionExpiry) {
        // Check if session is still valid
        if (new Date() < new Date(sessionExpiry)) {
          try {
            const user = JSON.parse(savedUser)
            // Verify user still exists and is active
            const result = await dbClient.verifyUser(user.id)
            if (result.success && result.user) {
              setUser(user)
              setToken(savedToken)
            } else {
              // User doesn't exist or is inactive
              clearSession()
            }
          } catch (error) {
            console.error('Session verification error:', error)
            clearSession()
          }
        } else {
          // Session expired
          clearSession()
        }
      }
      
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  const clearSession = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('authToken')
    localStorage.removeItem('sessionExpiry')
    setUser(null)
    setToken(null)
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Use the client to authenticate via API
      const result = await dbClient.login(email, password)
      
      if (!result.success || !result.user) {
        return { success: false, message: result.message }
      }

      // Create user session
      const userSession = {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role
      }

      // Get the JWT token from the response
      const authToken = (result as any).token || ''
      const sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

      // Store in localStorage (in real app, use secure httpOnly cookies)
      localStorage.setItem('user', JSON.stringify(userSession))
      localStorage.setItem('authToken', authToken)
      localStorage.setItem('sessionExpiry', sessionExpiry)

      setUser(userSession)
      setToken(authToken)
      
      return { success: true, message: 'Login successful' }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Login failed. Please try again.' }
    }
  }

  const logout = () => {
    clearSession()
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
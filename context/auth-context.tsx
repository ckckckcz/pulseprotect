"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export interface User {
  id: number
  nama_lengkap: string
  email: string
  nomor_telepon?: string | null
  role: string
  created_at?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  register: (data: {
    email: string
    password: string
    fullName: string
    phone?: string
  }) => Promise<any>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  register: async () => ({}),
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const router = useRouter()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error initializing auth:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    
    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const userData = await authService.login({ email, password })
      
      // Save user to local storage
      localStorage.setItem('user', JSON.stringify(userData))
      
      // Update auth state
      setUser(userData)
      
      // Redirect to home page after successful login
      router.push('/')
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    setLoading(true)
    try {
      // Google auth implementation would go here
      throw new Error('Google login belum diimplementasikan')
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      // Clear local storage
      localStorage.removeItem('user')
      
      // Clear state
      setUser(null)
      
      // Redirect to login page
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: {
    email: string
    password: string
    fullName: string
    phone?: string
  }) => {
    setLoading(true)
    try {
      const result = await authService.register(data)
      return result
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    login,
    loginWithGoogle,
    logout,
    register,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

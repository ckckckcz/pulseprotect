"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/auth'

interface User {
  id: number
  email: string
  nama_lengkap: string
  nomor_telepon?: string
  verifikasi_email: boolean
  status: string
  dibuat_pada: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ error: boolean; message: string } | undefined>
  loginWithGoogle: () => Promise<void>
  logout: () => void
  updateUser: (data: { nama_lengkap?: string, nomor_telepon?: string }) => Promise<void>
  refreshSession: () => void
  refreshUser: () => Promise<void> // Add refreshUser method
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Initialize session on mount
  useEffect(() => {
    initializeSession()
  }, [])

  // Auto-refresh session every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (user && authService.isSessionValid()) {
        authService.extendSession()
        refreshSession()
      }
    }, 30 * 60 * 1000) // 30 minutes

    return () => clearInterval(interval)
  }, [user])

  const initializeSession = async () => {
    try {
      setLoading(true)
      const currentUser = await authService.getCurrentUser()
      if (currentUser && authService.isSessionValid()) {
        setUser(currentUser)
        console.log('Session restored:', currentUser.email)
      } else if (currentUser) {
        // Session expired, clear it
        authService.logout()
        setUser(null)
        console.log('Session expired, cleared')
      }
    } catch (error) {
      console.error('Error initializing session:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      // Add defensive programming
      if (!email || !password) {
        setLoading(false)
        return {
          error: true,
          message: "Email dan password wajib diisi"
        }
      }
      
      console.log('Starting login process for:', email);
      
      // Use try-catch explicitly to catch any errors from authService
      let userData;
      try {
        userData = await authService.login({ email, password });
      } catch (loginError: any) {
        console.error('Auth service login error:', loginError);
        setLoading(false);
        return {
          error: true,
          message: loginError.message || "Terjadi kesalahan saat login"
        };
      }
      
      // Verify userData before proceeding
      if (!userData || typeof userData !== 'object') {
        console.error('Invalid user data returned:', userData);
        setLoading(false);
        return {
          error: true,
          message: "Terjadi kesalahan saat memproses data pengguna"
        };
      }
      
      setUser(userData);
      console.log('Login successful, session saved:', userData.email);
      
      // Add a small delay before redirecting
      setTimeout(() => {
        router.push('/');
      }, 300);
      
      // Return success (no error returned means success)
    } catch (error: any) {
      // This should never execute since we catch errors earlier
      console.error('Unhandled auth context login error:', error);
      setLoading(false);
      return {
        error: true,
        message: error.message || "Terjadi kesalahan yang tidak terduga"
      };
    } finally {
      setLoading(false);
    }
  }

  const loginWithGoogle = async () => {
    setLoading(true)
    try {
      // This is a placeholder - implement actual Google OAuth
      const userData = await authService.loginWithGoogle({
        id: 999,
        email: 'user@gmail.com',
        nama_lengkap: 'Google User',
        verifikasi_email: true,
        status: 'success',
        dibuat_pada: new Date().toISOString()
      })
      setUser(userData)
      console.log('Google login successful, session saved')
      router.push('/')
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    console.log('User logged out, session cleared')
    router.push('/login')
  }

  const updateUser = async (data: { nama_lengkap?: string, nomor_telepon?: string }) => {
    if (!user) throw new Error('No user logged in')
    
    try {
      const updatedUser = await authService.updateUser(user.id, data)
      setUser(updatedUser)
    } catch (error) {
      throw error
    }
  }

  const refreshSession = () => {
    if (user && authService.isSessionValid()) {
      authService.extendSession()
      console.log('Session refreshed')
    }
  }

  // Add refreshUser implementation
  const refreshUser = async () => {
    try {
      if (!user || !user.id) return;
      
      // Get latest user data from database
      const currentUser = await authService.getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
        console.log('User data refreshed');
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    loginWithGoogle,
    logout,
    updateUser,
    refreshSession,
    refreshUser // Add refreshUser to the context value
  }

  return (
    <AuthContext.Provider value={value}>
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

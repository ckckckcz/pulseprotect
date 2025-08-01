"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtService } from '@/lib/jwt-service';
import { httpClient } from '@/lib/http-client';

interface User {
  id: number;
  email: string;
  nama_lengkap: string;
  nomor_telepon?: string;
  role?: string;
  account_membership?: string;
  foto_profile?: string;
  created_at?: string;
  verifikasi_email?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ error?: boolean; message?: string }>,
  loginWithGoogle: () => Promise<void>,
  logout: () => void,
  loading: boolean,
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      console.log("Initializing auth with JWT...");
      
      if (jwtService.isAuthenticated()) {
        const userFromToken = jwtService.getUserFromToken();
        if (userFromToken) {
          // Fetch full user data from API
          try {
            const userData = await httpClient.get(`/api/auth/user/${userFromToken.userId}`);
            if (userData.success && userData.user) {
              setUser(userData.user);
              console.log("User authenticated via JWT:", userData.user.email);
            } else {
              console.error("Failed to get user data:", userData);
              jwtService.clearTokens();
            }
          } catch (error) {
            console.error("Failed to fetch user data:", error);
            // Token might be invalid, clear it
            jwtService.clearTokens();
          }
        }
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log("Attempting JWT login for:", email);

      // Make login request without auth (skipAuth: true)
      const response = await httpClient.post('/api/auth/login', 
        { email, password },
        { skipAuth: true }
      );

      if (response.success && response.accessToken) {
        // Store JWT tokens
        jwtService.setTokens(response.accessToken, response.refreshToken);
        
        // Set user data
        setUser(response.user);
        
        console.log("JWT login successful for user:", response.user.email);
        
        // Handle redirect after successful login - but don't redirect if on /pricing
        setTimeout(() => {
          const currentPath = window.location.pathname;
          const urlParams = new URLSearchParams(window.location.search);
          const redirectUrl = urlParams.get('redirect');
          
          // If we're already on the pricing page or going to pricing, don't redirect
          if (currentPath === '/pricing' || redirectUrl === '/pricing') {
            console.log("User is on pricing page, staying here");
            // Just reload to refresh the auth state
            window.location.reload();
          } else if (redirectUrl && redirectUrl !== currentPath) {
            console.log("Redirecting to:", redirectUrl);
            router.push(redirectUrl);
          } else if (currentPath === '/login') {
            console.log("Redirecting to home page");
            router.push('/');
          }
          // If none of the above, stay on current page (like /pricing)
        }, 100);
        
        return { error: false };
      } else {
        return { 
          error: true, 
          message: response.message || "Login failed" 
        };
      }
    } catch (error: any) {
      console.error("Login error:", error);
      return { 
        error: true, 
        message: error.message || "Terjadi kesalahan saat login" 
      };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      // Implement Google OAuth with JWT
      // This would typically involve redirecting to Google OAuth
      // and handling the callback to get JWT tokens
      console.log("Google login with JWT not implemented yet");
      throw new Error("Google login not implemented yet");
    } catch (error: any) {
      console.error("Google login error:", error);
      throw new Error(error.message || "Terjadi kesalahan saat login dengan Google");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log("Logging out and clearing JWT tokens");
    jwtService.clearTokens();
    setUser(null);
    router.push('/login');
  };

  const refreshUser = async () => {
    try {
      if (jwtService.isAuthenticated()) {
        const userFromToken = jwtService.getUserFromToken();
        if (userFromToken) {
          const userData = await httpClient.get(`/api/auth/user/${userFromToken.userId}`);
          if (userData.success && userData.user) {
            setUser(userData.user);
          }
        }
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginWithGoogle,
      logout,
      loading,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
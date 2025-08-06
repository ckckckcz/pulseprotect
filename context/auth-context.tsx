"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { jwtService } from '@/lib/jwt-service';

// Auth types
interface User {
  id: number;
  email: string;
  nama_lengkap: string;
  role?: string;
  account_membership?: string;
  [key: string]: any; // For additional user properties
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  loginWithGoogle: (googleUserInfo: any) => Promise<any>;
  checkUserRole: (email: string) => Promise<string | null>;
  refreshUser: () => Promise<User | null>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Initialize auth state from token on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if JWT is valid
        if (jwtService.isAuthenticated()) {
          // Get user info from token
          const tokenData = jwtService.getUserFromToken();
          
          if (tokenData) {
            // Fetch full user data from API
            const authHeader = jwtService.getAuthHeader();
            const headers: HeadersInit = {};
            
            if (authHeader.Authorization) {
              headers.Authorization = authHeader.Authorization;
            }
            
            const response = await fetch('/api/user/me', {
              headers,
            });
            
            if (response.ok) {
              const userData = await response.json();
              console.log("✅ User data loaded from API");
              setUser(userData.user);
            } else {
              // API error - try to use minimal data from token
              console.warn("⚠️ Failed to get user data from API, using token data");
              setUser({
                id: tokenData.userId,
                email: tokenData.email,
                nama_lengkap: tokenData.email.split('@')[0],
                role: tokenData.role || 'user',
              });
            }
          } else {
            console.log("❌ No user data in token");
            jwtService.clearTokens();
          }
        } else {
          console.log("❌ No valid JWT found during initialization");
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        jwtService.clearTokens();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Login failed:", data.error || response.status);
        return { error: true, message: data.error || 'Login failed' };
      }

      if (data.accessToken) {
        // Store tokens
        jwtService.setTokens(data.accessToken, data.refreshToken);
        
        // Set user in state
        setUser(data.user);
        
        console.log("✅ Login successful, user:", data.user.email);
        return { success: true, user: data.user };
      } else {
        console.error("Login response missing tokens");
        return { error: true, message: 'Authentication failed' };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { 
        error: true, 
        message: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    jwtService.clearTokens();
    setUser(null);
    
    // Redirect to login if on protected page
    const publicPaths = ['/', '/login', '/register', '/auth'];
    const isProtectedPath = !publicPaths.some(path => 
      pathname?.startsWith(path) || pathname === path
    );
    
    if (isProtectedPath) {
      router.push('/login');
    }
  };

  // Login with Google
  const loginWithGoogle = async (googleUserInfo: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleUserInfo }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: true, message: data.error || 'Google login failed' };
      }

      if (data.accessToken) {
        // Store tokens
        jwtService.setTokens(data.accessToken, data.refreshToken);
        
        // Set user in state
        setUser(data.user);
        
        return { success: true, user: data.user };
      } else {
        return { error: true, message: 'Authentication failed' };
      }
    } catch (error) {
      console.error("Google login error:", error);
      return { 
        error: true, 
        message: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Check user role (for registration/login flow)
  const checkUserRole = async (email: string): Promise<string | null> => {
    try {
      const response = await fetch(`/api/user/check-role?email=${encodeURIComponent(email)}`);
      if (!response.ok) return null;
      
      const data = await response.json();
      return data.role || null;
    } catch (error) {
      console.error("Error checking user role:", error);
      return null;
    }
  };

  // Force refresh user data from API
  const refreshUser = async (): Promise<User | null> => {
    try {
      if (!jwtService.isAuthenticated()) {
        console.log("❌ Cannot refresh user - not authenticated");
        return null;
      }

      const authHeader = jwtService.getAuthHeader();
      const headers = new Headers();
      if (authHeader.Authorization) {
        headers.append('Authorization', authHeader.Authorization);
      }
      
      const response = await fetch('/api/user/me', {
        headers,
      });
      
      if (!response.ok) {
        console.error("Failed to refresh user data:", response.status);
        
        // If 401, the token is invalid - clear and redirect to login
        if (response.status === 401) {
          logout();
        }
        
        return null;
      }

      const data = await response.json();
      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error("Error refreshing user:", error);
      return null;
    }
  };

  // Auth context value
  const contextValue = {
    user,
    loading,
    login,
    logout,
    loginWithGoogle,
    checkUserRole,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Auth hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
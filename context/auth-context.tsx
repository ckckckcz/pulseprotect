"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from 'bcryptjs';
import { getHomePathForRole } from "@/lib/role-utils";

interface UserData {
  id: number;
  email: string;
  nama_lengkap: string;
  role: string | null;
  foto_profile?: string | null;  // Add this property
  profile?: any;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  checkUserRole: (email: string) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        // Try to get from cookie first
        const sessionCookie = Cookies.get('user-session');
        
        if (sessionCookie) {
          try {
            const sessionData = JSON.parse(sessionCookie);
            const expiry = new Date(sessionData.expires).getTime();
            
            if (expiry > Date.now()) {
              // Get more user data from localStorage if available
              const storedUserJson = localStorage.getItem('user');
              if (storedUserJson) {
                setUser(JSON.parse(storedUserJson));
              } else {
                // Set basic user data from cookie
                setUser({
                  id: sessionData.userId,
                  email: sessionData.email,
                  nama_lengkap: sessionData.nama_lengkap,
                  role: sessionData.role,
                });
              }
            } else {
              // Session expired
              handleLogout();
            }
          } catch (e) {
            console.error("Error parsing session cookie:", e);
          }
        }
        
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, [router]);

  // Check user role based on email
  const checkUserRole = async (email: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('user')
        .select('role')
        .eq('email', email.toLowerCase().trim())
        .single();
      
      if (error || !data) {
        console.error("Error checking user role:", error);
        return null;
      }
      
      console.log(`User ${email} has role: ${data.role}`);
      return data.role;
    } catch (error) {
      console.error("Error in checkUserRole:", error);
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      console.log("Login attempt for:", email);
      
      const { data, error } = await supabase
        .from('user')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();
      
      if (error || !data) {
        console.error("User query error:", error);
        setLoading(false);
        return { error: true, message: "Email atau password salah" };
      }
      
      // Check if verified
      if (data.verifikasi_email === false) {
        setLoading(false);
        return { 
          error: true, 
          message: "Email belum diverifikasi. Silakan cek email Anda untuk link verifikasi."
        };
      }
      
      // Check password
      let isValidPassword = false;
      try {
        if (!data.kata_sandi) {
          throw new Error("User has no password hash stored");
        }
        isValidPassword = await bcrypt.compare(password, data.kata_sandi);
      } catch (bcryptError) {
        console.error("Password comparison error:", bcryptError);
        setLoading(false);
        return { error: true, message: "Error validasi kredensial" };
      }
      
      if (!isValidPassword) {
        setLoading(false);
        return { error: true, message: "Email atau password salah" };
      }
      
      // Get additional profile data based on role
      if (data.role === 'dokter' || data.role === 'admin') {
        try {
          const table = data.role === 'dokter' ? 'dokter' : 'admin';
          const { data: profileData } = await supabase
            .from(table)
            .select('*')
            .eq('email', email)
            .single();
            
          if (profileData) {
            data.profile = profileData;
          }
        } catch (profileError) {
          console.error(`Error fetching ${data.role} profile:`, profileError);
        }
      }
      
      // Remove sensitive data
      const { kata_sandi, konfirmasi_kata_sandi, verification_token, ...safeUser } = data;
      
      // Save user data
      saveUserSession(safeUser);
      
      // Update state
      setUser(safeUser);
      setLoading(false);
      
      return { user: safeUser };
      
    } catch (error: any) {
      console.error("Login error:", error);
      setLoading(false);
      return { error: true, message: error.message || "Terjadi kesalahan saat login" };
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      console.error("Google login error:", error);
      setLoading(false);
      throw error;
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      // Clear cookies
      Cookies.remove('user-session', { path: '/' });
      
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('userSession');
      localStorage.removeItem('sessionExpiry');
      
      // Clear state
      setUser(null);
      
      // Redirect to login page
      router.push('/login');
    }
  };

  const saveUserSession = (userData: any) => {
    if (typeof window === 'undefined') return;
    
    try {
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Save to cookies
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7); // 7 days
      
      Cookies.set('user-session', JSON.stringify({
        userId: userData.id,
        email: userData.email || '',
        nama_lengkap: userData.nama_lengkap || '',
        role: userData.role || 'user',
        expires: expiryDate.toISOString()
      }), { 
        expires: 7,
        path: '/',
        sameSite: 'lax'
      });
    } catch (error) {
      console.error("Error saving user session:", error);
    }
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    login,
    loginWithGoogle,
    logout: handleLogout,
    checkUserRole,
  };

  return (
    <AuthContext.Provider value={contextValue}>
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
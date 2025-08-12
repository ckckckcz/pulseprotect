"use client";

import Cookies from 'js-cookie';
import { supabase } from './supabase';
import { useState, useEffect } from 'react';
import bcrypt from 'bcryptjs';

// Session duration in seconds (2 hours)
const SESSION_DURATION = 2 * 60 * 60; 

export interface UserSession {
  id: number;
  email: string;
  nama_lengkap: string;
  role: string | null;
  sessionExpires: number;
  lastActivity: number;
  foto_profile?: string | null;
  profile?: any; // For storing doctor or admin specific data
}

// Function to login with credentials
export async function loginWithCredentials(email: string, password: string) {
  try {
    console.log("Attempting login with:", email);
    
    const { data: user, error } = await supabase
      .from('user')
      .select('*') // Select all fields to get the hashed password
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();
    
    if (error) {
      console.error('Supabase error:', error);
      return { success: false, message: 'Email atau kata sandi salah' };
    }
    
    if (!user) {
      console.error('User not found');
      return { success: false, message: 'Email atau kata sandi salah' };
    }

    // Check email verification status
    if (user.verifikasi_email === false) {
      return { 
        success: false, 
        message: 'Email belum diverifikasi. Silakan cek email Anda untuk link verifikasi.' 
      };
    }

    // Use bcrypt to compare the provided password with the stored hash
    let isValidPassword = false;
    try {
      if (!user.kata_sandi) {
        throw new Error("User has no password hash stored");
      }
      isValidPassword = await bcrypt.compare(password, user.kata_sandi);
    } catch (error) {
      console.error("Password comparison error:", error);
      return { success: false, message: 'Error validasi kredensial' };
    }

    if (!isValidPassword) {
      return { success: false, message: 'Email atau kata sandi salah' };
    }

    if (user.status && user.status !== 'active' && user.status !== 'success') {
      return { success: false, message: 'Akun tidak aktif' };
    }

    // Get additional profile data if user is doctor or admin
    let profileData = null;
    if (user.role === 'dokter' || user.role === 'admin') {
      const table = user.role === 'dokter' ? 'dokter' : 'admin';
      const { data: profile } = await supabase
        .from(table)
        .select('*')
        .eq('email', email)
        .single();
        
      if (profile) {
        profileData = profile;
      }
    }

    const now = Date.now();
    const sessionExpiry = now + (SESSION_DURATION * 1000);
    
    const sessionData = {
      id: user.id,
      email: user.email || '',
      nama_lengkap: user.nama_lengkap,
      role: user.role,
      sessionExpires: sessionExpiry,
      lastActivity: now,
      foto_profile: user.foto_profile,
      profile: profileData
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('userSession', JSON.stringify(sessionData));
      
      // Set cookie using js-cookie for better cross-browser compatibility
      Cookies.set('user-session', JSON.stringify({
        userId: user.id,
        email: user.email,
        nama_lengkap: user.nama_lengkap,
        role: user.role,
        foto_profile: user.foto_profile,
        expires: new Date(sessionExpiry).toISOString()
      }), { 
        expires: SESSION_DURATION / (60 * 60 * 24), // Convert seconds to days
        path: '/',
        sameSite: 'lax'
      });
    }

    return { success: true, user: sessionData };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Terjadi kesalahan saat login' };
  }
}

// Function to logout
export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userSession');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    Cookies.remove('user-session', { path: '/' });
    Cookies.remove('jwt_access_token', { path: '/' });
    Cookies.remove('jwt_refresh_token', { path: '/' });
  }
}

// Function to check if JWT tokens exist
export function hasJwtTokens() {
  const accessToken = localStorage.getItem('accessToken') || Cookies.get('jwt_access_token');
  return !!accessToken;
}

// Function to check if session is active and valid with JWT token support
export function checkSession(): UserSession | null {
  try {
    console.log("Checking session from auth-utils.ts");
    let sessionData: UserSession | null = null;
    
    // First check if we have JWT tokens
    const accessToken = localStorage.getItem('accessToken') || Cookies.get('jwt_access_token');
    
    if (accessToken) {
      console.log("Found JWT token, proceeding with session validation");
    }
    
    // Try to get session from cookie
    const sessionCookie = Cookies.get('user-session');
    if (sessionCookie) {
      try {
        const cookieData = JSON.parse(sessionCookie);
        const expires = new Date(cookieData.expires).getTime();
        
        if (expires > Date.now() || accessToken) { // Consider token valid if we have JWT token
          // Convert cookie format to UserSession format
          sessionData = {
            id: cookieData.userId,
            email: cookieData.email,
            nama_lengkap: cookieData.nama_lengkap,
            role: cookieData.role,
            foto_profile: cookieData.foto_profile,
            sessionExpires: expires,
            lastActivity: Date.now()
          };
          console.log("Valid session found in cookie:", sessionData.email);
        }
      } catch (e) {
        console.error('Error parsing session cookie:', e);
      }
    }
    
    // If no valid cookie, try localStorage
    if (!sessionData && typeof window !== 'undefined') {
      const sessionStr = localStorage.getItem('userSession');
      if (sessionStr) {
        try {
          const parsedSession = JSON.parse(sessionStr);
          
          // Consider the session valid if we have an accessToken, even if expired
          if (parsedSession.sessionExpires > Date.now() || accessToken) {
            sessionData = parsedSession;
            console.log("Valid session found in localStorage:", sessionData?.email);
          }
        } catch (e) {
          console.error('Error parsing localStorage session:', e);
        }
      }
    }
    
    if (!sessionData && accessToken) {
      try {
        const base64Url = accessToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const tokenData = JSON.parse(jsonPayload);
        
        if (tokenData && tokenData.userId) {
          console.log("Creating session from JWT payload:", tokenData);
          
          // Create minimal session data from token
          const now = Date.now();
          sessionData = {
            id: tokenData.userId,
            email: tokenData.email || 'unknown@example.com',
            nama_lengkap: tokenData.nama_lengkap || 'User',
            role: tokenData.role || 'user',
            sessionExpires: now + (SESSION_DURATION * 1000),
            lastActivity: now
          };
          
          // Save this minimal session data
          if (typeof window !== 'undefined') {
            localStorage.setItem('userSession', JSON.stringify(sessionData));
          }
        }
      } catch (e) {
        console.error('Error decoding JWT token:', e);
      }
    }
    
    if (!sessionData) {
      console.log("No valid session found");
      return null;
    }
    
    const now = Date.now();
    
    // If session expired and we don't have JWT, logout
    if (sessionData.sessionExpires < now && !accessToken) {
      console.log("Session expired and no JWT token");
      logout();
      return null;
    }
    
    // Update session expiry
    sessionData.lastActivity = now;
    
    if (accessToken) {
      sessionData.sessionExpires = now + (SESSION_DURATION * 1000);
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('userSession', JSON.stringify(sessionData));
      
      // Update cookie as well
      Cookies.set('user-session', JSON.stringify({
        userId: sessionData.id,
        email: sessionData.email,
        nama_lengkap: sessionData.nama_lengkap,
        role: sessionData.role,
        foto_profile: sessionData.foto_profile,
        expires: new Date(sessionData.sessionExpires).toISOString()
      }), { 
        expires: SESSION_DURATION / (60 * 60 * 24), // Convert seconds to days
        path: '/',
        sameSite: 'lax'
      });
    }
    
    console.log("Returning valid session for:", sessionData.email);
    return sessionData;
  } catch (error) {
    console.error('Session check error:', error);
    return null;
  }
}

// Function to get current user with JWT validation support
export function getCurrentUser(): UserSession | null {
  console.log("getCurrentUser called");
  
  // Check if we have JWT tokens - prioritize these over session
  const accessToken = localStorage.getItem('accessToken') || Cookies.get('jwt_access_token');
  
  if (accessToken) {
    console.log("JWT token found in getCurrentUser");
  }
  
  // Use the standard session check which is now JWT-aware
  return checkSession();
}

// Function to refresh user data from database if needed
export async function refreshUserSession(): Promise<UserSession | null> {
  try {
    console.log("Refreshing user session...");
    
    // Get current session to get user ID
    const currentSession = checkSession();
    
    if (!currentSession) {
      console.log("No current session to refresh");
      
      // Check if we have a JWT token but no session
      const accessToken = localStorage.getItem('accessToken') || Cookies.get('jwt_access_token');
      
      if (accessToken) {
        try {
          // Try to decode JWT to get userId
          const base64Url = accessToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));

          const tokenData = JSON.parse(jsonPayload);
          
          if (tokenData && tokenData.userId) {
            console.log("Found userId in JWT:", tokenData.userId);
            
            // Fetch user data from Supabase
            const { data: user, error } = await supabase
              .from('user')
              .select('*')
              .eq('id', tokenData.userId)
              .maybeSingle();
              
            if (user && !error) {
              console.log("Successfully fetched user data from token userId");
              
              // Create new session
              const now = Date.now();
              const sessionExpiry = now + (SESSION_DURATION * 1000);
              
              const sessionData: UserSession = {
                id: user.id,
                email: user.email || '',
                nama_lengkap: user.nama_lengkap || 'User',
                role: user.role || 'user',
                sessionExpires: sessionExpiry,
                lastActivity: now,
                foto_profile: user.foto_profile
              };
              
              // Save session
              if (typeof window !== 'undefined') {
                localStorage.setItem('userSession', JSON.stringify(sessionData));
                
                Cookies.set('user-session', JSON.stringify({
                  userId: user.id,
                  email: user.email,
                  nama_lengkap: user.nama_lengkap,
                  role: user.role,
                  foto_profile: user.foto_profile,
                  expires: new Date(sessionExpiry).toISOString()
                }), { 
                  expires: SESSION_DURATION / (60 * 60 * 24),
                  path: '/',
                  sameSite: 'lax'
                });
              }
              
              return sessionData;
            }
          }
        } catch (e) {
          console.error('Error creating session from JWT:', e);
        }
      }
      
      return null;
    }
    
    // Get fresh user data from database
    const { data: user, error } = await supabase
      .from('user')
      .select('*')
      .eq('id', currentSession.id)
      .maybeSingle();
      
    if (error || !user) {
      console.error('Error refreshing user session:', error);
      return currentSession; // Return existing session as fallback
    }
    
    // Update session with fresh data
    const refreshedSession: UserSession = {
      ...currentSession,
      email: user.email || currentSession.email,
      nama_lengkap: user.nama_lengkap || currentSession.nama_lengkap,
      role: user.role || currentSession.role,
      foto_profile: user.foto_profile
    };
    
    // Save updated session
    if (typeof window !== 'undefined') {
      localStorage.setItem('userSession', JSON.stringify(refreshedSession));
      
      Cookies.set('user-session', JSON.stringify({
        userId: refreshedSession.id,
        email: refreshedSession.email,
        nama_lengkap: refreshedSession.nama_lengkap,
        role: refreshedSession.role,
        foto_profile: refreshedSession.foto_profile,
        expires: new Date(refreshedSession.sessionExpires).toISOString()
      }), { 
        expires: SESSION_DURATION / (60 * 60 * 24),
        path: '/',
        sameSite: 'lax'
      });
    }
    
    console.log("Session refreshed successfully for:", refreshedSession.email);
    return refreshedSession;
  } catch (error) {
    console.error('Error in refreshUserSession:', error);
    return null;
  }
}

// Hook for accessing session info in React components
export function useAuth() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = () => {
      const sessionUser = getCurrentUser();
      setUser(sessionUser);
      setLoading(false);
    };
    
    checkAuth();
    
    const interval = setInterval(checkAuth, 60000); // Check every minute
    
    // Also listen for storage events to update across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userSession' || e.key === 'accessToken') {
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  return { 
    user, 
    loading, 
    logout,
    refreshUser: async () => {
      const refreshedUser = await refreshUserSession();
      setUser(refreshedUser);
      return refreshedUser;
    }
  };
}
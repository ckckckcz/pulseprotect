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
  foto_profile?: string | null; // Add this property
  profile?: any; // For storing doctor or admin specific data
}

// Function to login with email and password
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
      console.log("Invalid password for:", email);
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
    const sessionId = `session_${user.id}_${now}`;
    const sessionExpiry = now + (SESSION_DURATION * 1000);
    
    const sessionData = {
      id: user.id,
      email: user.email || '',
      nama_lengkap: user.nama_lengkap,
      role: user.role,
      sessionExpires: sessionExpiry,
      lastActivity: now,
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
    Cookies.remove('user-session', { path: '/' });
  }
}

// Function to check if session is active and valid
export function checkSession(): UserSession | null {
  try {
    let sessionData: UserSession | null = null;
    
    // First try to get from cookie
    const sessionCookie = Cookies.get('user-session');
    if (sessionCookie) {
      try {
        const cookieData = JSON.parse(sessionCookie);
        const expires = new Date(cookieData.expires).getTime();
        
        if (expires > Date.now()) {
          // Convert cookie format to UserSession format
          sessionData = {
            id: cookieData.userId,
            email: cookieData.email,
            nama_lengkap: cookieData.nama_lengkap,
            role: cookieData.role,
            sessionExpires: expires,
            lastActivity: Date.now()
          };
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
          sessionData = JSON.parse(sessionStr);
        } catch (e) {
          console.error('Error parsing localStorage session:', e);
        }
      }
    }
    
    if (!sessionData) return null;
    
    const now = Date.now();
    
    if (sessionData.sessionExpires < now) {
      logout();
      return null;
    }
    
    // Update session expiry
    sessionData.lastActivity = now;
    sessionData.sessionExpires = now + (SESSION_DURATION * 1000);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('userSession', JSON.stringify(sessionData));
      
      // Update cookie as well
      Cookies.set('user-session', JSON.stringify({
        userId: sessionData.id,
        email: sessionData.email,
        nama_lengkap: sessionData.nama_lengkap,
        role: sessionData.role,
        expires: new Date(sessionData.sessionExpires).toISOString()
      }), { 
        expires: SESSION_DURATION / (60 * 60 * 24), // Convert seconds to days
        path: '/',
        sameSite: 'lax'
      });
    }
    
    return sessionData;
  } catch (error) {
    console.error('Session check error:', error);
    return null;
  }
}

// Function to get current user
export function getCurrentUser(): UserSession | null {
  return checkSession();
}

// Hook for accessing session info in React components
export function useAuth() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = () => {
      const sessionUser = checkSession();
      setUser(sessionUser);
      setLoading(false);
    };
    
    checkAuth();
    
    const interval = setInterval(checkAuth, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);
  
  return { user, loading, logout };
}


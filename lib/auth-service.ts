"use client";

import { setCookie, destroyCookie, parseCookies } from 'nookies';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { supabase } from './supabase';
import { useState, useEffect } from 'react';

// Session duration in seconds (2 hours)
const SESSION_DURATION = 2 * 60 * 60; 

export interface UserSession {
  id: number;
  email: string;
  nama_lengkap: string;
  role: string | null;
  sessionExpires: number;
  lastActivity: number;
}

// Function to login with email and password
export async function loginWithCredentials(email: string, password: string) {
  try {
    console.log("Attempting login with:", email);
    
    const { data: user, error } = await supabase
      .from('"user"')
      .select('id, email, nama_lengkap, role, kata_sandi, status')
      .eq('email', email)
      .single();
    
    if (error || !user) {
      console.error('Login error:', error || 'User not found');
      return { success: false, message: 'Email atau kata sandi salah' };
    }

    if (user.kata_sandi !== password) {
      return { success: false, message: 'Email atau kata sandi salah' };
    }

    if (user.status && user.status !== 'active') {
      return { success: false, message: 'Akun tidak aktif' };
    }

    const now = Date.now();
    const sessionId = `session_${user.id}_${now}`;
    const sessionData: UserSession = {
      id: user.id,
      email: user.email || '',
      nama_lengkap: user.nama_lengkap,
      role: user.role,
      sessionExpires: now + (SESSION_DURATION * 1000),
      lastActivity: now
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('userSession', JSON.stringify(sessionData));
    }
    
    setCookie(null, 'sessionId', sessionId, {
      maxAge: SESSION_DURATION,
      path: '/',
      sameSite: 'lax',
    });
    
    setCookie(null, 'userSessionData', JSON.stringify(sessionData), {
      maxAge: SESSION_DURATION,
      path: '/',
      sameSite: 'lax',
    });

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
  }
  
  destroyCookie(null, 'sessionId', { path: '/' });
  destroyCookie(null, 'userSessionData', { path: '/' });
  
  const supabaseClient = createClientComponentClient();
  supabaseClient.auth.signOut();
}

// Function to check if session is active and valid
export function checkSession(): UserSession | null {
  try {
    let sessionData: UserSession | null = null;
    
    const cookies = parseCookies();
    const sessionCookie = cookies.userSessionData;
    
    if (sessionCookie) {
      try {
        sessionData = JSON.parse(sessionCookie);
      } catch (e) {
        console.error('Error parsing session cookie:', e);
      }
    }
    
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
    
    sessionData.lastActivity = now;
    sessionData.sessionExpires = now + (SESSION_DURATION * 1000);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('userSession', JSON.stringify(sessionData));
    }
    
    setCookie(null, 'userSessionData', JSON.stringify(sessionData), {
      maxAge: SESSION_DURATION,
      path: '/',
      sameSite: 'lax',
    });
    
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

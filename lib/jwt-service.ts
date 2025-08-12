"use client";

import { jwtDecode, JwtPayload } from 'jwt-decode';
import Cookies from 'js-cookie';

// Define a custom interface that extends the base JwtPayload
interface CustomJWTPayload extends JwtPayload {
  userId?: number;
  email?: string;
  role?: string;
  // exp and iat are already in JwtPayload but may be undefined
}

// Enhanced JWT service with dual storage (localStorage + cookies)
export const jwtService = {
  // Storage keys
  TOKEN_KEY: 'accessToken',
  REFRESH_TOKEN_KEY: 'refreshToken',
  
  // Store tokens in both localStorage and cookies for better persistence
  setTokens: (accessToken: string, refreshToken?: string) => {
    // console.log("🔐 Setting JWT tokens");
    
    try {
      // Store in localStorage for fast access
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
      }
      
      // Also store in cookies as a backup and for SSR
      const decoded = jwtService.decodeToken(accessToken);
      // Use optional chaining and provide default value if exp is undefined
      const expiryDate = decoded?.exp 
        ? new Date(decoded.exp * 1000) 
        : new Date(Date.now() + 3600000);
      
      // Calculate max age in days (for cookies) - max 30 days
      const maxAgeDays = Math.min(
        (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        30
      );
      
      Cookies.set('jwt_access_token', accessToken, { 
        expires: maxAgeDays, 
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      if (refreshToken) {
        Cookies.set('jwt_refresh_token', refreshToken, { 
          expires: 30, // Refresh tokens typically last longer
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
      }
      
      // console.log("✅ JWT tokens set successfully");
      return true;
    } catch (error) {
      // console.error("❌ Error setting JWT tokens:", error);
      return false;
    }
  },
  
  // Get token with fallback strategy
  getToken: () => {
    // console.log("🔍 JWT.getToken called");
    let token = null;
    
    // Try localStorage first
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('accessToken');
    }
    
    // If not in localStorage, try cookies
    if (!token) {
      token = Cookies.get('jwt_access_token') || null;
      
      // If found in cookies but not in localStorage, restore to localStorage
      if (token && typeof window !== 'undefined') {
        localStorage.setItem('accessToken', token);
      }
    }
    
    // console.log("Token retrieved:", token ? `Yes (length: ${token.length})` : "No");
    return token;
  },
  
  // Also get refresh token with fallback strategy
  getRefreshToken: () => {
    let token = null;
    
    // Try localStorage first
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('refreshToken');
    }
    
    // If not in localStorage, try cookies
    if (!token) {
      token = Cookies.get('jwt_refresh_token') || null;
      
      // If found in cookies but not in localStorage, restore to localStorage
      if (token && typeof window !== 'undefined') {
        localStorage.setItem('refreshToken', token);
      }
    }
    
    return token;
  },
  
  decodeToken: (token: string): CustomJWTPayload | null => {
    try {
      return jwtDecode<CustomJWTPayload>(token);
    } catch (error) {
      // console.error('❌ Error decoding token:', error);
      return null;
    }
  },
  
  isAuthenticated: () => {
    // console.log("🔐 JWT.isAuthenticated called");
    const token = jwtService.getToken();
    // console.log("Token exists:", !!token);
    
    if (!token) return false;
    
    try {
      const decoded = jwtDecode<CustomJWTPayload>(token);
      const currentTime = Date.now() / 1000;
      
      // Add null check for exp property
      if (!decoded.exp) {
        // console.error("Token missing expiration");
        return false;
      }
      
      const isValid = decoded.exp > currentTime;
      
      // console.log("Token validation:", {
      //   isValid,
      //   currentTime: Math.floor(currentTime),
      //   expiresAt: decoded.exp,
      //   timeRemaining: Math.floor(decoded.exp - currentTime),
      //   userEmail: decoded.email,
      //   userId: decoded.userId,
      // });
      
      return isValid;
    } catch (error) {
      // console.error("🚨 Error checking authentication:", error);
      return false;
    }
  },
  
  // Clear tokens from both localStorage and cookies
  clearTokens: () => {
    // console.log("🧹 Clearing JWT tokens");
    
    // Clear from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
    
    // Clear from cookies
    Cookies.remove('jwt_access_token', { path: '/' });
    Cookies.remove('jwt_refresh_token', { path: '/' });
    
    // console.log("✅ JWT tokens cleared successfully");
  },
  
  // Get user info from token
  getUserFromToken: () => {
    const token = jwtService.getToken();
    if (!token) return null;
    
    try {
      return jwtService.decodeToken(token);
    } catch (error) {
      // console.error('Error getting user from token:', error);
      return null;
    }
  },
  
  // Verify token method for API routes
  verifyToken: (token: string): CustomJWTPayload => {
    try {
      const decoded = jwtDecode<CustomJWTPayload>(token);
      const currentTime = Date.now() / 1000;
      
      if (!decoded.exp || decoded.exp <= currentTime) {
        throw new Error('Token expired');
      }
      
      return decoded;
    } catch (error) {
      // console.error('Token verification failed:', error);
      throw error;
    }
  },
  
  // Get authorization header for API requests
  getAuthHeader: () => {
    const token = jwtService.getToken();
    if (!token) return {};
    
    return {
      'Authorization': `Bearer ${token}`
    };
  },
  
  // Refresh access token 
  refreshAccessToken: async (): Promise<string | null> => {
    try {
      // console.log("🔄 Attempting to refresh access token");
      const refreshToken = jwtService.getRefreshToken();
      
      if (!refreshToken) {
        // console.log("❌ No refresh token available");
        return null;
      }
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (!response.ok) {
        // console.error("❌ Token refresh failed:", response.status);
        jwtService.clearTokens();
        return null;
      }
      
      const data = await response.json();
      
      if (data.accessToken) {
        jwtService.setTokens(data.accessToken, data.refreshToken || refreshToken);
        // console.log("✅ Access token refreshed successfully");
        return data.accessToken;
      }
      
      return null;
    } catch (error) {
      // console.error("❌ Error refreshing token:", error);
      jwtService.clearTokens();
      return null;
    }
  }
};


"use client";

import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

interface TokenStorage {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export class JWTService {
  private static instance: JWTService;
  private readonly ACCESS_TOKEN_KEY = 'smartcity_access_token';
  private readonly REFRESH_TOKEN_KEY = 'smartcity_refresh_token';
  private readonly TOKEN_EXPIRES_KEY = 'smartcity_token_expires';

  static getInstance(): JWTService {
    if (!JWTService.instance) {
      JWTService.instance = new JWTService();
    }
    return JWTService.instance;
  }

  // Store JWT tokens securely
  setTokens(accessToken: string, refreshToken?: string): void {
    try {
      if (typeof window === 'undefined') return;

      const decoded = this.decodeToken(accessToken);
      if (!decoded) {
        throw new Error('Invalid token format');
      }

      const expiresAt = decoded.exp * 1000; // Convert to milliseconds

      localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(this.TOKEN_EXPIRES_KEY, expiresAt.toString());
      
      if (refreshToken) {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
      }

      console.log('JWT tokens stored successfully', {
        userId: decoded.userId,
        email: decoded.email,
        expiresAt: new Date(expiresAt).toISOString()
      });
    } catch (error) {
      console.error('Error storing JWT tokens:', error);
      this.clearTokens();
    }
  }

  // Get access token
  getAccessToken(): string | null {
    try {
      if (typeof window === 'undefined') return null;

      const token = localStorage.getItem(this.ACCESS_TOKEN_KEY);
      if (!token) return null;

      // Check if token is expired
      if (this.isTokenExpired(token)) {
        console.log('Access token expired, clearing tokens');
        this.clearTokens();
        return null;
      }

      return token;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  // Get refresh token
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // Decode JWT token
  decodeToken(token: string): JWTPayload | null {
    try {
      return jwtDecode<JWTPayload>(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Check if token is expired
  isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded) return true;

      const currentTime = Date.now() / 1000;
      const bufferTime = 60; // 1 minute buffer

      return decoded.exp <= (currentTime + bufferTime);
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  // Get user info from token
  getUserFromToken(): JWTPayload | null {
    const token = this.getAccessToken();
    if (!token) return null;
    return this.decodeToken(token);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return token !== null && !this.isTokenExpired(token);
  }

  // Clear all tokens
  clearTokens(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRES_KEY);
    
    console.log('JWT tokens cleared');
  }

  // Refresh access token
  async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        console.log('No refresh token available');
        return null;
      }

      console.log('Attempting to refresh access token...');

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        console.error('Token refresh failed:', response.status);
        this.clearTokens();
        return null;
      }

      const data = await response.json();
      
      if (data.accessToken) {
        this.setTokens(data.accessToken, data.refreshToken || refreshToken);
        console.log('Access token refreshed successfully');
        return data.accessToken;
      }

      return null;
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.clearTokens();
      return null;
    }
  }

  // Get authorization header
  getAuthHeader(): Record<string, string> {
    const token = this.getAccessToken();
    if (!token) return {};
    
    return {
      'Authorization': `Bearer ${token}`
    };
  }
}

export const jwtService = JWTService.getInstance();

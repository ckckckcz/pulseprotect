"use client";

import { jwtService } from './jwt-service';

interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
  retry?: boolean;
}

class HttpClient {
  private static instance: HttpClient;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '';
  }

  static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient();
    }
    return HttpClient.instance;
  }

  // Make authenticated request
  async request<T = any>(
    endpoint: string, 
    config: RequestConfig = {}
  ): Promise<T> {
    const { skipAuth = false, retry = true, ...requestConfig } = config;
    
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((requestConfig.headers as Record<string, string>) || {}),
    };

    // Add auth header if not skipped and user is authenticated
    if (!skipAuth && jwtService.isAuthenticated()) {
      const authHeaders = jwtService.getAuthHeader();
      Object.assign(headers, authHeaders);
    }

    const requestOptions: RequestInit = {
      ...requestConfig,
      headers,
    };

    try {
      console.log(`Making ${requestConfig.method || 'GET'} request to:`, url);
      
      const response = await fetch(url, requestOptions);
      
      // Handle 401 Unauthorized - token might be expired
      if (response.status === 401 && !skipAuth && retry) {
        console.log('Received 401, attempting token refresh...');
        
        const newToken = await jwtService.refreshAccessToken();
        if (newToken) {
          // Retry request with new token
          const retryHeaders = {
            ...headers,
            ...jwtService.getAuthHeader(),
          };
          
          const retryResponse = await fetch(url, {
            ...requestOptions,
            headers: retryHeaders,
          });
          
          if (retryResponse.ok) {
            return this.handleResponse<T>(retryResponse);
          }
        }
        
        // If refresh failed or retry still returns 401, redirect to login
        this.handleAuthError();
        throw new Error('Authentication failed');
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('HTTP request failed:', error);
      throw error;
    }
  }

  // Handle response
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      let errorMessage = `HTTP Error: ${response.status}`;
      
      try {
        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          const errorText = await response.text();
          // Check if it's an HTML error page (like 404)
          if (errorText.includes('<!DOCTYPE html>')) {
            errorMessage = `Server returned HTML error page (${response.status})`;
          } else {
            errorMessage = errorText || errorMessage;
          }
        }
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
        errorMessage = `HTTP ${response.status} - Failed to parse error response`;
      }
      
      throw new Error(errorMessage);
    }

    // Handle empty responses
    if (response.status === 204 || contentType === null) {
      return {} as T;
    }

    try {
      if (contentType?.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text() as unknown as T;
      }
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      throw new Error('Failed to parse response');
    }
  }

  // Handle authentication errors
  private handleAuthError(): void {
    console.log('Authentication error detected, clearing tokens and redirecting...');
    jwtService.clearTokens();
    
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const publicPaths = ['/login', '/register', '/'];
      
      if (!publicPaths.includes(currentPath)) {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }
  }

  // Convenience methods
  async get<T = any>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  async patch<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

export const httpClient = HttpClient.getInstance();

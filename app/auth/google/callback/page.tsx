"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import { jwtService } from '@/lib/jwt-service';

export default function GoogleAuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Get parameters from URL hash or search params
        const params = new URLSearchParams(
          window.location.hash 
            ? window.location.hash.substring(1) 
            : window.location.search
        );
        
        const accessToken = params.get('access_token');
        const error = params.get('error');
        const state = params.get('state');
        
        // Check state to prevent CSRF attacks
        const savedState = localStorage.getItem('google_auth_state');
        localStorage.removeItem('google_auth_state');
        
        if (error) {
          setStatus('error');
          setErrorMessage(`Authentication error: ${error}`);
          return;
        }
        
        if (!accessToken) {
          setStatus('error');
          setErrorMessage('No access token received');
          return;
        }
        
        if (state && savedState && state !== savedState) {
          setStatus('error');
          setErrorMessage('Invalid authentication state');
          return;
        }
        
        // Get user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        
        if (!userInfoResponse.ok) {
          setStatus('error');
          setErrorMessage('Failed to get user info from Google');
          return;
        }
        
        const userInfo = await userInfoResponse.json();
        
        // Login with Google
        const result = await authService.loginWithGoogle(userInfo);
        
        if (result.success) {
          // Important: Make sure to store JWT tokens
          if (result.accessToken && result.refreshToken) {
            jwtService.setTokens(result.accessToken, result.refreshToken);
            console.log("✅ JWT tokens set in callback");
          } else {
            console.warn("⚠️ No JWT tokens received in Google callback");
          }
          
          setStatus('success');
          // Redirect to home or intended page
          setTimeout(() => {
            const returnTo = sessionStorage.getItem('returnTo') || '/';
            sessionStorage.removeItem('returnTo');
            router.push(returnTo);
          }, 1000);
        } else {
          setStatus('error');
          setErrorMessage('Authentication failed');
        }
      } catch (error: any) {
        console.error('Google auth callback error:', error);
        setStatus('error');
        setErrorMessage(error.message || 'An unexpected error occurred');
      }
    };
    
    processAuth();
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Completing your Google sign-in...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Sign In Successful!</h2>
            <p className="text-gray-600 mb-4">You'll be redirected to the dashboard momentarily.</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Sign In Failed</h2>
            <p className="text-red-600 mb-4">{errorMessage}</p>
            <button 
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import { GoogleAuth } from 'google-auth-library';

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email: boolean;
}

// Google OAuth configuration
export const GOOGLE_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
  redirectUri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'https://pulseprotect.vercel.app'}/auth/google/callback`,
  scope: 'openid email profile'
};

// Validate Google configuration
function validateGoogleConfig(): boolean {
  if (!GOOGLE_CONFIG.clientId || GOOGLE_CONFIG.clientId === 'undefined' || GOOGLE_CONFIG.clientId === '') {
    // console.error('Google Client ID is not configured');
    return false;
  }
  
  // Check if client ID looks valid (should be a long string ending with .apps.googleusercontent.com)
  if (!GOOGLE_CONFIG.clientId.includes('.apps.googleusercontent.com')) {
    // console.error('Google Client ID format is invalid');
    return false;
  }
  
  return true;
}

let isGoogleSDKLoaded = false;
let isInitialized = false;
let oneTapDisabled = false;
let credentialRequestPending = false;
let initializationPromise: Promise<void> | null = null;

// Track active requests to prevent overlaps
let activeRequest: Promise<any> | null = null;

// Initialize Google login with One Tap support
export const initializeGoogleLogin = (): Promise<void> => {
  // Return existing promise if already initializing
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Google login only available in browser'));
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === 'undefined' || clientId === '') {
      return reject(new Error('Google Client ID tidak dikonfigurasi'));
    }

    // If already initialized, resolve immediately
    if (isInitialized && (window as any).google?.accounts?.oauth2) {
      return resolve();
    }

    // If SDK is already loaded but not initialized
    if (isGoogleSDKLoaded && (window as any).google?.accounts?.oauth2) {
      try {
        isInitialized = true;
        return resolve();
      } catch (error) {
        // console.error('Error initializing Google SDK:', error);
        return reject(error);
      }
    }

    // Load Google SDK if not loaded
    if (!isGoogleSDKLoaded) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        isGoogleSDKLoaded = true;
        
        // Wait for Google SDK to be fully available
        const checkGoogleReady = () => {
          if ((window as any).google?.accounts?.oauth2) {
            isInitialized = true;
            resolve();
          } else {
            // Retry after a short delay
            setTimeout(checkGoogleReady, 100);
          }
        };
        
        checkGoogleReady();
      };

      script.onerror = () => {
        isGoogleSDKLoaded = false;
        initializationPromise = null;
        reject(new Error('Gagal memuat Google SDK'));
      };

      document.head.appendChild(script);
    }
  });

  return initializationPromise;
};

// Trigger Google sign-in popup with better error handling
export const triggerGoogleSignIn = (): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Google sign-in hanya tersedia di browser'));
    }

    // Check if there's already an active request
    if (activeRequest) {
      // console.log('Google sign-in already in progress, waiting for completion...');
      try {
        const result = await activeRequest;
        return resolve(result);
      } catch (error) {
        // If the active request failed, we can try again
        activeRequest = null;
      }
    }

    // Check if there's already a pending credential request
    if (credentialRequestPending) {
      return reject(new Error('Google sign-in sedang diproses. Silakan tunggu sebentar.'));
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === 'undefined' || clientId === '') {
      return reject(new Error('Google login belum dikonfigurasi'));
    }

    // Ensure Google SDK is initialized
    try {
      await initializeGoogleLogin();
    } catch (error) {
      return reject(new Error('Google SDK tidak dapat diinisialisasi'));
    }

    if (!(window as any).google?.accounts?.oauth2) {
      return reject(new Error('Google SDK belum dimuat dengan benar'));
    }

    // Cancel any existing One Tap to prevent conflicts
    disableOneTap();

    // Set up the request promise
    const requestPromise = new Promise<any>((resolveRequest, rejectRequest) => {
      try {
        credentialRequestPending = true;
        
        // Set up timeout
        const timeoutId = setTimeout(() => {
          credentialRequestPending = false;
          activeRequest = null;
          rejectRequest(new Error('Timeout: Login Google memakan waktu terlalu lama. Silakan coba lagi.'));
        }, 30000); // 30 second timeout

        // Try redirect flow approach first - this avoids COOP issues
        try {
          // console.log("Using redirect flow for Google authentication");
          
          // Create a unique state parameter to verify the response
          const state = Math.random().toString(36).substring(2);
          localStorage.setItem('google_auth_state', state);
          
          // Build the authorization URL
          const redirectUri = window.location.origin + '/auth/google/callback';
          const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
          authUrl.searchParams.append('client_id', clientId!);
          authUrl.searchParams.append('redirect_uri', redirectUri);
          authUrl.searchParams.append('response_type', 'token');
          authUrl.searchParams.append('scope', 'email profile openid');
          authUrl.searchParams.append('state', state);
          authUrl.searchParams.append('prompt', 'select_account');
          
          // Redirect to Google auth
          window.location.href = authUrl.toString();
          
          // Clear timeout since we're redirecting
          clearTimeout(timeoutId);
          
          // Since we're redirecting, we won't get to this point in the current execution
          // But just in case something goes wrong:
          setTimeout(() => {
            // console.log("Redirect failed to initiate, trying popup as fallback");
            tryPopupFlow();
          }, 1000);
          
        } catch (redirectError) {
          // console.error("Redirect flow failed:", redirectError);
          tryPopupFlow();
        }
        
        // Popup flow as fallback
        function tryPopupFlow() {
          // console.log("Attempting popup authentication flow");
          
          try {
            const client = (window as any).google.accounts.oauth2.initTokenClient({
              client_id: clientId!,
              scope: 'email profile openid',
              callback: async (response: any) => {
                clearTimeout(timeoutId);
                credentialRequestPending = false;
                activeRequest = null;
    
                try {
                  if (response.error) {
                    // console.error('Google OAuth error:', response.error);
                    return rejectRequest(new Error(response.error_description || 'Google authentication error'));
                  }
    
                  if (!response.access_token) {
                    return rejectRequest(new Error('Tidak mendapat akses token dari Google'));
                  }
    
                  // Get user info using access token
                  const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                    headers: {
                      Authorization: `Bearer ${response.access_token}`,
                    },
                  });
    
                  if (!userInfoResponse.ok) {
                    return rejectRequest(new Error('Gagal mendapatkan informasi pengguna dari Google'));
                  }
    
                  const userInfo = await userInfoResponse.json();
                  // console.log('Google user info retrieved successfully');
                  resolveRequest(userInfo);
                } catch (error: any) {
                  // console.error('Error processing Google response:', error);
                  rejectRequest(new Error(error.message || 'Error processing Google response'));
                }
              },
              error_callback: (error: any) => {
                clearTimeout(timeoutId);
                credentialRequestPending = false;
                activeRequest = null;
                
                // console.error('Google OAuth error callback:', error);
                
                if (error.type === 'popup_closed') {
                  rejectRequest(new Error('Google sign-in dibatalkan'));
                } else if (error.type === 'popup_failed_to_open') {
                  // If popup fails due to COOP, fall back to redirect flow
                  // console.log('Popup failed due to browser restrictions, falling back to redirect');
                  
                  // Create a unique state parameter
                  const state = Math.random().toString(36).substring(2);
                  localStorage.setItem('google_auth_state', state);
                  
                  // Build the auth URL
                  const redirectUri = window.location.origin + '/auth/google/callback';
                  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
                  authUrl.searchParams.append('client_id', clientId!);
                  authUrl.searchParams.append('redirect_uri', redirectUri);
                  authUrl.searchParams.append('response_type', 'token');
                  authUrl.searchParams.append('scope', 'email profile openid');
                  authUrl.searchParams.append('state', state);
                  authUrl.searchParams.append('prompt', 'select_account');
                  
                  // Redirect to Google auth
                  window.location.href = authUrl.toString();
                } else {
                  rejectRequest(new Error(error.message || 'Terjadi kesalahan saat Google sign-in'));
                }
              },
            });
            
            // Request access token with iframe/popup
            client.requestAccessToken({
              prompt: 'select_account',
            });
          } catch (popupError) {
            // console.error("Popup flow failed:", popupError);
            credentialRequestPending = false;
            activeRequest = null;
            rejectRequest(new Error('Failed to initialize Google authentication'));
          }
        }
      } catch (error: any) {
        credentialRequestPending = false;
        activeRequest = null;
        
        // console.error('Google sign-in setup error:', error);
        rejectRequest(new Error(error.message || 'Terjadi kesalahan saat Google sign-in'));
      }
    });

    // Store the active request
    activeRequest = requestPromise;

    try {
      const result = await requestPromise;
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

// Initialize One Tap Sign-In
export function initializeOneTap(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('One Tap hanya tersedia di browser'));
      return;
    }

    if (oneTapDisabled) {
      return reject(new Error('One Tap telah dinonaktifkan'));
    }

    if (credentialRequestPending || activeRequest) {
      return reject(new Error('Credential request sedang berlangsung'));
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === 'undefined' || clientId === '') {
      return reject(new Error('Google Client ID tidak dikonfigurasi'));
    }

    if (!(window as any).google?.accounts?.id) {
      return reject(new Error('Google One Tap SDK belum dimuat'));
    }

    try {
      (window as any).google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          try {
            if (!response.credential) {
              return;
            }

            // Decode JWT token
            const credential = JSON.parse(atob(response.credential.split('.')[1]));
            
            const userInfo = {
              id: credential.sub,
              email: credential.email,
              name: credential.name,
              picture: credential.picture,
              verified_email: credential.email_verified,
            };

            // console.log('One Tap login successful:', userInfo);
            
          } catch (error) {
            // console.error('One Tap callback error:', error);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        context: 'signin',
        itp_support: true,
      });

      (window as any).google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          // console.log('One Tap tidak ditampilkan:', notification.getNotDisplayedReason());
          reject(new Error('One Tap tidak dapat ditampilkan'));
        } else if (notification.isSkippedMoment()) {
          // console.log('One Tap dilewati:', notification.getSkippedReason());
          reject(new Error('One Tap dilewati'));
        } else if (notification.isDismissedMoment()) {
          // console.log('One Tap dibatalkan:', notification.getDismissedReason());
          reject(new Error('One Tap dibatalkan'));
        } else {
          resolve();
        }
      });

    } catch (error: any) {
      // console.error('One Tap initialization error:', error);
      reject(error);
    }
  });
}

export function disableOneTap(): void {
  if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
    try {
      (window as any).google.accounts.id.disableAutoSelect();
      // console.log('One Tap disabled');
    } catch (error) {
      // console.error('Error disabling One Tap:', error);
    }
  }
}

export const enableOneTap = () => {
  oneTapDisabled = false;
};

// Reset all states
export const resetGoogleAuthState = () => {
  credentialRequestPending = false;
  activeRequest = null;
  oneTapDisabled = false;
  // console.log('Google auth state reset');
};

// Get current state for debugging
export const getGoogleAuthState = () => {
  return {
    isGoogleSDKLoaded,
    isInitialized,
    oneTapDisabled,
    credentialRequestPending,
    hasActiveRequest: activeRequest !== null,
  };
};

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
    console.error('Google Client ID is not configured');
    return false;
  }
  
  // Check if client ID looks valid (should be a long string ending with .apps.googleusercontent.com)
  if (!GOOGLE_CONFIG.clientId.includes('.apps.googleusercontent.com')) {
    console.error('Google Client ID format is invalid');
    return false;
  }
  
  return true;
}

// Initialize Google login with One Tap support
export function initializeGoogleLogin(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Google login hanya tersedia di browser'));
      return;
    }

    // Validate configuration first
    if (!validateGoogleConfig()) {
      reject(new Error('Google OAuth belum dikonfigurasi dengan benar'));
      return;
    }

    // Check if already loaded
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      try {
        // Initialize Google Identity Services with One Tap support
        window.google?.accounts.id.initialize({
          client_id: GOOGLE_CONFIG.clientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false, // Disable FedCM to avoid network errors
          itp_support: true,
          // One Tap configuration
          context: 'signin',
          ux_mode: 'popup',
          state_cookie_domain: window.location.hostname
        });
        resolve();
      } catch (initError) {
        console.error('Google initialization error:', initError);
        reject(new Error('Gagal menginisialisasi Google Authentication'));
      }
    };
    
    script.onerror = () => {
      reject(new Error('Gagal memuat Google Authentication'));
    };
    
    document.head.appendChild(script);
  });
}

// Initialize One Tap Sign-In
export function initializeOneTap(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('One Tap hanya tersedia di browser'));
      return;
    }

    if (!validateGoogleConfig()) {
      reject(new Error('Google OAuth belum dikonfigurasi dengan benar'));
      return;
    }

    if (!window.google?.accounts?.id) {
      reject(new Error('Google SDK belum dimuat'));
      return;
    }

    try {
      // Show One Tap if user has previously signed in
      window.google.accounts.id.prompt((notification: any) => {
        console.log('One Tap notification:', notification);
        
        if (notification.isNotDisplayed()) {
          console.log('One Tap was not displayed:', notification.getNotDisplayedReason());
          resolve(); // Don't reject, just resolve without showing
        } else if (notification.isSkippedMoment()) {
          console.log('One Tap was skipped:', notification.getSkippedReason());
          resolve(); // Don't reject, just resolve without showing
        } else if (notification.isDismissedMoment()) {
          console.log('One Tap was dismissed:', notification.getDismissedReason());
          resolve(); // Don't reject, just resolve without showing
        } else {
          console.log('One Tap is being displayed');
          resolve();
        }
      });
    } catch (error) {
      console.error('One Tap initialization error:', error);
      resolve(); // Don't reject, just resolve without showing
    }
  });
}

// Check if user is eligible for One Tap
export function checkOneTapEligibility(): boolean {
  if (typeof window === 'undefined' || !window.google?.accounts?.id) {
    return false;
  }

  // Check if there's a stored Google session
  const cookies = document.cookie.split(';');
  const hasGoogleSession = cookies.some(cookie => 
    cookie.trim().startsWith('g_state') || 
    cookie.trim().startsWith('__Secure-1PSID') ||
    cookie.trim().startsWith('__Secure-3PSID')
  );

  return hasGoogleSession;
}

// Disable One Tap (useful when user manually logs out)
export function disableOneTap(): void {
  if (typeof window !== 'undefined' && window.google?.accounts?.id) {
    try {
      window.google.accounts.id.disableAutoSelect();
      console.log('One Tap disabled');
    } catch (error) {
      console.error('Error disabling One Tap:', error);
    }
  }
}

// Handle Google credential response
function handleGoogleCredentialResponse(response: any) {
  try {
    if (response.credential) {
      // Decode JWT token to get user info
      const userInfo = parseJwt(response.credential);
      
      if (!userInfo) {
        const errorEvent = new CustomEvent('googleLoginError', {
          detail: { message: 'Gagal memproses kredensial Google' }
        });
        window.dispatchEvent(errorEvent);
        return;
      }
      
      // Trigger custom event with user data
      const event = new CustomEvent('googleLoginSuccess', {
        detail: {
          credential: response.credential,
          userInfo: userInfo
        }
      });
      window.dispatchEvent(event);
    } else {
      const errorEvent = new CustomEvent('googleLoginError', {
        detail: { message: 'Tidak menerima kredensial dari Google' }
      });
      window.dispatchEvent(errorEvent);
    }
  } catch (error) {
    console.error('Error handling Google credential response:', error);
    const errorEvent = new CustomEvent('googleLoginError', {
      detail: { message: 'Terjadi kesalahan saat memproses respon Google' }
    });
    window.dispatchEvent(errorEvent);
  }
}

// Parse JWT token to extract user information
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
}

// Trigger Google sign-in popup with better error handling
export function triggerGoogleSignIn(): Promise<GoogleUserInfo> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Google authentication tidak tersedia'));
      return;
    }

    if (!validateGoogleConfig()) {
      reject(new Error('Google OAuth belum dikonfigurasi dengan benar'));
      return;
    }

    if (!window.google?.accounts?.id) {
      reject(new Error('Google SDK belum dimuat. Silakan refresh halaman dan coba lagi.'));
      return;
    }

    // Listen for the success event
    const handleSuccess = (event: any) => {
      window.removeEventListener('googleLoginSuccess', handleSuccess);
      const userInfo = event.detail.userInfo;
      
      if (userInfo && userInfo.email) {
        resolve({
          id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          verified_email: userInfo.email_verified
        });
      } else {
        reject(new Error('Gagal mendapatkan informasi pengguna dari Google'));
      }
    };

    // Listen for network/popup errors
    const handleError = (event: any) => {
      window.removeEventListener('googleLoginError', handleError);
      window.removeEventListener('googleLoginSuccess', handleSuccess);
      reject(new Error(event.detail?.message || 'Terjadi kesalahan saat login dengan Google'));
    };

    window.addEventListener('googleLoginSuccess', handleSuccess);
    window.addEventListener('googleLoginError', handleError);

    // Try Google sign-in with fallback methods
    try {
      // Method 1: Try prompt first
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('Google prompt not displayed, trying alternative method');
          
          // Method 2: Try creating a temporary button as fallback
          setTimeout(() => {
            try {
              const tempDiv = document.createElement('div');
              tempDiv.style.position = 'absolute';
              tempDiv.style.top = '-9999px';
              tempDiv.style.left = '-9999px';
              document.body.appendChild(tempDiv);

              window.google!.accounts.id.renderButton(tempDiv, {
                theme: 'outline',
                size: 'large',
                type: 'standard',
                click_listener: () => {
                  document.body.removeChild(tempDiv);
                }
              });

              // Simulate button click
              const button = tempDiv.querySelector('div[role="button"]') as HTMLElement;
              if (button) {
                button.click();
              } else {
                // If button method fails, show error
                window.removeEventListener('googleLoginSuccess', handleSuccess);
                window.removeEventListener('googleLoginError', handleError);
                reject(new Error('Google sign-in tidak tersedia saat ini. Silakan coba lagi nanti atau gunakan login email/password.'));
              }
            } catch (buttonError) {
              console.error('Button fallback error:', buttonError);
              window.removeEventListener('googleLoginSuccess', handleSuccess);
              window.removeEventListener('googleLoginError', handleError);
              reject(new Error('Google sign-in tidak tersedia saat ini. Silakan gunakan login email/password.'));
            }
          }, 1000);
        }
      });
    } catch (error) {
      console.error('Google sign-in trigger error:', error);
      window.removeEventListener('googleLoginSuccess', handleSuccess);
      window.removeEventListener('googleLoginError', handleError);
      reject(new Error('Gagal memulai proses login Google. Silakan coba lagi atau gunakan login email/password.'));
    }

    // Timeout after 30 seconds
    setTimeout(() => {
      window.removeEventListener('googleLoginSuccess', handleSuccess);
      window.removeEventListener('googleLoginError', handleError);
      reject(new Error('Timeout: Login Google memakan waktu terlalu lama. Silakan coba lagi.'));
    }, 30000);
  });
}

// Declare global types for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

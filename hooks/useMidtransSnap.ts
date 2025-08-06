import { useState, useEffect, useCallback } from 'react';

interface UseMidtransSnapOptions {
  clientKey?: string;
  onReady?: () => void;
  onError?: (error: Error) => void;
  maxRetries?: number;
}

export function useMidtransSnap({ 
  clientKey, 
  onReady, 
  onError, 
  maxRetries = 5 
}: UseMidtransSnapOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Function to check if Snap is available
  const checkSnapAvailability = useCallback(() => {
    return typeof window !== 'undefined' && !!window.snap;
  }, []);

  // Function to load Midtrans script
  const loadMidtransScript = useCallback(async () => {
    if (typeof window === 'undefined') return false;
    if (window.snap) return true;
    if (retryCount >= maxRetries) {
      throw new Error(`Failed to load Midtrans after ${maxRetries} attempts`);
    }

    try {
      setIsLoading(true);
      // console.log(`🔄 Loading Midtrans Snap script (attempt ${retryCount + 1})...`);

      // Use environment variable for client key or fallback to provided one
      const midtransClientKey = clientKey || process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
      
      if (!midtransClientKey) {
        throw new Error('Midtrans client key is missing');
      }

      const midtransUrl = process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || 
                          'https://app.sandbox.midtrans.com/snap/snap.js';

      // Check if the script is already in the document
      let scriptElement = document.querySelector('script[src*="snap.js"]');
      
      // If no script found, create and append it
      if (!scriptElement) {
        // console.log('No Midtrans script found, creating new script element');
        scriptElement = document.createElement('script');
        scriptElement.setAttribute('src', midtransUrl);
        scriptElement.setAttribute('data-client-key', midtransClientKey);
        scriptElement.setAttribute('id', 'midtrans-script-' + Date.now());
        scriptElement.setAttribute('async', 'true');
        
        document.body.appendChild(scriptElement);
      } else {
        // console.log('Midtrans script already exists in DOM');
      }

      // Now wait for the script to load and initialize
      return new Promise<boolean>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Midtrans script loading timed out'));
        }, 10000);

        const checkInterval = setInterval(() => {
          if (window.snap) {
            clearTimeout(timeoutId);
            clearInterval(checkInterval);
            // console.log('✅ Midtrans Snap object detected on window');
            resolve(true);
          }
        }, 100);

        // Also set up event listener for the script
        (scriptElement as HTMLScriptElement).onload = () => {
          // console.log('Script onload event fired');
          // The interval will still check for window.snap
        };

        (scriptElement as HTMLScriptElement).onerror = (e) => {
          clearTimeout(timeoutId);
          clearInterval(checkInterval);
          reject(new Error(`Failed to load Midtrans script: ${e}`));
        };
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error loading Midtrans');
      // console.error('❌ Error in loadMidtransScript:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [clientKey, retryCount, maxRetries]);

  // Initialize Midtrans
  useEffect(() => {
    // Don't do anything if already loaded or in loading state
    if (isReady || isLoading) return;
    
    // Check if already available (global script might have loaded it)
    if (checkSnapAvailability()) {
      // console.log('✅ Midtrans Snap already available on window');
      setIsReady(true);
      onReady?.();
      return;
    }

    const initMidtrans = async () => {
      try {
        setIsLoading(true);
        
        // Try to load the script
        const success = await loadMidtransScript();
        
        if (success) {
          setIsReady(true);
          setError(null);
          onReady?.();
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error initializing Midtrans');
        // console.error('Error initializing Midtrans:', error);
        setError(error);
        onError?.(error);
        
        // Increment retry count for the next attempt
        setRetryCount(prev => prev + 1);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial delay before loading to allow other scripts to initialize
    const timer = setTimeout(() => {
      initMidtrans();
    }, 1000);

    return () => clearTimeout(timer);
  }, [checkSnapAvailability, isReady, isLoading, loadMidtransScript, onError, onReady, retryCount]);

  // Handle retries
  useEffect(() => {
    if (error && retryCount < maxRetries && !isLoading) {
      const retryTimer = setTimeout(() => {
        // console.log(`🔄 Retrying Midtrans initialization (${retryCount + 1}/${maxRetries})...`);
        setError(null);
        // The main effect will pick up and try again
      }, 2000 * (retryCount + 1)); // Exponential backoff

      return () => clearTimeout(retryTimer);
    }
  }, [error, retryCount, maxRetries, isLoading]);

  return {
    isLoading,
    isReady,
    error,
    snap: typeof window !== 'undefined' ? window.snap : undefined,
    isSnapAvailable: checkSnapAvailability,
    retryCount
  };
}

// Add type declaration for window.snap
declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: any) => void;
    };
    __MIDTRANS_LOADED?: boolean;
  }
}

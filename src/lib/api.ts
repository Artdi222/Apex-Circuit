import { treaty } from '@elysiajs/eden';
import type { App } from '@backend/app';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

let refreshPromise: Promise<string | null> | null = null;

let refreshTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Decode JWT payload without verification.
 * Returns the parsed payload or null if invalid.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload;
  } catch {
    return null;
  }
}

/**
 * Perform the actual token refresh call. Returns the new access token or null.
 * On failure, clears auth state and dispatches 'auth-expired'.
 */
async function performTokenRefresh(): Promise<string | null> {
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
  if (!refreshToken) {
    console.warn('[Auth] No refresh token available for renewal');
    return null;
  }

  // Deduplicate: if a refresh is already in flight, reuse that promise
  if (!refreshPromise) {
    console.log('[Auth] Starting token refresh cycle...');
    refreshPromise = (async () => {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const resJson = await refreshRes.json();
          const newToken = resJson.data?.accessToken || resJson.accessToken;
          
          if (newToken && typeof window !== 'undefined') {
            console.log('[Auth] Token refreshed successfully');
            localStorage.setItem('access_token', newToken);
            
            const newRefresh = resJson.data?.refreshToken || resJson.refreshToken;
            if (newRefresh) {
              localStorage.setItem('refresh_token', newRefresh);
            }
            
            scheduleTokenRefresh(newToken);
            return newToken;
          }
        }

        // If we get a definitive auth error (401/403), the refresh token is dead
        if (refreshRes.status === 401 || refreshRes.status === 403) {
          // Check if another tab refreshed the token while we were waiting
          const latestRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
          if (latestRefreshToken && latestRefreshToken !== refreshToken) {
            console.log('[Auth] Token was already rotated by another tab, recovery successful');
            return localStorage.getItem('access_token');
          }

          console.error('[Auth] Refresh token rejected by server, logging out');
          handleAuthFailure();
        } else {
          console.warn(`[Auth] Refresh failed with status ${refreshRes.status}, keeping current session for now`);
        }
        
        return null;
      } catch (error) {
        console.error('[Auth] Network error during token refresh:', error);
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  } else {
    console.log('[Auth] Waiting for existing refresh promise...');
  }

  return refreshPromise;
}

/**
 * Clear tokens and notify the app that auth has genuinely expired.
 */
function handleAuthFailure() {
  if (typeof window !== 'undefined') {
    console.log('[Auth] Clearing tokens and dispatching auth-expired');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    stopTokenRefreshTimer();
    window.dispatchEvent(new Event('auth-expired'));
  }
}

/**
 * Schedule a proactive token refresh ~1 minute before the access token expires.
 * This way the user never sees a 401 in normal usage.
 */
export function scheduleTokenRefresh(accessToken?: string) {
  stopTokenRefreshTimer();

  if (typeof window === 'undefined') return;

  const token = accessToken || localStorage.getItem('access_token');
  if (!token) return;

  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') {
    console.warn('[Auth] Could not decode token for scheduling refresh');
    return;
  }

  const expiresAtMs = payload.exp * 1000;
  const now = Date.now();
  
  // Refresh 60 seconds before expiry, minimum 5 seconds from now
  // If it's already expired or very close, refresh in 5 seconds
  const refreshInMs = Math.max(expiresAtMs - now - 60_000, 5_000);
  
  console.log(`[Auth] Next proactive refresh scheduled in ${Math.round(refreshInMs / 1000)}s (${new Date(expiresAtMs).toLocaleTimeString()})`);

  refreshTimer = setTimeout(async () => {
    console.log('[Auth] Executing proactive refresh...');
    const newToken = await performTokenRefresh();
    if (newToken) {
      window.dispatchEvent(new Event('auth-refreshed'));
    }
  }, refreshInMs);
}

/**
 * Stop the proactive refresh timer.
 */
export function stopTokenRefreshTimer() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

// Create the Eden Treaty client
export const api = treaty<App>(API_BASE_URL, {
  fetcher: (async (input: RequestInfo | URL, init?: RequestInit) => {
    let response = await fetch(input, init);

    if (response.status === 401) {
      // Don't intercept if it's already the refresh endpoint or login endpoint
      const urlStr = input.toString();
      if (urlStr.includes('/auth/refresh') || urlStr.includes('/auth/login')) {
        return response;
      }

      // Attempt silent token refresh
      const newToken = await performTokenRefresh();
      if (newToken) {
        // Retry the original request with the new token
        const newHeaders = new Headers(init?.headers);
        newHeaders.set('Authorization', `Bearer ${newToken}`);

        return fetch(input, {
          ...init,
          headers: newHeaders,
        });
      }
    }

    return response;
  }) as typeof fetch,
  fetch: {
    credentials: 'include',
  },
  headers() {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('access_token')
      : null;

    return token
      ? { Authorization: `Bearer ${token}` }
      : {};
  },
});

// Error helper for Eden responses
export class ApiRequestError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

/**
 * Helper to unwrap Eden Treaty responses.
 * Eden returns { data, error, status }, this throws on error for cleaner usage.
 * Also handles the backend's standard { success, data } wrapper.
 */
export function unwrap<T>(response: { data: T | null; error: any; status: number }): T extends { success: boolean; data: infer D } ? D : T {
  if (response.error) {
    const message = typeof response.error.value === 'object'
      ? response.error.value?.error?.message || response.error.value?.message || 'Request failed'
      : String(response.error.value);
    throw new ApiRequestError(message, response.status, 'API_ERROR');
  }

  const data = response.data as any;

  // If the backend wrapped the response in { success: true, data: ... }
  if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
    return data.data;
  }

  return data;
}

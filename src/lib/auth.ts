import { api, unwrap, ApiRequestError } from './api';

export interface User {
  id: string;
  email: string;
  username: string;
  phone: string | null;
  role: 'user' | 'admin' | 'superadmin';
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  phone?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  user: User;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    console.log('[Auth] Attempting login for', credentials.email);
    const response = await api.api.v1.auth.login.post(credentials);
    const result = unwrap(response);
    const data = (result as any).data ?? result;

    console.log('[Auth] Login successful, saving tokens');
    localStorage.setItem('access_token', data.accessToken);
    localStorage.setItem('refresh_token', data.refreshToken);

    return data;
  },

  async register(data: RegisterData): Promise<AuthTokens> {
    console.log('[Auth] Attempting registration for', data.email);
    const response = await api.api.v1.auth.register.post(data);
    const result = unwrap(response);
    const authData = (result as any).data ?? result;

    console.log('[Auth] Registration successful, saving tokens');
    localStorage.setItem('access_token', authData.accessToken);
    localStorage.setItem('refresh_token', authData.refreshToken);

    return authData;
  },

  async refreshToken(): Promise<string | null> {
    // This is a backup method, primary refresh logic is in api.ts
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return null;

    try {
      console.log('[Auth] authService.refreshToken triggered');
      const response = await api.api.v1.auth.refresh.post({
        refreshToken,
      });
      const result = unwrap(response);
      const data = (result as any).data ?? result;

      const newToken = data.accessToken;
      localStorage.setItem('access_token', newToken);
      
      const newRefresh = data.refreshToken;
      if (newRefresh) {
        localStorage.setItem('refresh_token', newRefresh);
      }
      
      return newToken;
    } catch (error) {
      console.error('[Auth] authService.refreshToken failed', error);
      this.logout();
      return null;
    }
  },

  async getMe(): Promise<User | null> {
    try {
      const response = await api.api.v1.users.me.get();
      const result = unwrap(response);
      const data = (result as any).data ?? result;
      return data as User;
    } catch (error) {
      console.warn('[Auth] getMe failed', error);
      return null;
    }
  },

  logout() {
    console.log('[Auth] Logging out, clearing localStorage');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('access_token');
    return !!token;
  },
};

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, authService, LoginCredentials, RegisterData } from '@/lib/auth';
import { scheduleTokenRefresh, stopTokenRefreshTimer } from '@/lib/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isInitialized: false,
      error: null,

      setUser: (user) => set({ user }),

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authService.login(credentials);
          set({ user: data.user, isLoading: false });
          // Start proactive refresh cycle after login
          scheduleTokenRefresh();
        } catch (error: any) {
          set({ error: error.message || 'Login failed', isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const authData = await authService.register(data);
          set({ user: authData.user, isLoading: false });
          // Start proactive refresh cycle after registration
          scheduleTokenRefresh();
        } catch (error: any) {
          set({ error: error.message || 'Registration failed', isLoading: false });
          throw error;
        }
      },

      logout: () => {
        authService.logout();
        stopTokenRefreshTimer();
        set({ user: null, error: null });
      },

      refreshUser: async () => {
        if (!authService.isAuthenticated()) {
          console.log('[Auth] No session found, skipping user refresh');
          set({ user: null, isInitialized: true, isLoading: false });
          return;
        }
        
        // Start proactive refresh timer whenever we validate the session
        scheduleTokenRefresh();

        // Only show global loading on initial app load, not silent background refreshes
        if (!get().isInitialized) {
          set({ isLoading: true });
        }

        try {
          console.log('[Auth] Fetching current user profile...');
          const user = await authService.getMe();
          set({ user, isLoading: false, isInitialized: true });
        } catch (error) {
          console.warn('[Auth] Failed to refresh user profile', error);
          set({ user: null, isLoading: false, isInitialized: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);

// Listen for auth-expired and auth-refreshed events (runs once on module load)
if (typeof window !== 'undefined') {
  window.addEventListener('auth-expired', () => {
    const { logout } = useAuth.getState();
    // Use set directly instead of logout to avoid double-clearing
    useAuth.setState({ user: null, error: null });
    stopTokenRefreshTimer();
  });

  window.addEventListener('auth-refreshed', () => {
    // Silently re-fetch user data after background token renewal
    const { refreshUser } = useAuth.getState();
    refreshUser();
  });
}

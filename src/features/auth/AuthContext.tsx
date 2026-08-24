import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSessionToken, getSessionProfile, saveSession, clearSession, UserProfile } from '../../storage/session';
import { API_CONFIG } from '../../config/constants';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check storage on mount
  useEffect(() => {
    async function bootstrapAsync() {
      try {
        const storedToken = await getSessionToken();
        const storedProfile = await getSessionProfile();
        
        if (storedToken && storedProfile) {
          setToken(storedToken);
          setUser(storedProfile);
        }
      } catch (e) {
        console.warn('Failed to load session from storage', e);
      } finally {
        setIsLoading(false);
      }
    }
    bootstrapAsync();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.message || 'Login failed');
      const profile = { ...payload.data.user, role: payload.data.user.role.toLowerCase() } as UserProfile;
      await saveSession(payload.data.token, profile); setToken(payload.data.token); setUser(profile);
    } catch (e) {
      console.error(e);
      throw new Error('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password, role: 'CITIZEN' }) });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.message || 'Registration failed');
      const profile = { ...payload.data.user, role: 'citizen' } as UserProfile;
      await saveSession(payload.data.token, profile); setToken(payload.data.token); setUser(profile);
    } catch (e) {
      console.error(e);
      throw new Error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await clearSession();
      setToken(null);
      setUser(null);
    } catch (e) {
      console.error('Logout failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

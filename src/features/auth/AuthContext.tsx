import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSessionToken, getSessionProfile, saveSession, clearSession, UserProfile } from '../../storage/session';
import { authService } from '../../services/authService';
import { UserRole } from '../../types/models';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore saved session from AsyncStorage on app startup
  const restoreSession = useCallback(async () => {
    try {
      const [storedToken, storedProfile] = await Promise.all([
        getSessionToken(),
        getSessionProfile(),
      ]);

      if (storedToken && storedProfile) {
        setToken(storedToken);
        setUser(storedProfile);
      }
    } catch (e) {
      console.warn('[AuthContext] Failed to load session from storage:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const authData = await authService.login({ email, password });
      
      const profile: UserProfile = {
        id: authData.user.id,
        name: authData.user.name,
        email: authData.user.email,
        role: authData.user.role,
      };

      await saveSession(authData.token, profile);
      setToken(authData.token);
      setUser(profile);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Login failed. Please check your credentials.';
      console.error('[AuthContext] Login error:', errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole = 'CITIZEN') => {
    setIsLoading(true);
    try {
      const authData = await authService.register({ name, email, password, role });

      const profile: UserProfile = {
        id: authData.user.id,
        name: authData.user.name,
        email: authData.user.email,
        role: authData.user.role,
      };

      await saveSession(authData.token, profile);
      setToken(authData.token);
      setUser(profile);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      console.error('[AuthContext] Registration error:', errorMsg);
      throw new Error(errorMsg);
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
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
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


import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSessionToken, getSessionProfile, saveSession, clearSession, UserProfile } from '../../storage/session';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string) => Promise<void>;
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
      // Prototype Mock Authentication Logic
      // In production, you would call authService.loginUser(email, password)
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate api delay
      
      const mockToken = 'mock_jwt_token_for_' + email;
      const mockProfile: UserProfile = {
        id: '123',
        name: 'Citizen Jane Doe',
        email: email,
        phone: '+91 9876543210',
        role: 'citizen',
      };
      
      await saveSession(mockToken, mockProfile);
      setToken(mockToken);
      setUser(mockProfile);
    } catch (e) {
      console.error(e);
      throw new Error('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string) => {
    setIsLoading(true);
    try {
      // Mock registration delay
      await new Promise((resolve) => setTimeout(resolve, 1200));
      
      const mockToken = 'mock_jwt_token_for_' + email;
      const mockProfile: UserProfile = {
        id: '124',
        name: name,
        email: email,
        role: 'citizen',
      };
      
      await saveSession(mockToken, mockProfile);
      setToken(mockToken);
      setUser(mockProfile);
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

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  AuthTokens, 
  getStoredTokens, 
  storeTokens, 
  clearStoredTokens, 
  isTokenValid, 
  getUserFromToken,
  needsTokenRefresh 
} from '../lib/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tokens: AuthTokens) => void;
  logout: () => void;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // بررسی وضعیت احراز هویت در localStorage
  useEffect(() => {
    const checkAuth = () => {
      try {
        const tokens = getStoredTokens();
        if (!tokens) {
          setIsLoading(false);
          return;
        }

        if (isTokenValid(tokens.accessToken)) {
          const userData = getUserFromToken(tokens.accessToken);
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            clearStoredTokens();
          }
        } else if (isTokenValid(tokens.refreshToken)) {
          // نیاز به refresh توکن
          refreshAuth();
        } else {
          // هر دو توکن منقضی شده‌اند
          clearStoredTokens();
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        clearStoredTokens();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // بررسی منظم نیاز به refresh توکن
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      if (needsTokenRefresh()) {
        refreshAuth();
      }
    }, 60000); // بررسی هر دقیقه

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // تابع refresh احراز هویت
  const refreshAuth = async () => {
    try {
      const tokens = getStoredTokens();
      if (!tokens?.refreshToken) {
        logout();
        return;
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });

      if (response.ok) {
        const newTokens = await response.json();
        storeTokens(newTokens);
        
        const userData = getUserFromToken(newTokens.accessToken);
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        }
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error refreshing auth:', error);
      logout();
    }
  };

  // تابع ورود
  const login = (tokens: AuthTokens) => {
    storeTokens(tokens);
    const userData = getUserFromToken(tokens.accessToken);
    if (userData) {
      setUser(userData);
      setIsAuthenticated(true);
    }
  };

  // تابع خروج
  const logout = () => {
    clearStoredTokens();
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // بررسی وجود کاربر و توکن در localStorage
    const userData = localStorage.getItem('user');
    const tokenData = localStorage.getItem('accessToken');
    
    if (userData) {
      setUser(JSON.parse(userData));
    }
    if (tokenData) {
      setToken(tokenData);
    }
    setLoading(false);
  }, []);

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('خطا در logout:', error);
    } finally {
      localStorage.removeItem('user');
      setUser(null);
      router.push('/login');
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // اگر refresh ناموفق بود، logout کن
        await logout();
        return;
      }

      const data = await response.json();
      if (data?.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        setToken(data.accessToken);
      }
    } catch (error) {
      console.error('خطا در refresh token:', error);
      await logout();
    }
  };

  return {
    user,
    token,
    loading,
    logout,
    refreshToken,
    setUser
  };
} 
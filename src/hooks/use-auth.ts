
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { MOCK_USER } from '@/lib/data';

const AUTH_KEY = 'casa-organizzata-auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(AUTH_KEY);
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        if (authData.isAuthenticated) {
          setUser(MOCK_USER);
        }
      }
    } catch (error) {
        console.error("Failed to parse auth data from localStorage", error);
    }
    setLoading(false);
  }, []);

  const login = useCallback(() => {
    setLoading(true);
    localStorage.setItem(AUTH_KEY, JSON.stringify({ isAuthenticated: true }));
    setUser(MOCK_USER);
    router.push('/');
    setLoading(false);
  }, [router]);

  const logout = useCallback(() => {
    setLoading(true);
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
    router.push('/login');
    setLoading(false);
  }, [router]);

  return { user, login, logout, loading };
}


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
        setUser(JSON.parse(storedAuth));
      }
    } catch (error) {
      console.error('Failed to parse auth from localStorage', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(() => {
    setLoading(true);
    const mockUser: User = {
        ...MOCK_USER,
        // Mimic what Firebase user object might have
        uid: 'mock-user-uid',
        providerId: 'google.com',
        photoURL: MOCK_USER.avatar,
        displayName: MOCK_USER.name,
    } as User;
    localStorage.setItem(AUTH_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
    setLoading(false);
    router.push('/');
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
    router.push('/login');
  }, [router]);

  return { user, login, logout, loading, error: null };
}

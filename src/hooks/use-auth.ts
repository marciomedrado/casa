
'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { useUser, useFirebase } from '@/firebase';

export function useAuth() {
  const { auth } = useFirebase();
  const { user, isUserLoading, userError } = useUser();
  const router = useRouter();

  const login = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (error) {
      console.error("Erro no login com Google:", error);
    }
  }, [auth, router]);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  }, [auth, router]);

  return { 
    user, 
    login, 
    logout, 
    loading: isUserLoading,
    error: userError 
  };
}

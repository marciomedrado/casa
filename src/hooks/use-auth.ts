'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export function useAuth() {
  const { auth, firestore, user, isUserLoading, userError } = useFirebase();
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const login = useCallback(async () => {
    if (!auth || !firestore) return;
    
    setIsLoggingIn(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userDocRef = doc(firestore, 'users', result.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const isAdm = result.user.email === "marciomedrado@gmail.com";
        await setDoc(userDocRef, {
          uid: result.user.uid,
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
          role: isAdm ? 'admin' : 'free',
          createdAt: serverTimestamp(),
        });
      }
      router.push('/');
    } catch (error) {
      console.error('Error during sign-in:', error);
      if ((error as {code?:string}).code !== 'auth/popup-closed-by-user') {
        // Handle other errors if necessary
      }
    } finally {
      setIsLoggingIn(false);
    }
  }, [auth, firestore, router]);

  const logout = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/login');
  }, [auth, router]);

  const loading = isUserLoading || isLoggingIn;

  return { user, login, logout, loading, error: userError, isLoggingIn };
}


'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export function useAuth() {
  const { auth, firestore, user, isUserLoading, userError } = useFirebase();
  const router = useRouter();

  const login = useCallback(async () => {
    if (!auth || !firestore) return;
    
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
      // O redirecionamento será tratado pelo useEffect na página de login
    } catch (error) {
      console.error('Error during sign-in:', error);
      // Evita o redirecionamento se o usuário fechar o pop-up
      if ((error as {code?:string}).code !== 'auth/popup-closed-by-user') {
        // Lidar com outros erros aqui se necessário
      }
    }
  }, [auth, firestore]);

  const logout = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
    // Após o logout, sempre redireciona para a página de login.
    router.push('/login');
  }, [auth, router]);

  return { user, login, logout, loading: isUserLoading, error: userError };
}

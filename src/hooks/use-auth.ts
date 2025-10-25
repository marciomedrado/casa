import { useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export function useAuth() {
  const { auth, firestore, user, isUserLoading, userError } = useFirebase();
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // 1. Função para iniciar o login por redirecionamento
  const login = useCallback(async () => {
    if (!auth) return;
    
    setIsLoggingIn(true);
    try {
      const provider = new GoogleAuthProvider();
      // Inicia o processo de redirecionamento. O código para aqui.
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error('Error during sign-in redirect:', error);
      setIsLoggingIn(false); // Se falhar antes do redirecionamento, desativa o loading
    }
  }, [auth]);

  // 2. useEffect para tratar o resultado do redirecionamento
  useEffect(() => {
    // Só executa se o auth e firestore estiverem disponíveis e o estado inicial do usuário tiver sido carregado
    if (!auth || !firestore || isUserLoading) return;

    const handleRedirectResult = async () => {
      // Verifica se o usuário já está logado (caso tenha vindo de um login bem-sucedido)
      if (user) {
        setIsLoggingIn(false);
        return;
      }
      
      try {
        // Tenta obter o resultado do login após o redirecionamento
        const result = await getRedirectResult(auth);
        
        if (result && result.user) {
          // Se o login for bem-sucedido, processa o usuário
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
          // Redireciona para a página inicial após o processamento
          router.push('/');
        }
      } catch (error) {
        console.error('Error processing redirect result:', error);
      } finally {
        setIsLoggingIn(false); 
      }
    };
    
    handleRedirectResult();
  }, [auth, firestore, isUserLoading, router, user]);

  const logout = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/login');
  }, [auth, router]);

  const loading = isUserLoading || isLoggingIn;

  return { user, login, logout, loading, error: userError, isLoggingIn };
}

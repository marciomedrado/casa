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
    // isUserLoading é importante para garantir que o listener onAuthStateChanged já rodou
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
          // O onAuthStateChanged do provider.tsx deve pegar o usuário e redirecionar,
          // mas forçamos o redirecionamento para garantir a navegação.
          router.push('/');
        }
      } catch (error) {
        console.error('Error processing redirect result:', error);
        // O erro auth/popup-closed-by-user não deve ocorrer aqui, mas outros erros de auth podem.
      } finally {
        // O isLoggingIn é resetado aqui para cobrir o caso de um erro no getRedirectResult
        // ou quando o resultado é nulo (usuário não logou).
        setIsLoggingIn(false); 
      }
    };
    
    handleRedirectResult();
  }, [auth, firestore, isUserLoading, router, user]); // Adicionei 'user' às dependências para melhor controle

  const logout = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/login');
  }, [auth, router]);

  const loading = isUserLoading || isLoggingIn;

  return { user, login, logout, loading, error: userError, isLoggingIn };
}
```<ctrl95><ctrl42>call:default_api:file{action:
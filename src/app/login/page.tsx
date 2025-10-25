'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Home } from 'lucide-react';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.565-3.118-11.283-7.561l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.02,35.636,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);


export default function LoginPage() {
    const { user, login, loading } = useAuth();
    const router = useRouter();

    // This useEffect was causing the premature redirect. It has been removed.
    // useEffect(() => {
    //     if (!loading && user) {
    //         router.push('/');
    //     }
    // }, [user, loading, router]);
    
    const handleLogin = async () => {
        const success = await login();
        if (success) {
            router.push('/');
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
             <div className="flex items-center gap-3 mb-8">
                <div className="rounded-lg bg-primary p-3">
                    <Home className="h-8 w-8 text-primary-foreground" />
                </div>
                <h1 className="text-4xl font-bold">Casa Organizzata</h1>
             </div>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Bem-vindo!</CardTitle>
                    <CardDescription>Faça login para organizar sua casa.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleLogin} disabled={loading} className="w-full">
                        {loading ? 'Carregando...' : (
                            <>
                                <GoogleIcon className="mr-2"/>
                                Fazer login com o Google
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

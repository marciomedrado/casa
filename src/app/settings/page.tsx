
'use client';

import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, loading, isLoggingIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isLoggingIn && !user) {
      router.push('/login');
    }
  }, [user, loading, isLoggingIn, router]);

  if (loading || !user) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-1 container mx-auto p-4 md:p-8">
                 <div className="max-w-2xl mx-auto">
                    <Skeleton className="h-10 w-48 mb-8" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </main>
        </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight mb-8">Configurações</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Aparência</CardTitle>
                    <CardDescription>
                        Personalize a aparência do aplicativo.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Tema</span>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant={theme === 'light' ? 'default' : 'outline'}
                                onClick={() => setTheme('light')}
                            >
                                <Sun className="mr-2 h-4 w-4" />
                                Claro
                            </Button>
                             <Button 
                                variant={theme === 'dark' ? 'default' : 'outline'}
                                onClick={() => setTheme('dark')}
                            >
                                <Moon className="mr-2 h-4 w-4" />
                                Escuro
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}

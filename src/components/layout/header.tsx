
'use client';

import Link from 'next/link';
import { Home, Search, Upload, Download, Settings, LogOut, ShieldCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '../ui/skeleton';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';


export function Header({ 
  showSidebarTrigger = false,
  searchQuery,
  setSearchQuery,
}: { 
  showSidebarTrigger?: boolean,
  searchQuery?: string,
  setSearchQuery?: (query: string) => void,
}) {
  const { toast } = useToast();
  const { user, logout, loading } = useAuth();
  const { firestore } = useFirebase();
  const restoreRef = useRef<HTMLInputElement>(null);

  const userProfileRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const handleBackup = () => {
    toast({
        title: "Funcionalidade em breve",
        description: "A exportação de dados estará disponível em futuras versões."
    });
  }

  const handleRestoreClick = () => {
     toast({
        title: "Funcionalidade em breve",
        description: "A importação de dados estará disponível em futuras versões."
    });
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-2">
        {showSidebarTrigger && <SidebarTrigger className="md:hidden" />}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold"
        >
          <div className="rounded-lg bg-primary p-2">
            <Home className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-bold hidden sm:inline-block">Casa Organizzata</span>
        </Link>
      </div>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar itens ou cômodos..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              value={searchQuery ?? ''}
              onChange={(e) => setSearchQuery?.(e.target.value)}
              disabled={!setSearchQuery}
            />
          </div>
        </form>
        {loading ? (
            <Skeleton className="h-8 w-8 rounded-full" />
        ) : user ? (
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                    <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.displayName || user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userProfile?.role === 'admin' && (
                    <Link href="/admin" passHref>
                        <DropdownMenuItem>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            <span>Admin</span>
                        </DropdownMenuItem>
                    </Link>
                )}
                <Link href="/settings" passHref>
                <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={handleBackup} disabled>
                <Download className="mr-2 h-4 w-4" />
                <span>Fazer Backup</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleRestoreClick} disabled>
                    <Upload className="mr-2 h-4 w-4" />
                    <span>Restaurar Backup</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        ) : null}
        <input 
          type="file" 
          ref={restoreRef}
          accept=".json"
          className="hidden" 
        />
      </div>
    </header>
  );
}

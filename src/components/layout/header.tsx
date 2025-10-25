
'use client';

import Link from 'next/link';
import { Home, Search, Upload, Download } from 'lucide-react';
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
import { MOCK_USER } from '@/lib/data';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getProperties, getLocations, getItems, restoreFromBackup } from '@/lib/storage';

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
  const restoreRef = useRef<HTMLInputElement>(null);

  const handleBackup = () => {
    const backupData = {
      properties: getProperties(),
      locations: getLocations(),
      items: getItems(),
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "casa-organizzata-backup.json");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
        title: "Backup Concluído",
        description: "Seus dados foram exportados para um arquivo JSON."
    });
  }

  const handleRestoreClick = () => {
    restoreRef.current?.click();
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const content = e.target?.result as string;
            restoreFromBackup(content);

            toast({
                title: "Restauração Concluída",
                description: "Seus dados foram importados com sucesso. A página será atualizada.",
            });

            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (error) {
             console.error("Error processing backup file:", error);
            toast({
                title: "Erro na Restauração",
                description: "O arquivo de backup é inválido ou está corrompido.",
                variant: "destructive"
            });
        }
    };
    reader.onerror = () => {
        console.error("Error reading file:", reader.error);
        toast({
            title: "Erro na Restauração",
            description: "Não foi possível ler o arquivo de backup.",
            variant: "destructive"
        });
    };
    reader.readAsText(file);
    
    // Reset file input
    if(restoreRef.current) restoreRef.current.value = "";
  };


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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={MOCK_USER.avatar} alt={MOCK_USER.name} />
                <AvatarFallback>{MOCK_USER.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{MOCK_USER.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Configurações</DropdownMenuItem>
            <DropdownMenuItem onClick={handleBackup}>
              <Download className="mr-2 h-4 w-4" />
              <span>Fazer Backup</span>
            </DropdownMenuItem>
             <DropdownMenuItem onClick={handleRestoreClick}>
                <Upload className="mr-2 h-4 w-4" />
                <span>Restaurar Backup</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <input 
          type="file" 
          ref={restoreRef}
          accept=".json"
          onChange={handleFileChange}
          className="hidden" 
        />
      </div>
    </header>
  );
}

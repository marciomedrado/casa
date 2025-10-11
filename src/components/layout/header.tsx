
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
import { MOCK_USER, MOCK_PROPERTIES, MOCK_LOCATIONS, MOCK_ITEMS } from '@/lib/data';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export function Header({ showSidebarTrigger = false }: { showSidebarTrigger?: boolean }) {
  const { toast } = useToast();
  const restoreRef = useRef<HTMLInputElement>(null);

  const convertToCSV = (data: any[], columns: string[]) => {
    const header = columns.join(',');
    const rows = data.map(item => 
        columns.map(col => {
            let val = item[col];
            if (val === null || val === undefined) return '';
            if (Array.isArray(val)) {
                return `"${val.join(';')}"`;
            }
            return `"${String(val).replace(/"/g, '""')}"`;
        }).join(',')
    );
    return [header, ...rows].join('\n');
  }

  const handleBackup = () => {
    const downloadCSV = (filename: string, content: string) => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    const propertiesCSV = convertToCSV(MOCK_PROPERTIES, ['id', 'name', 'address', 'imageUrl', 'imageHint']);
    const locationsCSV = convertToCSV(MOCK_LOCATIONS.flatMap(l => {
      const {children, ...rest} = l;
      const flatChildren = l.children.map(c => ({...c, children: undefined}));
      return [rest, ...flatChildren];
    }), ['id', 'name', 'propertyId', 'parentId', 'type', 'icon']);
    const itemsCSV = convertToCSV(MOCK_ITEMS, ['id', 'name', 'description', 'quantity', 'tags', 'imageUrl', 'imageHint', 'locationId', 'parentId', 'isContainer', 'propertyId', 'locationPath']);

    downloadCSV('properties.csv', propertiesCSV);
    downloadCSV('locations.csv', locationsCSV);
    downloadCSV('items.csv', itemsCSV);

    toast({
        title: "Backup Concluído",
        description: "Seus dados foram exportados para arquivos CSV."
    });
  }

  const handleRestoreClick = () => {
    restoreRef.current?.click();
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
        // For now, we just log the content. In a real app, you'd parse this
        // and update your application state.
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                console.log(`Restoring ${file.name}:`);
                console.log(e.target?.result);
            };
            reader.readAsText(file);
        });

        toast({
            title: "Restauração Iniciada",
            description: "Verifique o console para ver os dados restaurados.",
        });
    }
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
              placeholder="Buscar itens ou locais..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
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
          multiple
          accept=".csv"
          onChange={handleFileChange}
          className="hidden" 
        />
      </div>
    </header>
  );
}

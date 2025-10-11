
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from '@/components/ui/sidebar';
import type { Location } from '@/lib/types';
import { Header } from './header';
import { LocationTree } from '../inventory/location-tree';
import { PlusCircle, LayoutGrid } from 'lucide-react';
import { AddLocationDialog } from '../inventory/add-location-dialog';

export function AppLayout({
  children,
  pageTitle,
  locations,
  allRawLocations,
  propertyId,
  selectedLocationId,
  onLocationSelect,
  onLocationSave,
}: {
  children: React.ReactNode;
  pageTitle: string;
  locations: Location[];
  allRawLocations: Location[];
  propertyId: string;
  selectedLocationId: string | null;
  onLocationSelect: (id: string | null) => void;
  onLocationSave: (location: Omit<Location, 'children' | 'propertyId'> & { id?: string }) => void;
}) {
  return (
    <SidebarProvider>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader>
          <h2 className="text-lg font-semibold truncate group-data-[collapsible=icon]:hidden">{pageTitle}</h2>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => onLocationSelect(null)} isActive={selectedLocationId === null} tooltip="Todos os Itens">
                  <LayoutGrid />
                  <span>Todos os Itens</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Locais</SidebarGroupLabel>
             <AddLocationDialog locations={allRawLocations} propertyId={propertyId} onLocationSave={onLocationSave}>
                <SidebarGroupAction>
                    <PlusCircle />
                </SidebarGroupAction>
            </AddLocationDialog>
            <LocationTree 
              locations={locations} 
              propertyId={propertyId} 
              allRawLocations={allRawLocations}
              activeLocation={selectedLocationId}
              setActiveLocation={onLocationSelect}
              onLocationSave={onLocationSave}
            />
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="min-h-screen flex flex-col">
        <Header showSidebarTrigger />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-4 md:p-8">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

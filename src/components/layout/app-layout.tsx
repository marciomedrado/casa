
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
import { PlusCircle, LayoutGrid, List, Package } from 'lucide-react';
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
  searchQuery,
  setSearchQuery,
  viewMode,
}: {
  children: React.ReactNode;
  pageTitle: string;
  locations: Location[];
  allRawLocations: Location[];
  propertyId: string;
  selectedLocationId: string | null;
  onLocationSelect: (id: string | null, mode?: 'items' | 'all-locations' | 'all-containers') => void;
  onLocationSave: (location: Omit<Location, 'children' | 'propertyId'> & { id?: string }) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: 'items' | 'all-locations' | 'all-containers';
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
                <SidebarMenuButton onClick={() => onLocationSelect(null, 'all-locations')} isActive={viewMode === 'all-locations' && selectedLocationId === null} tooltip="Todos os Cômodos">
                  <LayoutGrid />
                  <span>Todos os Cômodos</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => onLocationSelect(null, 'all-containers')} isActive={viewMode === 'all-containers' && selectedLocationId === null} tooltip="Todos os Containers">
                  <Package />
                  <span>Todos os containers</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => onLocationSelect(null, 'items')} isActive={viewMode === 'items' && selectedLocationId === null} tooltip="Todos os Itens">
                  <List />
                  <span>Todos os Itens</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Cômodos</SidebarGroupLabel>
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
        <Header 
          showSidebarTrigger 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-4 md:p-8">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

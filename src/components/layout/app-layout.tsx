'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import type { Location } from '@/lib/types';
import { Header } from './header';
import { LocationTree } from '../inventory/location-tree';

export function AppLayout({
  children,
  pageTitle,
  locations,
  propertyId
}: {
  children: React.ReactNode;
  pageTitle: string;
  locations: Location[];
  propertyId: string;
}) {
  return (
    <SidebarProvider>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader>
          <h2 className="text-lg font-semibold truncate group-data-[collapsible=icon]:hidden">{pageTitle}</h2>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Locais</SidebarGroupLabel>
            <LocationTree locations={locations} propertyId={propertyId} />
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

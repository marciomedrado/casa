

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import type { Item, Location } from '@/lib/types';
import { ItemList } from './item-list';
import { AddItemDialog } from './add-item-dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, Home, DoorOpen, Rows3, PackageOpen } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Separator } from '../ui/separator';

export function ItemBrowser({ 
  allItems, 
  visibleItems,
  allLocations,
  onItemSave,
  onItemDelete,
  onItemClone,
  locationName,
}: { 
  allItems: Item[],
  visibleItems: Item[],
  allLocations: Location[],
  onItemSave: (item: Omit<Item, 'id' | 'ownerId' | 'propertyId'> & { id?: string }) => void,
  onItemDelete: (itemId: string) => void,
  onItemClone: (item: Item) => void,
  locationName: string,
}) {
  const [currentContainerId, setCurrentContainerId] = useState<string | null>(null);
  
  const itemMap = useMemo(() => new Map(allItems.map(item => [item.id, item])), [allItems]);
  
  const currentContainer = useMemo(() => {
    if (!currentContainerId) return null;
    return itemMap.get(currentContainerId) ?? null;
  }, [currentContainerId, itemMap]);

  const { looseItems, drawerItems, doorItems } = useMemo(() => {
    const itemsToProcess = currentContainerId 
      ? allItems.filter(item => item.parentId === currentContainerId)
      : visibleItems;
    
    const looseItems: Item[] = [];
    const drawerItems: { [key: number]: Item[] } = {};
    const doorItems: { [key: number]: Item[] } = {};

    itemsToProcess.forEach(item => {
      // This check is important: only process items that are direct children of the current container.
      if (currentContainerId && item.parentId !== currentContainerId) {
          return;
      }
      
      if (item.subContainer?.type === 'drawer') {
        if (!drawerItems[item.subContainer.number]) {
          drawerItems[item.subContainer.number] = [];
        }
        drawerItems[item.subContainer.number].push(item);
      } else if (item.subContainer?.type === 'door') {
         if (!doorItems[Number(item.subContainer.number)]) {
          doorItems[Number(item.subContainer.number)] = [];
        }
        doorItems[Number(item.subContainer.number)].push(item);
      } else if (!currentContainerId || item.parentId === currentContainerId) {
        // Only add to loose items if it's in the root view OR a direct child of the container
        looseItems.push(item);
      }
    });

    return { looseItems, drawerItems, doorItems };
  }, [allItems, visibleItems, currentContainerId]);


  const handleContainerClick = (itemId: string) => {
    setCurrentContainerId(itemId);
  };

  const handleBreadcrumbClick = (itemId: string | null) => {
    if (itemId === currentContainerId) return;
    setCurrentContainerId(itemId);
  };
  
  const breadcrumbItems = useMemo(() => {
    let path: { id: string | null; name: string }[] = [{ id: null, name: locationName }];
    let currentId = currentContainerId;
    
    const pathItems: Item[] = [];
    while (currentId) {
        const item = itemMap.get(currentId);
        if (item) {
            pathItems.unshift(item);
            currentId = item.parentId ?? null;
        } else {
            currentId = null; // Should not happen with valid data
        }
    }

    pathItems.forEach(item => {
        path.push({ id: item.id, name: item.name });
    });

    return path;
  }, [currentContainerId, itemMap, locationName]);


  const renderSubContainer = (
    title: string, 
    icon: React.ReactNode,
    items: Item[]
  ) => (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <ItemList items={items} onContainerClick={handleContainerClick} parentContainer={currentContainer} onItemSave={onItemSave} onItemDelete={onItemDelete} onItemClone={onItemClone} locations={allLocations} allItems={allItems} />
    </div>
  );
  
  const currentTitle = breadcrumbItems[breadcrumbItems.length - 1].name;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{currentTitle}</h2>
          <Breadcrumb className="text-sm text-muted-foreground mt-1">
            <BreadcrumbList>
              {breadcrumbItems.slice(0, -1).map((item, index) => (
                <React.Fragment key={item.id ?? 'root'}>
                  <BreadcrumbItem>
                      <BreadcrumbLink
                        onClick={() => handleBreadcrumbClick(item.id)}
                        className="cursor-pointer"
                      >
                        {index === 0 && <Home className="h-4 w-4 inline-block mr-1" />}
                        {item.name}
                      </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </React.Fragment>
              ))}
              {breadcrumbItems.length > 1 && (
                  <BreadcrumbItem>
                      <BreadcrumbPage>
                        <div className="flex items-center gap-1">
                            <PackageOpen className="h-4 w-4" /> 
                            {currentTitle}
                        </div>
                      </BreadcrumbPage>
                  </BreadcrumbItem>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <AddItemDialog parentContainer={currentContainer} locations={allLocations} onItemSave={onItemSave} allItems={allItems}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Item
          </Button>
        </AddItemDialog>
      </div>

      <div className="mt-8">
        {currentContainer ? (
          <>
            {Object.keys(doorItems).sort((a,b) => parseInt(a) - parseInt(b)).map(doorNumber => 
              <div key={`door-${doorNumber}`}>
              {renderSubContainer(
                `Porta ${doorNumber}`, 
                <DoorOpen className="h-5 w-5 text-muted-foreground" />,
                doorItems[Number(doorNumber)]
              )}
              </div>
            )}
            {Object.keys(drawerItems).sort((a,b) => parseInt(a) - parseInt(b)).map(drawerNumber => 
              <div key={`drawer-${drawerNumber}`}>
              {renderSubContainer(
                `Gaveta ${drawerNumber}`,
                <Rows3 className="h-5 w-5 text-muted-foreground" />,
                drawerItems[Number(drawerNumber)]
              )}
              </div>
            )}
             {looseItems.length > 0 && (Object.keys(doorItems).length > 0 || Object.keys(drawerItems).length > 0) && (
              <>
                <Separator className="my-8" />
                <h3 className="text-lg font-semibold mb-4">Itens Soltos</h3>
              </>
            )}
            {looseItems.length > 0 && (
              <ItemList items={looseItems} onContainerClick={handleContainerClick} parentContainer={currentContainer} onItemSave={onItemSave} onItemDelete={onItemDelete} onItemClone={onItemClone} locations={allLocations} allItems={allItems} />
            )}
            {
              Object.keys(doorItems).length === 0 &&
              Object.keys(drawerItems).length === 0 &&
              looseItems.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 text-center p-12 min-h-[400px]">
                    <h3 className="text-xl font-semibold">Container Vazio</h3>
                    <p className="text-muted-foreground mt-2 mb-4">Adicione itens a este container.</p>
                    <AddItemDialog parentContainer={currentContainer} locations={allLocations} onItemSave={onItemSave} allItems={allItems}>
                      <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar Item
                      </Button>
                    </AddItemDialog>
                </div>
              )
            }
          </>
        ) : (
          // Root view
          <ItemList items={visibleItems} onContainerClick={handleContainerClick} onItemSave={onItemSave} onItemDelete={onItemDelete} onItemClone={onItemClone} locations={allLocations} allItems={allItems} />
        )}
      </div>
    </div>
  );
}

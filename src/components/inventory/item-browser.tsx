

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import type { Item, Location } from '@/lib/types';
import { ItemList } from './item-list';
import { AddItemDialog } from './add-item-dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, Home, DoorOpen, Rows3 } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Separator } from '../ui/separator';

export function ItemBrowser({ 
  allItems, 
  visibleItems,
  allLocations,
  onItemSave, // Receive the save handler
}: { 
  allItems: Item[],
  visibleItems: Item[],
  allLocations: Location[],
  onItemSave: (item: Item) => void, // Define the prop type
}) {
  const [currentContainerId, setCurrentContainerId] = useState<string | null>(null);
  
  const itemMap = useMemo(() => new Map(allItems.map(item => [item.id, item])), [allItems]);
  
  const currentContainer = useMemo(() => {
    if (!currentContainerId) return null;
    return itemMap.get(currentContainerId) ?? null;
  }, [currentContainerId, itemMap]);

  const { looseItems, drawerItems, doorItems } = useMemo(() => {
    // Determine which items to display: items in the current container OR the globally filtered visibleItems
    const itemsToProcess = currentContainerId 
      ? allItems.filter(item => item.parentId === currentContainerId)
      : visibleItems;
    
    const looseItems: Item[] = [];
    const drawerItems: { [key: number]: Item[] } = {};
    const doorItems: { [key: number]: Item[] } = {};

    itemsToProcess.forEach(item => {
      if (item.subContainer?.type === 'drawer') {
        if (!drawerItems[item.subContainer.number]) {
          drawerItems[item.subContainer.number] = [];
        }
        drawerItems[item.subContainer.number].push(item);
      } else if (item.subContainer?.type === 'door') {
         if (!doorItems[item.subContainer.number]) {
          doorItems[item.subContainer.number] = [];
        }
        doorItems[item.subContainer.number].push(item);
      } else {
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
    // When no location filter is active, show a simpler breadcrumb.
    if (visibleItems.length === allItems.length && !currentContainerId) {
        return [{ id: null, name: 'Todos os Itens' }];
    }

    const path: { id: string | null; name: string }[] = [{ id: null, name: 'Itens Filtrados' }];
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
  }, [currentContainerId, itemMap, visibleItems.length, allItems.length]);


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
      <ItemList items={items} onContainerClick={handleContainerClick} parentContainer={currentContainer} onItemSave={onItemSave} locations={allLocations} />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={item.id ?? 'root'}>
                <BreadcrumbItem>
                  {index < breadcrumbItems.length - 1 ? (
                    <BreadcrumbLink
                      onClick={() => handleBreadcrumbClick(item.id)}
                      className="cursor-pointer"
                    >
                      {index === 0 && <Home className="h-4 w-4 inline-block mr-2" />}
                      {item.name}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.name}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <AddItemDialog parentContainer={currentContainer} locations={allLocations} onItemSave={onItemSave}>
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
             {looseItems.length > 0 && (
              <>
                <Separator className="my-8" />
                <h3 className="text-lg font-semibold mb-4">Itens Soltos</h3>
                <ItemList items={looseItems} onContainerClick={handleContainerClick} parentContainer={currentContainer} onItemSave={onItemSave} locations={allLocations} />
              </>
            )}
            {
              Object.keys(doorItems).length === 0 &&
              Object.keys(drawerItems).length === 0 &&
              looseItems.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 text-center p-12 min-h-[400px]">
                    <h3 className="text-xl font-semibold">Container Vazio</h3>
                    <p className="text-muted-foreground mt-2 mb-4">Adicione itens a este container.</p>
                    <AddItemDialog parentContainer={currentContainer} locations={allLocations} onItemSave={onItemSave}>
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
          <ItemList items={looseItems} onContainerClick={handleContainerClick} onItemSave={onItemSave} locations={allLocations} />
        )}
      </div>
    </div>
  );
}

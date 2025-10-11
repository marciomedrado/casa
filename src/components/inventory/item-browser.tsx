
'use client';

import React, { useState, useMemo } from 'react';
import type { Item } from '@/lib/types';
import { ItemList } from './item-list';
import { AddItemDialog } from './add-item-dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, Home } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';

export function ItemBrowser({ allItems }: { allItems: Item[] }) {
  const [currentContainerId, setCurrentContainerId] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  
  const itemMap = useMemo(() => new Map(allItems.map(item => [item.id, item])), [allItems]);
  
  const currentItems = useMemo(() => {
    return allItems.filter(item => item.parentId === currentContainerId);
  }, [allItems, currentContainerId]);

  const handleContainerClick = (itemId: string) => {
    setHistory([...history, currentContainerId ?? 'root']);
    setCurrentContainerId(itemId);
  };

  const handleBreadcrumbClick = (itemId: string | null, index: number) => {
    if (itemId === currentContainerId) return;
    
    setCurrentContainerId(itemId);
    setHistory(history.slice(0, index));
  };
  
  const breadcrumbItems = useMemo(() => {
    const path: { id: string | null; name: string }[] = [{ id: null, name: 'Todos os Itens' }];
    let currentId = currentContainerId;
    
    const pathIds = [];
    while (currentId) {
        pathIds.unshift(currentId);
        const item = itemMap.get(currentId);
        currentId = item?.parentId ?? null;
    }

    pathIds.forEach(id => {
        const item = itemMap.get(id);
        if (item) {
            path.push({ id: item.id, name: item.name });
        }
    });

    return path;
  }, [currentContainerId, itemMap]);


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
                      onClick={() => handleBreadcrumbClick(item.id, index)}
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

        <AddItemDialog>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Item
          </Button>
        </AddItemDialog>
      </div>

      <div className="mt-8">
        <ItemList items={currentItems} onContainerClick={handleContainerClick} />
      </div>
    </div>
  );
}

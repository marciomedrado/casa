

import { ItemCard } from './item-card';
import type { Item, Location } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { AddItemDialog } from './add-item-dialog';

export function ItemList({ items, onContainerClick, parentContainer, onItemSave, onItemDelete, onItemClone, locations, allItems }: { items: Item[], onContainerClick: (itemId: string) => void; parentContainer?: Item | null, onItemSave: (item: Item) => void, onItemDelete: (itemId: string) => void, onItemClone: (item: Item) => void, locations: Location[], allItems: Item[] }) {
  return (
    <div>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 text-center p-12 min-h-[200px]">
          <h3 className="text-xl font-semibold">Nenhum item encontrado</h3>
          <p className="text-muted-foreground mt-2 mb-4">Comece a organizar adicionando seu primeiro item aqui.</p>
          <AddItemDialog parentContainer={parentContainer} locations={locations} onItemSave={onItemSave} allItems={allItems}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Item
            </Button>
          </AddItemDialog>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} onContainerClick={onContainerClick} parentContainer={parentContainer} onItemSave={onItemSave} onItemDelete={onItemDelete} onItemClone={onItemClone} locations={locations} allItems={allItems} />
          ))}
        </div>
      )}
    </div>
  );
}

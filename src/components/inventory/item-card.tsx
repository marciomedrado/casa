
'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Item } from '@/lib/types';
import { MapPin, Pencil, PackageOpen } from 'lucide-react';
import { AddItemDialog } from './add-item-dialog';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function ItemCard({ item, onContainerClick }: { item: Item, onContainerClick: (itemId: string) => void }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Stop propagation if the click is on the edit button itself.
    if ((e.target as HTMLElement).closest('[data-edit-button]')) {
      return;
    }
    
    if (item.isContainer) {
      onContainerClick(item.id);
    } else {
      setIsEditDialogOpen(true);
    }
  }

  return (
    <AddItemDialog itemToEdit={item} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <Card 
        onClick={handleCardClick}
        className={cn(
          "flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 duration-300 ease-in-out group cursor-pointer"
        )}
      >
        <CardHeader className="p-0">
          <div className="relative aspect-[4/3] w-full">
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover"
              data-ai-hint={item.imageHint}
            />
            {/* The AddItemDialog Trigger is now the Card itself, but we need a visible button */}
            <Button
                data-edit-button
                variant="secondary"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card's onClick
                  setIsEditDialogOpen(true);
                }}
                className="absolute top-2 right-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Editar Item</span>
              </Button>

            {item.isContainer && (
              <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
                <PackageOpen className="h-3 w-3" />
                <span>Container</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-1">
          <CardTitle className="text-lg mb-1 line-clamp-1">{item.name}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground mb-2">
              <MapPin className="h-4 w-4 mr-2 shrink-0" />
              <span className="truncate">{item.locationPath.join(' / ')}</span>
          </div>
          <CardDescription className="text-sm line-clamp-2">{item.description}</CardDescription>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
          {item.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
           <Badge variant="outline">Qtd: {item.quantity}</Badge>
        </CardFooter>
      </Card>
    </AddItemDialog>
  );
}

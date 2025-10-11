

'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Item, Location } from '@/lib/types';
import { MapPin, Pencil, PackageOpen, Eye, DoorOpen, Rows3 } from 'lucide-react';
import { AddItemDialog } from './add-item-dialog';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function ItemCard({ item, onContainerClick, parentContainer, onItemSave, locations }: { item: Item, onContainerClick: (itemId: string) => void, parentContainer?: Item | null, onItemSave?: (item: Item) => void, locations: Location[] }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Stop propagation if the click is on any button inside the card.
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    
    if (item.isContainer) {
      onContainerClick(item.id);
    } else {
      setIsViewDialogOpen(true);
    }
  }
  
  const subContainerText = () => {
    if (!item.subContainer) return null;
    const Icon = item.subContainer.type === 'door' ? DoorOpen : Rows3;
    const pathSegments = item.locationPath;
    const subContainerName = pathSegments[pathSegments.length-1];

    if (!subContainerName.toLowerCase().includes(item.subContainer.type)) return null;

    return (
        <div className="flex items-center text-xs text-muted-foreground mt-1">
            <Icon className="h-3 w-3 mr-1.5" />
            <span>{subContainerName}</span>
        </div>
    );
  }

  return (
    <>
      {/* View Dialog (read-only) */}
      <AddItemDialog 
        itemToEdit={item}
        parentContainer={parentContainer} 
        open={isViewDialogOpen} 
        onOpenChange={setIsViewDialogOpen}
        isReadOnly={true}
        onItemSave={onItemSave}
        locations={locations}
      />
      
      {/* Edit Dialog */}
      <AddItemDialog 
        itemToEdit={item}
        parentContainer={parentContainer}
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen}
        isReadOnly={false}
        onItemSave={onItemSave}
        locations={locations}
      >
        <Card 
          onClick={handleCardClick}
          className={cn(
            "flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 duration-300 ease-in-out group",
            item.isContainer ? "cursor-pointer" : "cursor-default"
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
              <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {!item.isContainer && (
                   <Button
                      variant="secondary"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsViewDialogOpen(true);
                      }}
                      className="rounded-full"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Visualizar Item</span>
                    </Button>
                )}
                <Button
                    data-edit-button
                    variant="secondary"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditDialogOpen(true);
                    }}
                    className="rounded-full"
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Editar Item</span>
                  </Button>
              </div>

              {item.isContainer && (
                <div 
                  onClick={(e) => { e.stopPropagation(); onContainerClick(item.id); }}
                  className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white cursor-pointer"
                >
                  <PackageOpen className="h-3 w-3" />
                  <span>Container</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-1">
            <CardTitle className="text-lg mb-1 line-clamp-1">{item.name}</CardTitle>
            <div className="flex items-center text-sm text-muted-foreground mb-1">
                <MapPin className="h-4 w-4 mr-2 shrink-0" />
                <span className="truncate">{item.locationPath.slice(0, -1).join(' / ')}</span>
            </div>
            {subContainerText()}
            <CardDescription className="text-sm line-clamp-2 mt-2">{item.description}</CardDescription>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
            {item.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
            <Badge variant="outline">Qtd: {item.quantity}</Badge>
          </CardFooter>
        </Card>
      </AddItemDialog>
    </>
  );
}

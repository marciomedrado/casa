

'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Item, Location } from '@/lib/types';
import { MapPin, Pencil, PackageOpen, Eye, Trash2, Copy } from 'lucide-react';
import { AddItemDialog } from './add-item-dialog';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function ItemCard({ item, onContainerClick, onItemSave, onItemDelete, onItemClone, locations, allItems }: { item: Item, onContainerClick: (itemId: string) => void, parentContainer?: Item | null, onItemSave: (item: Item) => void, onItemDelete: (itemId: string) => void, onItemClone: (item: Item) => void, locations: Location[], allItems: Item[] }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const parentContainer = allItems.find(i => i.id === item.parentId) ?? null;

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
        allItems={allItems}
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
        allItems={allItems}
      />

      <Card 
        onClick={handleCardClick}
        className={cn(
          "flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 duration-300 ease-in-out group",
          item.isContainer ? "cursor-pointer" : "cursor-default"
        )}
      >
        <CardHeader className="p-0 relative">
          <div 
            onClick={item.isContainer ? undefined : () => setIsViewDialogOpen(true)}
            className={cn("relative h-40 w-full", !item.isContainer && "cursor-pointer")}
          >
             <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform"
              data-ai-hint={item.imageHint}
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors" />
          </div>

          <div className="absolute top-2 right-2 flex gap-1">
             {!item.isContainer && (
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsViewDialogOpen(true);
                  }}
                  className="rounded-full h-8 w-8 bg-black/50 text-white hover:bg-black/70"
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
                  className="rounded-full h-8 w-8 bg-black/50 text-white hover:bg-black/70"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Editar Item</span>
                </Button>
              <Button
                  variant="secondary"
                  size="icon"
                  onClick={(e) => {
                      e.stopPropagation();
                      onItemClone(item);
                  }}
                  className="rounded-full h-8 w-8 bg-black/50 text-white hover:bg-black/70"
              >
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Clonar Item</span>
              </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-full h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Excluir Item</span>
                      </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Isso excluirá permanentemente o item
                              <span className="font-semibold"> {item.name}</span>.
                              {item.isContainer && " Todos os itens dentro dele também serão excluídos."}
                          </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                          <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={(e) => { e.stopPropagation(); onItemDelete(item.id);}} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
          </div>

          {item.isContainer && (
            <div 
              onClick={(e) => { e.stopPropagation(); onContainerClick(item.id); }}
              className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-black/50 px-2 py-1 text-xs text-white cursor-pointer w-fit"
            >
              <PackageOpen className="h-3 w-3" />
              <span>Container</span>
            </div>
          )}

        </CardHeader>
        <CardContent className="p-4 pt-4 flex-1">
          <CardTitle className="text-lg line-clamp-1 mb-2">{item.name}</CardTitle>
          <div className="flex items-start text-sm text-muted-foreground mb-1">
              <MapPin className="h-4 w-4 mr-2 shrink-0 mt-0.5" />
              <span className="truncate">{item.locationPath?.join(' / ') || ''}</span>
          </div>
          <CardDescription className="text-sm line-clamp-2 mt-2">{item.description}</CardDescription>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
          {item.tags?.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
          {!item.isContainer && <Badge variant="outline">Qtd: {item.quantity}</Badge>}
        </CardFooter>
      </Card>
    </>
  );
}

    
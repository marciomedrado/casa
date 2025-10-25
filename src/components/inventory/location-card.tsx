
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Location } from '@/lib/types';
import { ArrowRight, Pencil, Trash2 } from 'lucide-react';
import { Icon } from './icons';
import { cn } from '@/lib/utils';
import { AddLocationDialog } from './add-location-dialog';
import { Button } from '../ui/button';
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

interface LocationCardProps {
    location: Location, 
    allRawLocations: Location[],
    propertyId: string;
    onLocationSelect: (id: string) => void,
    onLocationSave: (location: Omit<Location, 'children' | 'propertyId'> & { id?: string }) => void;
    onLocationDelete: (id: string) => void;
}

export function LocationCard({ location, allRawLocations, propertyId, onLocationSelect, onLocationSave, onLocationDelete }: LocationCardProps) {
  
  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onLocationSelect(location.id);
  }

  const handleDelete = () => {
    onLocationDelete(location.id);
  }

  return (
    <Card 
        onClick={handleCardClick}
        className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out group flex flex-col cursor-pointer hover:shadow-lg hover:-translate-y-1"
        )}
    >
      <CardHeader className="flex-row items-start justify-between">
        <div>
            <Icon name={location.icon} className="h-8 w-8 mb-2 text-primary" />
            <CardTitle className="text-xl">{location.name}</CardTitle>
        </div>
        <div className="flex gap-2">
            <AddLocationDialog locations={allRawLocations} propertyId={propertyId} locationToEdit={location} onLocationSave={onLocationSave}>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Editar Cômodo</span>
              </Button>
            </AddLocationDialog>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Excluir Cômodo</span>
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Você só pode excluir cômodos que estejam vazios (sem itens ou outros cômodos dentro).
                            <br/><br/>
                            Tem certeza de que deseja excluir 
                            <span className="font-semibold"> {location.name}</span>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="flex-grow"></CardContent>
       <div className="p-4 pt-0 mt-auto flex items-center justify-end text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-sm font-medium">Abrir cômodo</span>
            <ArrowRight className="ml-2 h-4 w-4" />
        </div>
    </Card>
  );
}


'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Pencil, Trash2 } from 'lucide-react';
import type { Property } from '@/lib/types';
import { Button } from '../ui/button';
import { AddPropertyDialog } from './add-property-dialog';
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
import { useToast } from '@/hooks/use-toast';


interface PropertyCardProps {
  property: Property;
  onDelete: (id: string) => void;
}


export function PropertyCard({ property, onDelete }: PropertyCardProps) {
  const { toast } = useToast();

  const handleDelete = () => {
    onDelete(property.id);
  }

  return (
    <Card className="overflow-hidden transition-all duration-300 ease-in-out group flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between p-4">
        <div className="flex-grow">
            <Link href={`/properties/${property.id}`} className="flex-grow flex flex-col">
              <CardTitle className="text-xl mb-1 hover:underline">{property.name}</CardTitle>
            </Link>
            <p className="text-sm text-muted-foreground">{property.address}</p>
        </div>
        <div className="flex gap-2">
            <AddPropertyDialog propertyToEdit={property}>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Editar Imóvel</span>
              </Button>
            </AddPropertyDialog>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive rounded-full h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Excluir Imóvel</span>
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente a propriedade 
                            <span className="font-semibold"> {property.name} </span> 
                            e todos os seus locais e itens associados.
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
      <CardContent className="flex-grow p-0">
          <Link href={`/properties/${property.id}`} className="block aspect-video w-full bg-muted overflow-hidden">
             {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={property.imageUrl || `https://picsum.photos/seed/${property.id}/600/400`}
                alt={`Imagem de ${property.name}`}
                data-ai-hint={property.imageHint}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
      </CardContent>
      <Link href={`/properties/${property.id}`} className="w-full">
        <div className="p-4 pt-2 flex items-center justify-end text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-sm font-medium">Ver inventário</span>
            <ArrowRight className="ml-2 h-4 w-4" />
        </div>
      </Link>
    </Card>
  );
}

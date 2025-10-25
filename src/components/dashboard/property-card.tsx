
'use client';

import Link from 'next/link';
import Image from 'next/image';
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
  onPropertySave: (property: Omit<Property, 'id' | 'imageUrl' | 'imageHint'> & { id?: string }) => void;
}


export function PropertyCard({ property, onDelete, onPropertySave }: PropertyCardProps) {
  const { toast } = useToast();

  const handleDelete = () => {
    onDelete(property.id);
    toast({
      title: "Imóvel Excluído!",
      description: `"${property.name}" foi removido.`,
    });
  }

  return (
    <Card className="overflow-hidden transition-all duration-300 ease-in-out group flex flex-col">
      <CardHeader className="p-0 relative">
        <Link href={`/properties/${property.id}`} className="block">
          <div className="relative h-48 w-full">
            <Image
              src={property.imageUrl}
              alt={property.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              data-ai-hint={property.imageHint}
            />
             <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
          </div>
        </Link>
        <div className="absolute top-2 right-2 flex gap-2">
            <AddPropertyDialog propertyToEdit={property} onPropertySave={onPropertySave}>
              <Button variant="secondary" size="icon" className="rounded-full h-8 w-8">
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Editar Imóvel</span>
              </Button>
            </AddPropertyDialog>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" className="rounded-full h-8 w-8">
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
                        <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </CardHeader>
      <Link href={`/properties/${property.id}`} className="flex-grow flex flex-col">
        <CardContent className="p-4 bg-card flex-grow">
          <CardTitle className="text-xl mb-1">{property.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{property.address}</p>
        </CardContent>
        <div className="p-4 pt-0 mt-auto flex items-center justify-end text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-sm font-medium">Ver inventário</span>
            <ArrowRight className="ml-2 h-4 w-4" />
        </div>
      </Link>
    </Card>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Property } from '@/lib/types';

interface AddPropertyDialogProps {
  children: React.ReactNode;
  propertyToEdit?: Property;
  onPropertySave: (property: Omit<Property, 'id' | 'imageUrl' | 'imageHint'> & { id?: string }) => void;
}

export function AddPropertyDialog({ children, propertyToEdit, onPropertySave }: AddPropertyDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const { toast } = useToast();

    const isEditMode = propertyToEdit !== undefined;

    useEffect(() => {
        if (open) {
            if (isEditMode && propertyToEdit) {
                setName(propertyToEdit.name);
                setAddress(propertyToEdit.address);
            }
        } else {
            // Reset form when dialog closes
            setName('');
            setAddress('');
        }
    }, [open, isEditMode, propertyToEdit]);
    
    const handleSubmit = () => {
        if (!name || !address) {
             toast({
                variant: 'destructive',
                title: 'Erro de Validação',
                description: 'O nome e o endereço do imóvel não podem ser vazios.',
            });
            return;
        }

        onPropertySave({
            id: propertyToEdit?.id,
            name,
            address,
        });

        toast({
            title: isEditMode ? "Imóvel Atualizado!" : "Imóvel Adicionado!",
            description: `"${name}" foi ${isEditMode ? 'atualizado' : 'adicionado'}.`,
        });
        setOpen(false);
    }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar Imóvel' : 'Adicionar Novo Imóvel'}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Atualize os detalhes do seu imóvel.'
              : 'Preencha os detalhes do novo imóvel para adicioná-lo.'
            }
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Endereço
            </Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

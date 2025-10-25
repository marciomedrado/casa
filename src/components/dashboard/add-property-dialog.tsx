
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
import { useAuth } from '@/hooks/use-auth';
import { useFirebase } from '@/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface AddPropertyDialogProps {
  children: React.ReactNode;
  propertyToEdit?: Property;
}

export function AddPropertyDialog({ children, propertyToEdit }: AddPropertyDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const { toast } = useToast();
    const { user } = useAuth();
    const { firestore } = useFirebase();

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
    
    const handleSubmit = async () => {
        if (!name || !address) {
             toast({
                variant: 'destructive',
                title: 'Erro de Validação',
                description: 'O nome e o endereço do imóvel não podem ser vazios.',
            });
            return;
        }
        
        if (!user || !firestore) {
             toast({
                variant: 'destructive',
                title: 'Erro de Autenticação',
                description: 'Você precisa estar logado para realizar esta ação.',
            });
            return;
        }

        try {
          if (isEditMode && propertyToEdit) {
            const propertyRef = doc(firestore, 'properties', propertyToEdit.id);
            await updateDoc(propertyRef, {
              name,
              address,
            });
          } else {
            await addDoc(collection(firestore, 'properties'), {
              name,
              address,
              ownerId: user.uid,
              createdAt: serverTimestamp(),
              imageUrl: `https://picsum.photos/seed/${Date.now()}/600/400`,
              imageHint: 'modern house',
            });
          }

          toast({
              title: isEditMode ? "Imóvel Atualizado!" : "Imóvel Adicionado!",
              description: `"${name}" foi ${isEditMode ? 'atualizado' : 'adicionado'}.`,
          });
          setOpen(false);

        } catch (error) {
           console.error("Error saving property: ", error);
            toast({
                variant: 'destructive',
                title: 'Erro ao Salvar',
                description: 'Não foi possível salvar as informações do imóvel.',
            });
        }
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


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
import type { Location } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ICONS, Icon } from './icons';

interface AddLocationDialogProps {
  children: React.ReactNode;
  propertyId: string;
  locations: Location[];
  locationToEdit?: Location;
  onLocationSave: (location: Omit<Location, 'children' | 'propertyId'> & { id?: string }) => void;
}

export function AddLocationDialog({ children, propertyId, locations, locationToEdit, onLocationSave }: AddLocationDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [parentId, setParentId] = useState<string | null>(null);
    const [icon, setIcon] = useState('Box');
    const { toast } = useToast();

    const isEditMode = locationToEdit !== undefined;
    const availableIcons = Object.keys(ICONS);

    useEffect(() => {
        if (open) {
            if (isEditMode && locationToEdit) {
                setName(locationToEdit.name);
                setParentId(locationToEdit.parentId);
                setIcon(locationToEdit.icon);
            }
        } else if (!open) {
            // Reset form when dialog closes
            setName('');
            setParentId(null);
            setIcon('Box');
        }
    }, [open, isEditMode, locationToEdit]);
    
    const handleSubmit = () => {
        if (!name) {
             toast({
                variant: 'destructive',
                title: 'Erro de Validação',
                description: 'O nome do local não pode ser vazio.',
            });
            return;
        }

        onLocationSave({
            id: locationToEdit?.id,
            name,
            parentId,
            icon,
            type: 'other' // This can be expanded upon later
        });

        toast({
            title: isEditMode ? "Local Atualizado!" : "Local Adicionado!",
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
          <DialogTitle>{isEditMode ? 'Editar Local' : 'Adicionar Novo Local'}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Atualize os detalhes do local. Clique em salvar para aplicar as mudanças.'
              : 'Preencha os detalhes do novo local. Clique em salvar para adicioná-lo.'
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
            <Label htmlFor="parentId" className="text-right">
              Local Pai
            </Label>
            <Select onValueChange={(value) => setParentId(value === 'null' ? null : value)} value={parentId ?? 'null'}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione um local pai" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="null">Nenhum (nível raiz)</SelectItem>
                    {locations.filter(l => l.id !== locationToEdit?.id).map(loc => (
                        <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="icon" className="text-right">
              Ícone
            </Label>
            <Select onValueChange={setIcon} value={icon}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione um ícone" />
                </SelectTrigger>
                <SelectContent>
                    {availableIcons.map(iconName => (
                        <SelectItem key={iconName} value={iconName}>
                           <div className="flex items-center gap-2">
                             <Icon name={iconName} className="h-4 w-4" />
                             <span>{iconName}</span>
                           </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

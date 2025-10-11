
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
import { PlusCircle, BrainCircuit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Item } from '@/lib/types';
import { Checkbox } from '../ui/checkbox';

export function AddItemDialog({ children, itemToEdit }: { children?: React.ReactNode, itemToEdit?: Item }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [tags, setTags] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState('');
    const [isContainer, setIsContainer] = useState(false);
    const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    const { toast } = useToast();

    const isEditMode = itemToEdit !== undefined;

    useEffect(() => {
        if (open && itemToEdit) {
            setName(itemToEdit.name);
            setDescription(itemToEdit.description);
            setQuantity(itemToEdit.quantity);
            setTags(itemToEdit.tags);
            setIsContainer(itemToEdit.isContainer);
        } else if (!open) {
            // Reset form when dialog closes
            setName('');
            setDescription('');
            setQuantity(1);
            setTags([]);
            setCurrentTag('');
            setSuggestedTags([]);
            setIsContainer(false);
        }
    }, [open, itemToEdit]);

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && currentTag.trim()) {
            e.preventDefault();
            const newTag = currentTag.trim().toLowerCase();
            if (!tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setCurrentTag('');
        }
    };
    
    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    useEffect(() => {
        if (!name && !description) return;
        if (!open) return;

        const handler = setTimeout(() => {
            handleSuggestTags();
        }, 1000);

        return () => {
            clearTimeout(handler);
        };
    }, [name, description, open]);
    
    const handleSuggestTags = async () => {
        if (!name && !description) return;
        setIsThinking(true);
        // Mock AI call
        setTimeout(() => {
            const allSuggestions = ['ferramenta', 'eletrônico', 'frágil', 'livro', 'documento', 'cozinha'];
            const suggestions = allSuggestions.filter(t => !tags.includes(t) && (name.includes(t) || description.includes(t)));
            setSuggestedTags(suggestions.slice(0, 3));
            setIsThinking(false);
        }, 1500);
    }
    
    const addSuggestedTag = (tag: string) => {
        if (!tags.includes(tag)) {
            setTags([...tags, tag]);
        }
        setSuggestedTags(suggestedTags.filter(t => t !== tag));
    }
    
    const handleSubmit = () => {
        toast({
            title: isEditMode ? "Item Atualizado!" : "Item Adicionado!",
            description: `"${name}" foi ${isEditMode ? 'atualizado' : 'adicionado'} no seu inventário.`,
        });
        setOpen(false);
    }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Item
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar Item' : 'Adicionar Novo Item'}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Atualize os detalhes do item. Clique em salvar para aplicar as mudanças.'
              : 'Preencha os detalhes do item. Clique em salvar para adicioná-lo ao seu inventário.'
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
            <Label htmlFor="description" className="text-right">
              Descrição
            </Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantidade
            </Label>
            <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value, 10))} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isContainer" className="text-right">
                É um container?
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
                <Checkbox id="isContainer" checked={isContainer} onCheckedChange={(checked) => setIsContainer(checked as boolean)} />
                <label htmlFor="isContainer" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Pode conter outros itens
                </label>
            </div>
          </div>
           <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="tags" className="text-right pt-2">
                    Tags
                </Label>
                <div className="col-span-3">
                    <Input 
                        id="tags" 
                        placeholder="Pressione Enter para adicionar"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                    />
                    <div className="flex flex-wrap gap-1 mt-2">
                        {tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                                {tag} <span className="ml-1.5 text-xs">×</span>
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
                <div className="text-right">
                     <Button variant="ghost" size="icon" onClick={handleSuggestTags} disabled={isThinking} className="mt-1">
                        <BrainCircuit className={cn("h-5 w-5 text-accent", isThinking && "animate-spin")} />
                    </Button>
                </div>
                <div className="col-span-3 pt-2">
                     <p className="text-sm font-medium text-muted-foreground">Sugestões (AI)</p>
                     {suggestedTags.length > 0 && 
                        <div className="flex flex-wrap gap-2 mt-2">
                            {suggestedTags.map(tag => (
                                <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-accent hover:text-accent-foreground" onClick={() => addSuggestedTag(tag)}>
                                    + {tag}
                                </Badge>
                            ))}
                        </div>
                     }
                     {isThinking && <p className="text-sm text-muted-foreground mt-2">Analisando...</p>}
                     {!isThinking && suggestedTags.length === 0 && <p className="text-sm text-muted-foreground mt-2">Nenhuma sugestão no momento.</p>}
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

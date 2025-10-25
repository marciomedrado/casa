
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
import { PlusCircle, BrainCircuit, Camera, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Item, Location } from '@/lib/types';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { suggestCategories } from '@/ai/ai-smart-categorization';
import { identifyItem as aiIdentifyItem } from '@/ai/flows/identify-item-flow';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

function generateRandomId(prefix: string) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function AddItemDialog({ 
    children, 
    itemToEdit,
    parentContainer: initialParentContainer,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    isReadOnly = false,
    onItemSave,
    locations,
    allItems
}: { 
    children?: React.ReactNode, 
    itemToEdit?: Item,
    parentContainer?: Item | null,
    open?: boolean,
    onOpenChange?: (open: boolean) => void,
    isReadOnly?: boolean,
    onItemSave: (item: Item) => void,
    locations: Location[],
    allItems: Item[],
}) {
    const [internalOpen, setInternalOpen] = useState(false);
    
    const open = controlledOpen ?? internalOpen;
    const setOpen = setControlledOpen ?? setInternalOpen;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [tags, setTags] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState('');
    const [isContainer, setIsContainer] = useState(false);
    const [doorCount, setDoorCount] = useState(0);
    const [drawerCount, setDrawerCount] = useState(0);
    const [subContainer, setSubContainer] = useState<SubContainer | null>(null);
    const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    const [isIdentifying, setIsIdentifying] = useState(false);
    const [locationId, setLocationId] = useState<string | null>(null);
    const [parentId, setParentId] = useState<string | null>(null);
    const [imageDataUri, setImageDataUri] = useState<string | null>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const isEditMode = itemToEdit !== undefined;

    const { flattenedLocations, locationMap, itemMap } = useMemo(() => {
        const flatList: { id: string; name: string; fullPath: string; level: number }[] = [];
        const locMap = new Map<string, Omit<Location, 'children'>>();
        const iMap = new Map<string, Item>(allItems.map(item => [item.id, item]));

        const flatten = (locations: Location[], level: number = 0, parentPath: string[] = []) => {
            if (!locations) return;
            for (const loc of locations) {
                const { children, ...rest } = loc;
                locMap.set(loc.id, rest);
                const currentPath = [...parentPath, loc.name];
                flatList.push({ id: loc.id, name: loc.name, fullPath: currentPath.join(' / '), level });
                if (children && children.length > 0) {
                    flatten(children, level + 1, currentPath);
                }
            }
        };
        flatten(locations || []);
        return { flattenedLocations: flatList, locationMap: locMap, itemMap: iMap };
    }, [locations, allItems]);


    const buildFullPath = (locId: string | null, containerId: string | null, subCont: SubContainer | null): string[] => {
        let path: string[] = [];
        
        let currentLocId = locId;
        while(currentLocId && locationMap.has(currentLocId)) {
            const loc = locationMap.get(currentLocId)!;
            path.unshift(loc.name);
            currentLocId = loc.parentId;
        }

        let containerPath: string[] = [];
        let currentContainerId = containerId;
        while(currentContainerId && itemMap.has(currentContainerId)) {
            const container = itemMap.get(currentContainerId)!;
            containerPath.unshift(container.name);
            currentContainerId = container.parentId;
        }
        
        path = [...path, ...containerPath];

        if (subCont) {
            const subContainerName = `${subCont.type === 'door' ? 'Porta' : 'Gaveta'} ${subCont.number}`;
            path.push(subContainerName);
        }

        return path;
    };


    useEffect(() => {
        if (open) {
            if (itemToEdit) {
                // EDIT MODE
                setName(itemToEdit.name);
                setDescription(itemToEdit.description);
                setQuantity(itemToEdit.quantity);
                setTags(itemToEdit.tags || []);
                setIsContainer(itemToEdit.isContainer);
                setDoorCount(itemToEdit.doorCount ?? 0);
                setDrawerCount(itemToEdit.drawerCount ?? 0);
                setSubContainer(itemToEdit.subContainer ?? null);
                setLocationId(itemToEdit.locationId);
                setParentId(itemToEdit.parentId ?? null);
                setImageDataUri(itemToEdit.imageUrl);
            } else {
                 // ADD MODE
                 if (initialParentContainer) {
                    setLocationId(initialParentContainer.locationId);
                    setParentId(initialParentContainer.id);
                } else if (flattenedLocations.length > 0) {
                    setLocationId(null);
                    setParentId(null);
                }
            }
        } else if (!open) {
            // Reset form on close
            setName('');
            setDescription('');
            setQuantity(1);
            setTags([]);
            setCurrentTag('');
            setSuggestedTags([]);
            setIsContainer(false);
            setDoorCount(0);
            setDrawerCount(0);
            setSubContainer(null);
            setLocationId(null);
            setParentId(null);
            setImageDataUri(null);
            setShowCamera(false);
            setHasCameraPermission(null);
            const stream = videoRef.current?.srcObject as MediaStream | null;
            stream?.getTracks().forEach(track => track.stop());
        }
    }, [open, itemToEdit, initialParentContainer, flattenedLocations]);

    useEffect(() => {
        if (showCamera) {
            const getCameraPermission = async () => {
              try {
                const stream = await navigator.mediaDevices.getUserMedia({video: true});
                setHasCameraPermission(true);
        
                if (videoRef.current) {
                  videoRef.current.srcObject = stream;
                }
              } catch (error) {
                console.error('Error accessing camera:', error);
                setHasCameraPermission(false);
                toast({
                  variant: 'destructive',
                  title: 'Acesso à câmera negado',
                  description: 'Por favor, habilite as permissões de câmera nas configurações do seu navegador para usar este aplicativo.',
                });
              }
            };
        
            getCameraPermission();
        } else {
            const stream = videoRef.current?.srcObject as MediaStream | null;
            stream?.getTracks().forEach(track => track.stop());
        }
    }, [showCamera, toast]);


    const availableContainersInLocation = useMemo(() => {
        if (!locationId) return [];
        return allItems.filter(item => 
            item.isContainer && 
            item.locationId === locationId && 
            item.id !== itemToEdit?.id
        );
    }, [locationId, allItems, itemToEdit]);

    const parentContainer = useMemo(() => {
        if (!parentId) return null;
        return allItems.find(item => item.id === parentId) ?? null;
    }, [parentId, allItems]);


    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (isReadOnly) return;
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
        if (isReadOnly) return;
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    useEffect(() => {
        if ((!name && !description) || !open || isReadOnly) {
            setSuggestedTags([]);
            return;
        }

        const handler = setTimeout(() => {
            handleSuggestTags();
        }, 1000);

        return () => {
            clearTimeout(handler);
        };
    }, [name, description, open, isReadOnly]);
    
    const handleSuggestTags = async () => {
        if (!name && !description || isReadOnly) return;
        setIsThinking(true);
        try {
            const result = await suggestCategories({itemName: name, itemDescription: description });
            const allSuggestions = [...result.suggestedCategories, ...result.suggestedTags];
            const uniqueSuggestions = Array.from(new Set(allSuggestions));
            setSuggestedTags(uniqueSuggestions.filter(t => !tags.includes(t)));
        } catch (error) {
            console.error("Error suggesting tags:", error);
            // Silently fail, no need to bother user
        } finally {
            setIsThinking(false);
        }
    }

    const handleIdentifyItem = async () => {
        if (!imageDataUri || isReadOnly) return;
        setIsIdentifying(true);
        try {
            const result = await aiIdentifyItem({ photoDataUri: imageDataUri });
            if (result.itemName) {
                setName(result.itemName);
                toast({
                    title: "Item Identificado!",
                    description: `Sugerimos um nome para o seu item.`,
                });
            }
        } catch (error) {
            console.error("Error identifying item:", error);
            toast({
                variant: 'destructive',
                title: "Falha na Identificação",
                description: "Não foi possível identificar o item a partir da imagem.",
            });
        } finally {
            setIsIdentifying(false);
        }
    }
    
    const addSuggestedTag = (tag: string) => {
        if (isReadOnly) return;
        if (!tags.includes(tag)) {
            setTags([...tags, tag]);
        }
        setSuggestedTags(suggestedTags.filter(t => t !== tag));
    }
    
    const handleSubmit = () => {
        if (isReadOnly) {
            setOpen(false);
            return;
        }

        if (!name) {
             toast({
                variant: 'destructive',
                title: 'Erro de Validação',
                description: 'O nome do item é obrigatório.',
            });
            return;
        }

        if (!locationId) {
            toast({
                variant: 'destructive',
                title: 'Erro de Validação',
                description: 'Por favor, selecione um cômodo para o item.',
            });
            return;
        }

        const finalPath = buildFullPath(locationId, parentId, subContainer);

        const baseItem = isEditMode && itemToEdit ? itemToEdit : {
            id: generateRandomId('item'),
            propertyId: parentContainer?.propertyId || (locationMap.get(locationId)?.propertyId) || 'prop-1',
            imageHint: 'new item',
        };

        const finalItem: Item = {
            ...baseItem,
            name,
            description,
            quantity: isContainer ? 1 : quantity,
            tags,
            isContainer,
            doorCount: isContainer ? doorCount : undefined,
            drawerCount: isContainer ? drawerCount : undefined,
            locationId: locationId,
            parentId: parentId,
            locationPath: finalPath,
            subContainer: parentContainer ? subContainer : null,
            imageUrl: imageDataUri || (isEditMode && itemToEdit?.imageUrl) || `https://picsum.photos/seed/${generateRandomId('img')}/400/300`,
        };

        onItemSave(finalItem);

        toast({
            title: isEditMode ? "Item Atualizado!" : "Item Adicionado!",
            description: `"${name}" foi ${isEditMode ? 'atualizado' : 'adicionado'} no seu inventário.`,
        });
        setOpen(false);
    }

    const handleIsContainerChange = (checked: boolean) => {
        if (isReadOnly) return;
        setIsContainer(checked);
        if (checked) {
            setQuantity(1);
        }
    }

    const handleSubContainerChange = (type: 'door' | 'drawer', value: string) => {
        if (isReadOnly) return;
        const number = parseInt(value, 10);
        if (isNaN(number) || value === 'null') {
            setSubContainer(null);
        } else {
            setSubContainer({ type, number });
        }
    }

    const handleTakePhoto = () => {
        if (canvasRef.current && videoRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUri = canvas.toDataURL('image/jpeg');
            setImageDataUri(dataUri);
            setShowCamera(false);
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImageDataUri(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    const dialogTitle = isReadOnly ? 'Visualizar Item' : (isEditMode ? 'Editar Item' : 'Adicionar Novo Item');
    const dialogDescription = isReadOnly
        ? 'Veja os detalhes do seu item abaixo.'
        : (isEditMode
            ? 'Atualize os detalhes do item. Clique em salvar para aplicar as mudanças.'
            : 'Preencha os detalhes do item. Clique em salvar para adicioná-lo ao seu inventário.');

  const hasDoors = parentContainer && parentContainer.doorCount && parentContainer.doorCount > 0;
  const hasDrawers = parentContainer && parentContainer.drawerCount && parentContainer.drawerCount > 0;
  
  const handleLocationChange = (newLocationId: string) => {
    setLocationId(newLocationId);
    setParentId(null);
    setSubContainer(null);
  }

  const handleParentContainerChange = (newParentId: string | null) => {
    setParentId(newParentId);
    setSubContainer(null);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">

            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Imagem</Label>
                <div className="col-span-3">
                    <div className="w-full aspect-video rounded-md bg-muted flex items-center justify-center overflow-hidden relative">
                         {showCamera ? (
                            <>
                                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                                {hasCameraPermission === false && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-4">
                                        <Alert variant="destructive">
                                            <AlertTitle>Acesso à Câmera Necessário</AlertTitle>
                                            <AlertDescription>
                                                Por favor, permita o acesso à câmera para usar este recurso.
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                )}
                            </>
                        ) : imageDataUri ? (
                            <Image src={imageDataUri} alt="Preview do Item" layout="fill" objectFit="cover" />
                        ) : (
                            <span className="text-sm text-muted-foreground">Sem imagem</span>
                        )}
                    </div>
                     {!isReadOnly && (
                        <div className="flex gap-2 mt-2">
                           {showCamera ? (
                               <>
                                <Button type="button" onClick={handleTakePhoto} disabled={!hasCameraPermission} className="flex-1">Capturar</Button>
                                <Button type="button" variant="outline" onClick={() => setShowCamera(false)}>Cancelar</Button>
                               </>
                           ) : (
                                <>
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCamera(true)}><Camera className="mr-2"/>Tirar Foto</Button>
                                <Button type="button" variant="outline" className="flex-1" onClick={() => fileInputRef.current?.click()}><Upload className="mr-2"/>Carregar</Button>
                                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileSelect} className="hidden" />
                               </>
                           )}
                        </div>
                    )}
                </div>
            </div>

             {imageDataUri && !isReadOnly && (
                <div className="grid grid-cols-4 items-center gap-4">
                    <div />
                    <div className="col-span-3">
                         <Button onClick={handleIdentifyItem} disabled={isIdentifying} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                            <BrainCircuit className={cn("mr-2", isIdentifying && "animate-spin")} />
                            {isIdentifying ? 'Identificando...' : 'Identificar com IA'}
                        </Button>
                    </div>
                </div>
            )}
            
            <canvas ref={canvasRef} className="hidden"></canvas>


          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" readOnly={isReadOnly} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Descrição
            </Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" readOnly={isReadOnly} />
          </div>
          
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Cômodo
            </Label>
            <Select onValueChange={handleLocationChange} value={locationId ?? ''} disabled={isReadOnly}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione um cômodo" />
                </SelectTrigger>
                <SelectContent>
                    {flattenedLocations.map(loc => (
                        <SelectItem key={loc.id} value={loc.id}>
                            <span style={{ paddingLeft: `${loc.level * 1.5}rem` }}>{loc.name}</span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>

          {!isContainer && (
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="parentContainer" className="text-right">
                Container
                </Label>
                <Select onValueChange={(value) => handleParentContainerChange(value === 'null' ? null : value)} value={parentId ?? 'null'} disabled={isReadOnly || !locationId}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecione um container (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="null">Nenhum (item solto)</SelectItem>
                        {availableContainersInLocation.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
           )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isContainer" className="text-right">
                É um container?
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
                <Checkbox id="isContainer" checked={isContainer} onCheckedChange={(checked) => handleIsContainerChange(checked as boolean)} disabled={isReadOnly} />
                <label htmlFor="isContainer" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Pode conter outros itens
                </label>
            </div>
          </div>
          {!isContainer && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantidade
              </Label>
              <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value, 10))} className="col-span-3" readOnly={isReadOnly} />
            </div>
          )}
          {isContainer && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="doorCount" className="text-right">
                  Nº de Portas
                </Label>
                <Input id="doorCount" type="number" value={doorCount} onChange={(e) => setDoorCount(parseInt(e.target.value, 10))} className="col-span-3" readOnly={isReadOnly} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="drawerCount" className="text-right">
                  Nº de Gavetas
                </Label>
                <Input id="drawerCount" type="number" value={drawerCount} onChange={(e) => setDrawerCount(parseInt(e.target.value, 10))} className="col-span-3" readOnly={isReadOnly} />
              </div>
            </>
          )}

          { parentContainer && !isContainer && (hasDoors || hasDrawers) && (
             <div className="grid grid-cols-4 items-start gap-4 pt-2 border-t mt-2">
                <Label className="text-right pt-2 col-span-4 text-left font-normal text-muted-foreground mb-2">Opcional: guardar em</Label>

                {hasDoors && (
                    <>
                    <Label htmlFor="door-select" className="text-right pt-2">Porta</Label>
                    <Select
                        value={subContainer?.type === 'door' ? String(subContainer.number) : ''}
                        onValueChange={(value) => handleSubContainerChange('door', value)}
                        disabled={isReadOnly || subContainer?.type === 'drawer'}
                    >
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Selecione uma porta" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="null">Nenhuma</SelectItem>
                            {Array.from({ length: parentContainer.doorCount! }, (_, i) => i + 1).map(num => (
                                <SelectItem key={`door-${num}`} value={String(num)}>Porta {num}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    </>
                )}

                {hasDrawers && (
                     <>
                    <Label htmlFor="drawer-select" className="text-right pt-2">Gaveta</Label>
                     <Select
                        value={subContainer?.type === 'drawer' ? String(subContainer.number) : ''}
                        onValueChange={(value) => handleSubContainerChange('drawer', value)}
                        disabled={isReadOnly || subContainer?.type === 'door'}
                    >
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Selecione uma gaveta" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="null">Nenhuma</SelectItem>
                            {Array.from({ length: parentContainer.drawerCount! }, (_, i) => i + 1).map(num => (
                                <SelectItem key={`drawer-${num}`} value={String(num)}>Gaveta {num}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    </>
                )}
             </div>
          )}


           <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="tags" className="text-right pt-2">
                    Tags
                </Label>
                <div className="col-span-3">
                    <Input 
                        id="tags" 
                        placeholder={isReadOnly ? 'Sem novas tags' : "Pressione Enter para adicionar"}
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        readOnly={isReadOnly}
                    />
                    <div className="flex flex-wrap gap-1 mt-2">
                        {tags.map(tag => (
                            <Badge key={tag} variant="secondary" className={cn(!isReadOnly && "cursor-pointer")} onClick={() => removeTag(tag)}>
                                {tag} {!isReadOnly && <span className="ml-1.5 text-xs">×</span>}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>
            {!isReadOnly && (
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
            )}
        </div>
        <DialogFooter>
          {isReadOnly ? (
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Fechar</Button>
          ) : (
            <Button type="submit" onClick={handleSubmit}>Salvar</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    
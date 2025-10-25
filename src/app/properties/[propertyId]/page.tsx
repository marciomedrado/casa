
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { ItemBrowser } from '@/components/inventory/item-browser';
import { notFound, useParams, useRouter } from 'next/navigation';
import type { Location, Item, Property, UserProfile } from '@/lib/types';
import { LocationBrowser } from '@/components/inventory/location-browser';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useFirebase, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, getDocs, writeBatch } from 'firebase/firestore';
import { buildLocationTree } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


type ViewMode = 'all-locations' | 'items' | 'all-containers';

export default function PropertyPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const propertyId = params.propertyId as string;
  const { toast } = useToast();
  const { firestore } = useFirebase();

  // User Profile
  const userProfileRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  // Property Data
  const propertyRef = useMemoFirebase(() => firestore ? doc(firestore, 'properties', propertyId) : null, [firestore, propertyId]);
  const { data: property, isLoading: propertyLoading, error: propertyError } = useDoc<Property>(propertyRef);
  
  // Locations Data
  const locationsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'properties', propertyId, 'locations') : null, [firestore, propertyId]);
  const { data: allPropertyLocations, isLoading: locationsLoading } = useCollection<Location>(locationsQuery);

  // Items Data
  const itemsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'properties', propertyId, 'items') : null, [firestore, propertyId]);
  const { data: allItems, isLoading: itemsLoading } = useCollection<Item>(itemsQuery);

  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('all-locations');
  const [isAddLocationDisabled, setIsAddLocationDisabled] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && property && property.ownerId !== user.uid) {
        toast({
            variant: 'destructive',
            title: 'Acesso Negado',
            description: 'Você não tem permissão para ver esta propriedade.',
        });
        router.push('/');
    }
    if (propertyError) {
        notFound();
    }
  }, [user, property, propertyError, router, toast]);

  useEffect(() => {
    if (userProfile && allPropertyLocations) {
      const rootLocationsCount = allPropertyLocations.filter(l => l.parentId === null).length;
      if (userProfile.role === 'free' && rootLocationsCount >= 3) {
        setIsAddLocationDisabled(true);
      } else {
        setIsAddLocationDisabled(false);
      }
    }
  }, [userProfile, allPropertyLocations]);

  const { locationTree, rootLocations } = useMemo(() => {
    const locations = allPropertyLocations || [];
    const tree = buildLocationTree(locations);
    const roots = tree.filter(l => l.parentId === null);
    return { locationTree: tree, rootLocations: roots };
  }, [allPropertyLocations]);

  const handleItemSave = async (itemToSave: Omit<Item, 'id' | 'ownerId' | 'propertyId'> & { id?: string }) => {
    if (!firestore || !user) return;
    try {
      if (itemToSave.id) {
        const itemRef = doc(firestore, 'properties', propertyId, 'items', itemToSave.id);
        await updateDoc(itemRef, { ...itemToSave });
      } else {
        await addDoc(collection(firestore, 'properties', propertyId, 'items'), {
          ...itemToSave,
          ownerId: user.uid,
          propertyId,
          createdAt: serverTimestamp(),
        });
      }
       toast({
        title: itemToSave.id ? "Item Atualizado!" : "Item Adicionado!",
        description: `"${itemToSave.name}" foi salvo com sucesso.`,
      });
    } catch (error) {
      console.error("Error saving item: ", error);
       toast({
        variant: 'destructive',
        title: 'Erro ao Salvar Item',
        description: 'Não foi possível salvar o item.',
      });
    }
  };

  const handleItemClone = async (itemToClone: Item) => {
    const { id, ...cloneData } = itemToClone;
    await handleItemSave({ ...cloneData, name: `Cópia de ${cloneData.name}` });
    toast({
        title: "Item Clonado!",
        description: `Uma cópia de "${itemToClone.name}" foi criada.`,
    });
  }

  const handleItemDelete = async (itemId: string) => {
    if (!firestore) return;
    try {
        const itemRef = doc(firestore, 'properties', propertyId, 'items', itemId);
        await deleteDoc(itemRef);
        toast({
          title: "Item Excluído!",
          description: `O item foi removido com sucesso.`,
        });
    } catch (error) {
        console.error("Error deleting item:", error);
        toast({
            variant: "destructive",
            title: "Erro ao Excluir",
            description: "Não foi possível remover o item.",
        });
    }
  }

  const handleLocationSave = async (locationToSave: Omit<Location, 'children' | 'propertyId'> & { id?: string }) => {
    if (!firestore || !user) return;
    try {
        if (locationToSave.id) {
            const locRef = doc(firestore, 'properties', propertyId, 'locations', locationToSave.id);
            await updateDoc(locRef, { ...locationToSave });
        } else {
            await addDoc(collection(firestore, 'properties', propertyId, 'locations'), {
                ...locationToSave,
                propertyId,
                ownerId: user.uid,
                createdAt: serverTimestamp(),
            });
        }
        toast({
            title: locationToSave.id ? "Cômodo Atualizado!" : "Cômodo Adicionado!",
            description: `"${locationToSave.name}" foi salvo com sucesso.`,
        });
    } catch (error) {
        console.error("Error saving location:", error);
        toast({
            variant: 'destructive',
            title: 'Erro ao Salvar Cômodo',
            description: 'Não foi possível salvar o cômodo.',
        });
    }
  };

  const handleLocationDelete = async (locationId: string) => {
    if (!firestore || !allPropertyLocations || !allItems) return;
    
    const children = allPropertyLocations.filter(l => l.parentId === locationId);
    if (children.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Exclusão não permitida',
        description: 'Este cômodo contém outros cômodos dentro dele e não pode ser excluído.',
      });
      return;
    }
    
    const itemsInLocation = allItems.filter(item => item.locationId === locationId);
    if (itemsInLocation.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Exclusão não permitida',
        description: 'Este cômodo contém itens e não pode ser excluído.',
      });
      return;
    }
    try {
      const locRef = doc(firestore, 'properties', propertyId, 'locations', locationId);
      await deleteDoc(locRef);
      toast({
        title: "Cômodo Excluído!",
        description: `O cômodo foi removido com sucesso.`,
      });
    } catch (error) {
       console.error("Error deleting location:", error);
        toast({
            variant: 'destructive',
            title: 'Erro ao Excluir',
            description: 'Não foi possível remover o cômodo.',
        });
    }
  };

  const getSubLocationIds = (locationId: string): string[] => {
    if (!allPropertyLocations) return [locationId];
    const allIds: string[] = [locationId];
    const stack: string[] = [locationId];
    const allLocationsForTree = [...allPropertyLocations];
    
    while (stack.length > 0) {
      const currentId = stack.pop()!;
      const children = allLocationsForTree.filter(l => l.parentId === currentId);
      for (const child of children) {
        if (!allIds.includes(child.id)) {
          allIds.push(child.id);
          stack.push(child.id);
        }
      }
    }
    return allIds;
  };

  const handleLocationSelect = (id: string | null, mode: ViewMode = 'items') => {
      setSelectedLocationId(id);
      setViewMode(mode);
  }

  const { filteredItems, selectedLocationName } = useMemo(() => {
    let items: Item[] = [];
    let selectedLocationName = property?.name ?? 'Visão Geral';
    
    const currentAllItems = allItems || [];
    const currentAllPropertyLocations = allPropertyLocations || [];
    
    if (viewMode === 'all-locations') {
        selectedLocationName = property?.name ?? 'Todos os Cômodos';
        items = []; // Locations are shown, not items
    } else if (viewMode === 'all-containers') {
        items = currentAllItems.filter(item => item.isContainer);
        selectedLocationName = 'Todos os Containers';
    } else if (viewMode === 'items' && !selectedLocationId) {
        items = currentAllItems;
        selectedLocationName = 'Todos os Itens';
    }


    if (selectedLocationId) {
      const locationIds = getSubLocationIds(selectedLocationId);
      items = currentAllItems.filter(item => locationIds.includes(item.locationId));
      const loc = currentAllPropertyLocations.find(l => l.id === selectedLocationId);
      if (loc) selectedLocationName = loc.name;
    }
    
    if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        items = currentAllItems.filter(item => 
            item.name.toLowerCase().includes(lowerCaseQuery) ||
            item.description.toLowerCase().includes(lowerCaseQuery) ||
            (item.tags && item.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery)))
        );
        if (selectedLocationId) {
          const locName = allPropertyLocations?.find(l => l.id === selectedLocationId)?.name || 'local atual';
          selectedLocationName = `Resultados para "${searchQuery}" em ${locName}`;
        } else {
          selectedLocationName = `Resultados para "${searchQuery}"`;
        }
        if(viewMode !== 'items' && searchQuery) setViewMode('items');
    }
    
    return { filteredItems: items, selectedLocationName };
  }, [selectedLocationId, searchQuery, allItems, allPropertyLocations, viewMode, property]);
  
  const pageIsLoading = authLoading || propertyLoading || locationsLoading || itemsLoading || !property || !allItems || !allPropertyLocations;
  if (pageIsLoading) {
    return (
        <AppLayout 
          pageTitle="Carregando..."
          locations={[]}
          allRawLocations={[]}
          propertyId={propertyId}
          selectedLocationId={null}
          onLocationSelect={() => {}}
          onLocationSave={() => {}}
          searchQuery=""
          setSearchQuery={() => {}}
          viewMode="items"
          isAddLocationDisabled={true}
        >
            <div className="p-8">
                <Skeleton className="h-8 w-1/4 mb-4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        </AppLayout>
    )
  }

  const shouldShowLocationBrowser = viewMode === 'all-locations' && !searchQuery && !selectedLocationId;

  return (
    <AppLayout 
      pageTitle={property?.name ?? ''} 
      locations={locationTree} 
      allRawLocations={allPropertyLocations}
      propertyId={propertyId}
      selectedLocationId={selectedLocationId}
      onLocationSelect={handleLocationSelect}
      onLocationSave={handleLocationSave}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      viewMode={viewMode}
      isAddLocationDisabled={isAddLocationDisabled}
    >
      {isAddLocationDisabled && (
         <Alert className="mb-8 bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200">
          <AlertTitle>Limite de Cômodos Atingido</AlertTitle>
          <AlertDescription>
            Você atingiu o limite de 3 cômodos para o plano Free. Para adicionar mais, considere fazer um upgrade para o plano VIP.
          </AlertDescription>
        </Alert>
      )}
      {shouldShowLocationBrowser ? (
        <LocationBrowser 
            locations={rootLocations}
            allRawLocations={allPropertyLocations}
            propertyId={propertyId}
            onLocationSelect={(id) => handleLocationSelect(id)}
            onLocationSave={handleLocationSave}
            onLocationDelete={handleLocationDelete}
        />
      ) : (
        <ItemBrowser 
            allItems={allItems} 
            visibleItems={filteredItems}
            allLocations={locationTree}
            onItemSave={handleItemSave}
            onItemDelete={handleItemDelete}
            onItemClone={handleItemClone}
            locationName={selectedLocationName}
        />
      )}
    </AppLayout>
  );
}

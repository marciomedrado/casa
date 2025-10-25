
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { buildLocationTree } from '@/lib/data';
import { AppLayout } from '@/components/layout/app-layout';
import { ItemBrowser } from '@/components/inventory/item-browser';
import { notFound, useParams } from 'next/navigation';
import type { Location, Item } from '@/lib/types';
import * as storage from '@/lib/storage';
import { LocationBrowser } from '@/components/inventory/location-browser';
import { useToast } from '@/hooks/use-toast';

type ViewMode = 'all-locations' | 'items' | 'all-containers';

export default function PropertyPage() {
  const params = useParams();
  const propertyId = params.propertyId as string;
  const { toast } = useToast();
  
  const [property, setProperty] = useState<Item | undefined>(undefined);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [allPropertyLocations, setAllPropertyLocations] = useState<Location[]>([]);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('all-locations');

  useEffect(() => {
    storage.initializeDatabase();
    const currentProperty = storage.getPropertyById(propertyId);
    if (currentProperty) {
        setProperty(currentProperty);
        const locations = storage.getLocations(propertyId) as Location[];
        setAllPropertyLocations(locations);
        setAllItems(storage.getItems(propertyId));
    } else {
        notFound();
    }
  }, [propertyId]);

  const { locationTree, rootLocations } = useMemo(() => {
    const tree = buildLocationTree(allPropertyLocations);
    const roots = tree.filter(l => l.parentId === null);
    return { locationTree: tree, rootLocations: roots };
  }, [allPropertyLocations]);

  const handleItemSave = (itemToSave: Item) => {
    const savedItem = storage.saveItem(itemToSave, propertyId);
    const itemExists = allItems.some(item => item.id === savedItem.id);
    if (itemExists) {
        setAllItems(prevItems => prevItems.map(item => item.id === savedItem.id ? savedItem : item));
    } else {
        setAllItems(prevItems => [...prevItems, savedItem]);
    }
  };

  const handleItemDelete = (itemId: string) => {
    storage.deleteItem(itemId);
    setAllItems(prev => prev.filter(i => i.id !== itemId));
    toast({
      title: "Item Excluído!",
      description: `O item foi removido com sucesso.`,
    });
  }

  const handleLocationSave = (locationToSave: Omit<Location, 'children' | 'propertyId'> & { id?: string }) => {
    const savedLocation = storage.saveLocation(locationToSave, propertyId);
    const locationExists = allPropertyLocations.some(l => l.id === savedLocation.id);
    if (locationExists) {
      setAllPropertyLocations(prev => prev.map(loc => loc.id === savedLocation.id ? savedLocation as Location : loc));
    } else {
      setAllPropertyLocations(prev => [...prev, savedLocation as Location]);
    }
  };

  const handleLocationDelete = (locationId: string) => {
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

    storage.deleteLocation(locationId);
    setAllPropertyLocations(prev => prev.filter(l => l.id !== locationId));
    toast({
      title: "Cômodo Excluído!",
      description: `O cômodo foi removido com sucesso.`,
    });
  };

  const getSubLocationIds = (locationId: string): string[] => {
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
    let items = allItems;
    let selectedLocationName = property?.name ?? 'Visão Geral';
    
    if (viewMode === 'all-locations') {
        selectedLocationName = property?.name ?? 'Todos os Cômodos';
    } else if (viewMode === 'all-containers') {
        items = allItems.filter(item => item.isContainer);
        selectedLocationName = 'Todos os Containers';
    } else if (viewMode === 'items' && !selectedLocationId) {
        items = allItems;
        selectedLocationName = 'Todos os Itens';
    }


    if (selectedLocationId) {
      const locationIds = getSubLocationIds(selectedLocationId);
      items = items.filter(item => locationIds.includes(item.locationId));
      const loc = allPropertyLocations.find(l => l.id === selectedLocationId);
      if (loc) selectedLocationName = loc.name;
    }
    
    if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        items = allItems.filter(item => 
            item.name.toLowerCase().includes(lowerCaseQuery) ||
            item.description.toLowerCase().includes(lowerCaseQuery) ||
            (item.tags && item.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery)))
        );
        // When searching, we don't want to scope to a location name if results are from multiple places
        if (selectedLocationId) {
          selectedLocationName = `Resultados para "${searchQuery}" em ${selectedLocationName}`;
        } else {
          selectedLocationName = `Resultados para "${searchQuery}"`;
        }
        // Force items view when searching
        if(viewMode !== 'items' && searchQuery) setViewMode('items');
    }
    
    return { filteredItems: items, selectedLocationName };
  }, [selectedLocationId, searchQuery, allItems, allPropertyLocations, viewMode, property]);
  
  if (!property) {
    return null;
  }

  const shouldShowLocationBrowser = viewMode === 'all-locations' && !searchQuery && !selectedLocationId;

  return (
    <AppLayout 
      pageTitle={property.name} 
      locations={locationTree} 
      allRawLocations={allPropertyLocations}
      propertyId={property.id}
      selectedLocationId={selectedLocationId}
      onLocationSelect={handleLocationSelect}
      onLocationSave={handleLocationSave}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      viewMode={viewMode}
    >
      {shouldShowLocationBrowser ? (
        <LocationBrowser 
            locations={rootLocations}
            allRawLocations={allPropertyLocations}
            propertyId={property.id}
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
            locationName={selectedLocationName}
        />
      )}
    </AppLayout>
  );
}


'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { buildLocationTree } from '@/lib/data';
import { AppLayout } from '@/components/layout/app-layout';
import { ItemBrowser } from '@/components/inventory/item-browser';
import { notFound, useParams } from 'next/navigation';
import type { Location, Item } from '@/lib/types';
import * as storage from '@/lib/storage';

export default function PropertyPage() {
  const params = useParams();
  const propertyId = params.propertyId as string;
  
  const [property, setProperty] = useState<Item | undefined>(undefined);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [allPropertyLocations, setAllPropertyLocations] = useState<Location[]>([]);
  const [allItems, setAllItems] = useState<Item[]>([]);

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

  const locationTree = useMemo(() => buildLocationTree(allPropertyLocations), [allPropertyLocations]);

  const handleItemSave = (itemToSave: Item) => {
    const savedItem = storage.saveItem(itemToSave, propertyId);
    const itemExists = allItems.some(item => item.id === savedItem.id);
    if (itemExists) {
        setAllItems(prevItems => prevItems.map(item => item.id === savedItem.id ? savedItem : item));
    } else {
        setAllItems(prevItems => [...prevItems, savedItem]);
    }
  };

  const handleLocationSave = (locationToSave: Omit<Location, 'children' | 'propertyId'> & { id?: string }) => {
    const savedLocation = storage.saveLocation(locationToSave, propertyId);
    const locationExists = allPropertyLocations.some(l => l.id === savedLocation.id);
    if (locationExists) {
      setAllPropertyLocations(prev => prev.map(loc => loc.id === savedLocation.id ? savedLocation as Location : loc));
    } else {
      setAllPropertyLocations(prev => [...prev, savedLocation as Location]);
    }
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

  const { filteredItems, selectedLocationName } = useMemo(() => {
    let items = allItems;
    let selectedLocationName = 'Todos os Itens';

    if (selectedLocationId) {
      const locationIds = getSubLocationIds(selectedLocationId);
      items = items.filter(item => locationIds.includes(item.locationId));
      const loc = allPropertyLocations.find(l => l.id === selectedLocationId);
      if (loc) selectedLocationName = loc.name;
    }
    
    if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        items = items.filter(item => 
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
    }
    
    return { filteredItems: items, selectedLocationName };
  }, [selectedLocationId, searchQuery, allItems, allPropertyLocations]);
  
  if (!property) {
    return null;
  }

  return (
    <AppLayout 
      pageTitle={property.name} 
      locations={locationTree} 
      allRawLocations={allPropertyLocations}
      propertyId={property.id}
      selectedLocationId={selectedLocationId}
      onLocationSelect={setSelectedLocationId}
      onLocationSave={handleLocationSave}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >
      <ItemBrowser 
        allItems={allItems} 
        visibleItems={filteredItems}
        allLocations={locationTree}
        onItemSave={handleItemSave}
        locationName={selectedLocationName}
      />
    </AppLayout>
  );
}

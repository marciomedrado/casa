

'use client';

import React, { use, useMemo, useState } from 'react';
import { MOCK_ITEMS, MOCK_LOCATIONS, MOCK_PROPERTIES, buildLocationTree } from '@/lib/data';
import { AppLayout } from '@/components/layout/app-layout';
import { ItemBrowser } from '@/components/inventory/item-browser';
import { notFound } from 'next/navigation';
import type { Location, Item } from '@/lib/types';

function generateRandomId(prefix: string) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export default function PropertyPage({ params }: { params: { propertyId: string } }) {
  const { propertyId } = use(params);
  const property = useMemo(() => MOCK_PROPERTIES.find(p => p.id === propertyId), [propertyId]);
  
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  // --- State for Locations ---
  const [allPropertyLocations, setAllPropertyLocations] = useState<Location[]>(() => MOCK_LOCATIONS.filter(l => l.propertyId === propertyId));
  const locationTree = useMemo(() => buildLocationTree(allPropertyLocations), [allPropertyLocations]);
  
  // --- State for Items ---
  const [allItems, setAllItems] = useState<Item[]>(() => MOCK_ITEMS.filter(i => i.propertyId === propertyId));

  const handleItemSave = (updatedItem: Item) => {
    setAllItems(prevItems => {
        const itemExists = prevItems.some(item => item.id === updatedItem.id);
        if (itemExists) {
            return prevItems.map(item => item.id === updatedItem.id ? updatedItem : item);
        }
        return [...prevItems, updatedItem];
    });
  };

  const handleLocationSave = (locationToSave: Omit<Location, 'children' | 'propertyId'> & { id?: string }) => {
    setAllPropertyLocations(prevLocations => {
      const isEditing = locationToSave.id && prevLocations.some(l => l.id === locationToSave.id);
      
      if (isEditing) {
        // Update existing location
        return prevLocations.map(loc => {
          if (loc.id === locationToSave.id) {
            return { ...loc, ...locationToSave };
          }
          return loc;
        });
      } else {
        // Add new location
        const newLocation: Location = {
          ...locationToSave,
          id: generateRandomId('loc'),
          propertyId,
          children: [],
        };
        return [...prevLocations, newLocation];
      }
    });
  };

  const getSubLocationIds = (locationId: string): string[] => {
    const allIds: string[] = [locationId];
    const locationMap = new Map(allPropertyLocations.map(l => [l.id, l]));
    const stack: string[] = [locationId];
    
    while (stack.length > 0) {
      const currentId = stack.pop()!;
      const children = allPropertyLocations.filter(l => l.parentId === currentId);
      for (const child of children) {
        if (!allIds.includes(child.id)) {
          allIds.push(child.id);
          stack.push(child.id);
        }
      }
    }
    return allIds;
  };

  const filteredItems = useMemo(() => {
    if (!selectedLocationId) {
      return allItems;
    }
    const locationIds = getSubLocationIds(selectedLocationId);
    return allItems.filter(item => locationIds.includes(item.locationId));
  }, [selectedLocationId, allItems, allPropertyLocations]);
  
  if (!property) {
    notFound();
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
    >
      <ItemBrowser 
        allItems={allItems} 
        visibleItems={filteredItems}
        allLocations={locationTree}
        onItemSave={handleItemSave}
      />
    </AppLayout>
  );
}

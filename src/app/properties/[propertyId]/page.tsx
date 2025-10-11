

'use client';

import React, { useMemo, useState, use } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');

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
            // Important: do not overwrite children array
            return { ...loc, ...locationToSave, children: loc.children || [] };
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
    let items = allItems;

    // Filter by selected location first
    if (selectedLocationId) {
      const locationIds = getSubLocationIds(selectedLocationId);
      items = items.filter(item => locationIds.includes(item.locationId));
    }
    
    // Then, filter by search query
    if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        items = items.filter(item => 
            item.name.toLowerCase().includes(lowerCaseQuery) ||
            item.description.toLowerCase().includes(lowerCaseQuery) ||
            item.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery))
        );
    }
    
    return items;
  }, [selectedLocationId, searchQuery, allItems, allPropertyLocations]);
  
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
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
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

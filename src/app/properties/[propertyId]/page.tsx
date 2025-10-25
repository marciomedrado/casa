

'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { MOCK_ITEMS, MOCK_LOCATIONS, MOCK_PROPERTIES, buildLocationTree } from '@/lib/data';
import { AppLayout } from '@/components/layout/app-layout';
import { ItemBrowser } from '@/components/inventory/item-browser';
import { notFound } from 'next/navigation';
import type { Location, Item } from '@/lib/types';

function generateRandomId(prefix: string) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export default function PropertyPage({ params }: { params: { propertyId: string } }) {
  // Directly use params.propertyId as it's available on both server and client
  const { propertyId } = React.use(params);
  
  const [property, setProperty] = useState<Item | undefined>(undefined);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // --- State for Locations ---
  const [allPropertyLocations, setAllPropertyLocations] = useState<Location[]>([]);
  const locationTree = useMemo(() => buildLocationTree(allPropertyLocations), [allPropertyLocations]);
  
  // --- State for Items ---
  const [allItems, setAllItems] = useState<Item[]>([]);

  // Defer state initialization to the client side to avoid hydration mismatch
  useEffect(() => {
    const currentProperty = MOCK_PROPERTIES.find(p => p.id === propertyId)
    if (currentProperty) {
        setProperty(currentProperty)
        setAllPropertyLocations(MOCK_LOCATIONS.filter(l => l.propertyId === propertyId));
        setAllItems(MOCK_ITEMS.filter(i => i.propertyId === propertyId));
    } else {
        // If property is not found after client-side check, then 404.
        notFound();
    }
  }, [propertyId]);


  const handleItemSave = (itemToSave: Item) => {
    setAllItems(prevItems => {
        const itemExists = prevItems.some(item => item.id === itemToSave.id);
        if (itemExists) {
            return prevItems.map(item => item.id === itemToSave.id ? itemToSave : item);
        }
        // This is a new item
        const newItem = {
            ...itemToSave,
            id: itemToSave.id || generateRandomId('item'),
            imageUrl: itemToSave.imageUrl || `https://picsum.photos/seed/${generateRandomId('img')}/400/300`,
            imageHint: itemToSave.imageHint || 'new item',
        };
        return [...prevItems, newItem];
    });
  };

  const handleLocationSave = (locationToSave: Omit<Location, 'children' | 'propertyId'> & { id?: string }) => {
    setAllPropertyLocations(prevLocations => {
      const isEditing = locationToSave.id && prevLocations.some(l => l.id === locationToSave.id);
      
      if (isEditing) {
        // Update existing location
        return prevLocations.map(loc => {
          if (loc.id === locationToSave.id) {
            // Important: do not overwrite children array that might exist
            const existingChildren = buildLocationTree(prevLocations, loc.id);
            return { ...loc, ...locationToSave, children: existingChildren };
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
    const allLocationsForTree = [...allPropertyLocations]; // use current state
    
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
    // Show a loading state or return null until the property is loaded on the client
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
      />
    </AppLayout>
  );
}

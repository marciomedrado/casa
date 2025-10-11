
'use client';

import React, { use, useMemo, useState } from 'react';
import { MOCK_ITEMS, MOCK_LOCATIONS, MOCK_PROPERTIES, buildLocationTree } from '@/lib/data';
import { AppLayout } from '@/components/layout/app-layout';
import { ItemBrowser } from '@/components/inventory/item-browser';
import { notFound } from 'next/navigation';
import type { Location, Item } from '@/lib/types';

export default function PropertyPage({ params }: { params: { propertyId: string } }) {
  const { propertyId } = use(params);
  const property = useMemo(() => MOCK_PROPERTIES.find(p => p.id === propertyId), [propertyId]);
  
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  
  const allPropertyLocations = useMemo(() => MOCK_LOCATIONS.filter(l => l.propertyId === propertyId), [propertyId]);
  const locationTree = useMemo(() => buildLocationTree(allPropertyLocations), [allPropertyLocations]);
  
  // State for all items is now managed at the page level
  const [allItems, setAllItems] = useState<Item[]>(() => MOCK_ITEMS.filter(i => i.propertyId === propertyId));

  const handleItemSave = (updatedItem: Item) => {
    // This function updates the master list of items
    setAllItems(prevItems => {
        const itemExists = prevItems.some(item => item.id === updatedItem.id);
        if (itemExists) {
            return prevItems.map(item => item.id === updatedItem.id ? updatedItem : item);
        }
        return [...prevItems, updatedItem];
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
      // Show only root items if no location is selected
      return allItems.filter(item => {
        const itemLocation = allPropertyLocations.find(l => l.id === item.locationId);
        // This logic might need adjustment depending on desired root view behavior.
        // For now, let's show all items when no location is selected.
        return true; 
      });
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
      propertyId={property.id}
      selectedLocationId={selectedLocationId}
      onLocationSelect={setSelectedLocationId}
    >
      <ItemBrowser 
        // Pass down the master item list, the filtered list, and the save handler
        allItems={allItems} 
        visibleItems={filteredItems}
        allLocations={locationTree}
        onItemSave={handleItemSave}
      />
    </AppLayout>
  );
}

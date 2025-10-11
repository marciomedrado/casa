
'use client';

import React, { useMemo, useState } from 'react';
import { MOCK_ITEMS, MOCK_LOCATIONS, MOCK_PROPERTIES, buildLocationTree } from '@/lib/data';
import { AppLayout } from '@/components/layout/app-layout';
import { ItemBrowser } from '@/components/inventory/item-browser';
import { notFound } from 'next/navigation';
import type { Location } from '@/lib/types';

export default function PropertyPage({ params }: { params: { propertyId: string } }) {
  const { propertyId } = React.use(params);
  const property = useMemo(() => MOCK_PROPERTIES.find(p => p.id === propertyId), [propertyId]);
  
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  
  const allPropertyLocations = useMemo(() => MOCK_LOCATIONS.filter(l => l.propertyId === propertyId), [propertyId]);
  const locationTree = useMemo(() => buildLocationTree(allPropertyLocations), [allPropertyLocations]);
  const allPropertyItems = useMemo(() => MOCK_ITEMS.filter(i => i.propertyId === propertyId), [propertyId]);

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
      return allPropertyItems.filter(item => {
        const itemLocation = allPropertyLocations.find(l => l.id === item.locationId);
        return !itemLocation?.parentId;
      });
    }
    const locationIds = getSubLocationIds(selectedLocationId);
    return allPropertyItems.filter(item => locationIds.includes(item.locationId));
  }, [selectedLocationId, allPropertyItems, allPropertyLocations]);
  
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
        allItems={allPropertyItems} 
        visibleItems={filteredItems}
        allLocations={locationTree}
      />
    </AppLayout>
  );
}

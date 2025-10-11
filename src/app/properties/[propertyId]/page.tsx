
'use client';

import React, { useMemo, useState, useEffect } from 'react';
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
    const location = allPropertyLocations.find(l => l.id === locationId);
    
    const findChildrenIds = (loc: Location) => {
      if (loc && loc.children) {
        loc.children.forEach(child => {
          allIds.push(child.id);
          findChildrenIds(child);
        });
      }
    };
    
    const buildTreeAndFind = (locations: Location[], parentId: string | null = null): Location | undefined => {
        for (const loc of locations.filter(l => l.parentId === parentId)) {
            if (loc.id === locationId) return { ...loc, children: buildLocationTree(locations, loc.id) };
            const foundInChildren = buildTreeAndFind(locations, loc.id);
            if (foundInChildren) return foundInChildren;
        }
    }

    const rootLocation = locationTree.find(l => {
      if(l.id === locationId) return true;
      const findInChild = (children: Location[]): boolean => {
        return children.some(c => {
          if (c.id === locationId) return true;
          return findInChild(c.children);
        })
      }
      return findInChild(l.children);
    });

    if (rootLocation) {
        findChildrenIds(buildLocationTree(allPropertyLocations, locationId)[0] ?? location);
    }

    return allIds;
  };

  const filteredItems = useMemo(() => {
    if (!selectedLocationId) {
      return allPropertyItems.filter(item => item.parentId === null);
    }
    const locationIds = getSubLocationIds(selectedLocationId);
    return allPropertyItems.filter(item => locationIds.includes(item.locationId) && item.parentId === null);
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

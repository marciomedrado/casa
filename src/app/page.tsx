
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { MOCK_PROPERTIES } from '@/lib/data';
import { PropertyCard } from '@/components/dashboard/property-card';
import { Header } from '@/components/layout/header';
import { AddPropertyDialog } from '@/components/dashboard/add-property-dialog';
import type { Property } from '@/lib/types';

function generateRandomId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export default function Dashboard() {
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    // Initialize state from mock data on the client to avoid hydration issues
    setProperties(MOCK_PROPERTIES);
  }, []);

  const handlePropertySave = (propertyToSave: Omit<Property, 'id' | 'imageUrl' | 'imageHint'> & { id?: string }) => {
    setProperties(prevProperties => {
      const isEditing = propertyToSave.id && prevProperties.some(p => p.id === propertyToSave.id);

      if (isEditing) {
        return prevProperties.map(prop => 
          prop.id === propertyToSave.id ? { ...prop, ...propertyToSave } : prop
        );
      } else {
        const newProperty: Property = {
          ...propertyToSave,
          id: generateRandomId('prop'),
          imageUrl: `https://picsum.photos/seed/${generateRandomId('img')}/600/400`,
          imageHint: 'new property',
        };
        return [...prevProperties, newProperty];
      }
    });
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Minhas Propriedades</h1>
          <AddPropertyDialog onPropertySave={handlePropertySave}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Imóvel
            </Button>
          </AddPropertyDialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </main>
    </div>
  );
}

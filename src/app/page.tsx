
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { PropertyCard } from '@/components/dashboard/property-card';
import { Header } from '@/components/layout/header';
import { AddPropertyDialog } from '@/components/dashboard/add-property-dialog';
import type { Property } from '@/lib/types';
import { initializeDatabase, getProperties, saveProperty, deleteProperty } from '@/lib/storage';

export default function Dashboard() {
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    // Initialize DB and load properties from localStorage on client side
    initializeDatabase();
    setProperties(getProperties());
  }, []);

  const handlePropertySave = (propertyToSave: Omit<Property, 'id' | 'imageUrl' | 'imageHint'> & { id?: string }) => {
    const savedProperty = saveProperty(propertyToSave);
    if (propertyToSave.id) {
        // Editing
        setProperties(prev => prev.map(p => p.id === savedProperty.id ? savedProperty : p));
    } else {
        // Adding
        setProperties(prev => [...prev, savedProperty]);
    }
  };

  const handlePropertyDelete = (propertyId: string) => {
    deleteProperty(propertyId);
    setProperties(prev => prev.filter(p => p.id !== propertyId));
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
            <PropertyCard 
              key={property.id} 
              property={property} 
              onEdit={() => { /* This will be handled by the dialog inside the card now */}}
              onDelete={handlePropertyDelete}
              onPropertySave={handlePropertySave}
            />
          ))}
        </div>
      </main>
    </div>
  );
}


'use client';

import { LocationCard } from './location-card';
import type { Location } from '@/lib/types';

export function LocationBrowser({ 
    locations,
    allRawLocations,
    propertyId,
    onLocationSelect,
    onLocationSave,
    onLocationDelete
}: { 
    locations: Location[],
    allRawLocations: Location[],
    propertyId: string;
    onLocationSelect: (id: string) => void,
    onLocationSave: (location: Omit<Location, 'children' | 'propertyId'> & { id?: string }) => void;
    onLocationDelete: (id: string) => void;
}) {
  return (
    <div>
       <h2 className="text-2xl font-bold tracking-tight mb-8">Navegar por Cômodo</h2>
      {locations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 text-center p-12 min-h-[200px]">
          <h3 className="text-xl font-semibold">Nenhum cômodo encontrado</h3>
          <p className="text-muted-foreground mt-2">Comece a organizar adicionando seu primeiro cômodo na barra lateral.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {locations.map((location) => (
            <LocationCard 
                key={location.id} 
                location={location} 
                allRawLocations={allRawLocations}
                propertyId={propertyId}
                onLocationSelect={onLocationSelect}
                onLocationSave={onLocationSave}
                onLocationDelete={onLocationDelete}
             />
          ))}
        </div>
      )}
    </div>
  );
}

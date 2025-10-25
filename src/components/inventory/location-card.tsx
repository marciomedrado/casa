
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Location } from '@/lib/types';
import { ArrowRight } from 'lucide-react';
import { Icon } from './icons';
import { cn } from '@/lib/utils';


export function LocationCard({ location, onLocationSelect }: { location: Location, onLocationSelect: (id: string) => void }) {
  
  const handleCardClick = () => {
    onLocationSelect(location.id);
  }

  return (
    <Card 
        onClick={handleCardClick}
        className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out group flex flex-col cursor-pointer hover:shadow-lg hover:-translate-y-1"
        )}
    >
      <CardHeader>
          <Icon name={location.icon} className="h-8 w-8 mb-2 text-primary" />
          <CardTitle className="text-xl">{location.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow"></CardContent>
       <div className="p-4 pt-0 mt-auto flex items-center justify-end text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-sm font-medium">Abrir local</span>
            <ArrowRight className="ml-2 h-4 w-4" />
        </div>
    </Card>
  );
}

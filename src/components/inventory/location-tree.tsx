
'use client';

import { useState, useMemo } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronRight, Pencil } from 'lucide-react';
import type { Location } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Icon } from './icons';
import { AddLocationDialog } from './add-location-dialog';

interface LocationTreeProps {
  locations: Location[];
  propertyId: string;
  level?: number;
  activeLocation?: string | null;
  setActiveLocation?: (id: string | null) => void;
}

function LocationNode({ location, propertyId, level = 0, activeLocation, setActiveLocation, allLocations }: LocationTreeProps & { location: Location, allLocations: Location[] }) {
    const hasChildren = location.children && location.children.length > 0;
    const isActive = activeLocation === location.id;
    const [isOpen, setIsOpen] = useState(level < 2);

    const handleLocationClick = () => {
        if (setActiveLocation) setActiveLocation(location.id);
    };

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full group">
            <div className="flex items-center" style={{ paddingLeft: `${level * 1}rem` }}>
                {hasChildren && (
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                           <ChevronRight className={cn('h-4 w-4 transition-transform duration-200', isOpen && 'rotate-90')} />
                        </Button>
                    </CollapsibleTrigger>
                )}
                <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    onClick={handleLocationClick}
                    className={cn(
                        "w-full justify-start gap-2 h-9 pr-8", 
                        !hasChildren && "ml-9" // indent if no trigger
                    )}
                >
                    <Icon name={location.icon} className="h-4 w-4 shrink-0" />
                    <span className="truncate">{location.name}</span>
                </Button>
                <AddLocationDialog locations={allLocations} propertyId={propertyId} locationToEdit={location}>
                    <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Pencil className="h-4 w-4" />
                    </Button>
                </AddLocationDialog>
            </div>
            {hasChildren && (
              <CollapsibleContent>
                  <LocationTree
                      locations={location.children}
                      propertyId={propertyId}
                      level={level + 1}
                      activeLocation={activeLocation}
                      setActiveLocation={setActiveLocation}
                  />
              </CollapsibleContent>
            )}
        </Collapsible>
    );
}

export function LocationTree({ locations, propertyId, level = 0, activeLocation, setActiveLocation }: LocationTreeProps) {

    const allLocations = useMemo(() => {
        const flatten = (locs: Location[]): Location[] => {
            return locs.reduce((acc, loc) => {
                acc.push(loc);
                if (loc.children) {
                    acc.push(...flatten(loc.children));
                }
                return acc;
            }, [] as Location[]);
        };
        return flatten(locations);
    }, [locations]);


    if (!locations || locations.length === 0) return null;

    return (
        <div className="space-y-1">
            {locations.map(location => (
                <LocationNode
                    key={location.id}
                    location={location}
                    locations={[]} // Pass empty array, allLocations is used for the dialog
                    allLocations={allLocations}
                    propertyId={propertyId}
                    level={level}
                    activeLocation={activeLocation}
                    setActiveLocation={setActiveLocation}
                />
            ))}
        </div>
    );
}

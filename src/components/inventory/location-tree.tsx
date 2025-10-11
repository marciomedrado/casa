'use client';

import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import type { Location } from '@/lib/types';
import { cn } from '@/lib/utils';

interface LocationTreeProps {
  locations: Location[];
  propertyId: string;
  level?: number;
  activeLocation?: string | null;
  setActiveLocation?: (id: string | null) => void;
}

function LocationNode({ location, propertyId, level = 0, activeLocation, setActiveLocation }: LocationTreeProps & { location: Location }) {
    const hasChildren = location.children && location.children.length > 0;
    const isActive = activeLocation === location.id;
    const [isOpen, setIsOpen] = useState(level < 1);

    const handleLocationClick = () => {
        if (setActiveLocation) setActiveLocation(location.id);
    };

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
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
                        "w-full justify-start gap-2 h-9", 
                        !hasChildren && "ml-9" // indent if no trigger
                    )}
                >
                    <location.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{location.name}</span>
                </Button>
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

export function LocationTree({ locations, propertyId, level = 0 }: LocationTreeProps) {
    const [activeLocation, setActiveLocation] = useState<string | null>(null);

    if (!locations || locations.length === 0) return null;

    return (
        <div className="space-y-1">
            {locations.map(location => (
                <LocationNode
                    key={location.id}
                    location={location}
                    locations={[]}
                    propertyId={propertyId}
                    level={level}
                    activeLocation={activeLocation}
                    setActiveLocation={setActiveLocation}
                />
            ))}
        </div>
    );
}

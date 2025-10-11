import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import type { Property } from '@/lib/types';

export function PropertyCard({ property }: { property: Property }) {
  return (
    <Link href={`/properties/${property.id}`} className="group">
      <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 duration-300 ease-in-out">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            <Image
              src={property.imageUrl}
              alt={property.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              data-ai-hint={property.imageHint}
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 bg-card">
          <CardTitle className="text-xl mb-1">{property.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{property.address}</p>
          <div className="mt-4 flex items-center justify-end text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-sm font-medium">Ver inventário</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

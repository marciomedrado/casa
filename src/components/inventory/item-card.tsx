import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Item } from '@/lib/types';
import { MapPin } from 'lucide-react';

export function ItemCard({ item }: { item: Item }) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 duration-300 ease-in-out">
      <CardHeader className="p-0">
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover"
            data-ai-hint={item.imageHint}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-1">
        <CardTitle className="text-lg mb-1 line-clamp-1">{item.name}</CardTitle>
        <div className="flex items-center text-sm text-muted-foreground mb-2">
            <MapPin className="h-4 w-4 mr-2 shrink-0" />
            <span className="truncate">{item.locationPath.join(' / ')}</span>
        </div>
        <CardDescription className="text-sm line-clamp-2">{item.description}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
        {item.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="secondary">{tag}</Badge>
        ))}
         <Badge variant="outline">Qtd: {item.quantity}</Badge>
      </CardFooter>
    </Card>
  );
}

import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { MOCK_PROPERTIES } from '@/lib/data';
import { PropertyCard } from '@/components/dashboard/property-card';
import { Header } from '@/components/layout/header';

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Minhas Propriedades</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Imóvel
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {MOCK_PROPERTIES.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </main>
    </div>
  );
}

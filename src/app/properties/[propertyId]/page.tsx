import { MOCK_ITEMS, MOCK_LOCATIONS, MOCK_PROPERTIES, buildLocationTree } from '@/lib/data';
import { AppLayout } from '@/components/layout/app-layout';
import { ItemList } from '@/components/inventory/item-list';
import { notFound } from 'next/navigation';

export default function PropertyPage({ params }: { params: { propertyId: string } }) {
  const property = MOCK_PROPERTIES.find(p => p.id === params.propertyId);
  
  if (!property) {
    notFound();
  }

  const locations = MOCK_LOCATIONS.filter(l => l.propertyId === params.propertyId);
  const locationTree = buildLocationTree(locations);
  const items = MOCK_ITEMS.filter(i => i.propertyId === params.propertyId);

  return (
    <AppLayout pageTitle={property.name} locations={locationTree} propertyId={property.id}>
      <ItemList items={items} />
    </AppLayout>
  );
}

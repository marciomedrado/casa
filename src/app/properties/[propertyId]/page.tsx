import { MOCK_ITEMS, MOCK_LOCATIONS, MOCK_PROPERTIES, buildLocationTree, buildItemTree } from '@/lib/data';
import { AppLayout } from '@/components/layout/app-layout';
import { ItemBrowser } from '@/components/inventory/item-browser';
import { notFound } from 'next/navigation';

export default function PropertyPage({ params }: { params: { propertyId: string } }) {
  const property = MOCK_PROPERTIES.find(p => p.id === params.propertyId);
  
  if (!property) {
    notFound();
  }

  const locations = MOCK_LOCATIONS.filter(l => l.propertyId === params.propertyId);
  const locationTree = buildLocationTree(locations);
  const items = MOCK_ITEMS.filter(i => i.propertyId === params.propertyId);
  const itemTree = buildItemTree(items);


  return (
    <AppLayout pageTitle={property.name} locations={locationTree} propertyId={property.id}>
      <ItemBrowser allItems={items} />
    </AppLayout>
  );
}

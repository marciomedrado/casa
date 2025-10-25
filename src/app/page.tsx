
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { PropertyCard } from '@/components/dashboard/property-card';
import { Header } from '@/components/layout/header';
import { AddPropertyDialog } from '@/components/dashboard/add-property-dialog';
import type { Property, UserProfile } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirebase } from '@/firebase';
import { useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const { firestore } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  const userProfileRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);
  
  const propertiesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'properties'), where('ownerId', '==', user.uid));
  }, [firestore, user]);

  const { data: properties, isLoading: propertiesLoading } = useCollection<Property>(propertiesQuery);

  const [isAddDisabled, setIsAddDisabled] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    if (userProfile && properties) {
      if (userProfile.role === 'free' && properties.length >= 1) {
        setIsAddDisabled(true);
      } else {
        setIsAddDisabled(false);
      }
    }
  }, [userProfile, properties]);


  const handlePropertyDelete = async (propertyId: string) => {
    if (!firestore) return;
    try {
        const batch = writeBatch(firestore);

        const propertyRef = doc(firestore, 'properties', propertyId);

        const locationsQuery = query(collection(firestore, 'properties', propertyId, 'locations'));
        const itemsQuery = query(collection(firestore, 'properties', propertyId, 'items'));

        // This would be more robust with collection group queries, but for now we delete subcollections manually
        // Note: this doesn't handle nested subcollections of items/locations which is a limitation.
        const locationsSnapshot = await getDocs(locationsQuery);
        locationsSnapshot.forEach(doc => batch.delete(doc.ref));
        
        const itemsSnapshot = await getDocs(itemsQuery);
        itemsSnapshot.forEach(doc => batch.delete(doc.ref));
        
        batch.delete(propertyRef);
        
        await batch.commit();

        toast({
            title: "Imóvel Excluído!",
            description: `O imóvel e todos os seus dados foram removidos.`,
        });
    } catch (error) {
        console.error("Error deleting property:", error);
        toast({
            variant: 'destructive',
            title: 'Erro ao Excluir',
            description: 'Não foi possível excluir o imóvel.',
        });
    }
  };
  
  const pageIsLoading = loading || propertiesLoading || !properties;

  if (pageIsLoading) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-1 container mx-auto p-4 md:p-8">
                 <div className="flex items-center justify-between mb-8">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-10 w-40" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
            </main>
        </div>
    )
  }


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Minhas Propriedades</h1>
           <AddPropertyDialog>
            <Button disabled={isAddDisabled}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Imóvel
            </Button>
          </AddPropertyDialog>
        </div>

        {isAddDisabled && (
          <Alert className="mb-8 bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200">
            <AlertTitle>Limite Atingido</AlertTitle>
            <AlertDescription>
              Você atingiu o limite de 1 imóvel para o plano Free. Para adicionar mais, considere fazer um upgrade para o plano VIP.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard 
              key={property.id} 
              property={property} 
              onDelete={handlePropertyDelete}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

"use client";

import * as React from "react";
import { House, HouseWithId } from "@/lib/types";
import { Header } from "@/components/homeview/header";
import { PropertySearch } from "@/components/homeview/property-search";
import { PropertyDetails } from "@/components/homeview/property-details";
import Map from "@/components/homeview/map-provider";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PropertyForm } from "@/components/homeview/property-form";
import { useToast } from "@/hooks/use-toast";
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
// Do not import leaflet-geosearch here to avoid SSR issues

export default function Home() {
  const [filteredHouses, setFilteredHouses] = React.useState<HouseWithId[]>([]);
  const [selectedHouse, setSelectedHouse] = React.useState<HouseWithId | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingHouse, setEditingHouse] = React.useState<HouseWithId | null>(null);

  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const housesCollection = useMemoFirebase(() => collection(firestore, "houses"), [firestore]);
  const { data: allHouses, isLoading } = useCollection<House>(housesCollection);

  React.useEffect(() => {
    if (allHouses) {
      setFilteredHouses(allHouses);
    }
  }, [allHouses]);

  const handleSearch = (searchTerm: string, filters: { rooms: number | null; minPrice: number; maxPrice: number }) => {
    let results = allHouses || [];

    if (searchTerm) {
      results = results.filter((house) =>
        house.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.rooms) {
      results = results.filter((house) => house.rooms === filters.rooms);
    }

    results = results.filter(
      (house) => house.price >= filters.minPrice && house.price <= filters.maxPrice
    );

    setFilteredHouses(results);
  };

  const handleSelectHouse = (house: HouseWithId) => {
    setSelectedHouse(house);
  };

  const handleDeselectHouse = () => {
    setSelectedHouse(null);
  };

  const handleOpenForm = (house?: HouseWithId) => {
    setEditingHouse(house || null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingHouse(null);
  };

 const handleFormSubmit = async (values: Omit<House, 'coordinates'>) => {
    if (!firestore || !user) return;

    try {
      // Dynamically import leaflet-geosearch only on the client-side
      const { OpenStreetMapProvider } = await import('leaflet-geosearch');
      const provider = new OpenStreetMapProvider();
      
      // A more robust way to clean the address
      const cleanedAddress = `Россия, ${values.address
        .replace(/[гд]\./g, '') // Remove г. and д.
        .replace(/,/g, ' ')    // Replace commas with spaces
        .replace(/\s+/g, ' ')  // Collapse multiple spaces
        .trim()}`;

      const results = await provider.search({ query: cleanedAddress });
      
      if (results && results.length > 0) {
        const { y: lat, x: lon } = results[0];
        const houseData: House = {
          ...values,
          coordinates: [lat, lon],
        };

        if (editingHouse) {
          const houseRef = doc(firestore, 'houses', editingHouse.id);
          updateDocumentNonBlocking(houseRef, houseData);
          toast({ title: "House update request sent." });
        } else {
          addDocumentNonBlocking(collection(firestore, 'houses'), houseData);
          toast({ title: "Add house request sent." });
        }
        handleFormClose();
      } else {
        toast({
          variant: "destructive",
          title: "Geocoding Error",
          description: "Could not find coordinates for the provided address.",
        });
      }
    } catch (error) {
      console.error("Geocoding or Firestore error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while saving the house. The address might be invalid.",
      });
    }
  };

  const handleDeleteHouse = (houseId: string) => {
    if (!firestore || !user) return;
    if (window.confirm("Are you sure you want to delete this house?")) {
      const houseRef = doc(firestore, 'houses', houseId);
      deleteDocumentNonBlocking(houseRef);
      toast({ title: "Delete house request sent." });
      handleDeselectHouse();
    }
  };


  return (
    <div className="relative min-h-screen w-full bg-background">
      <Header />
      <main className="relative h-[calc(100vh-4rem)] w-full">
        <PropertySearch onSearch={handleSearch} />
        {isLoading ? (
          <div className="flex items-center justify-center h-full">Loading houses...</div>
        ) : (
          <Map houses={filteredHouses} onSelectHouse={handleSelectHouse} />
        )}
        <PropertyDetails
          house={selectedHouse}
          open={!!selectedHouse}
          onOpenChange={handleDeselectHouse}
          isAdmin={!!user}
          onEdit={handleOpenForm}
          onDelete={handleDeleteHouse}
        />
        {user && (
          <div className="absolute bottom-4 right-4 z-10">
            <Button size="lg" onClick={() => handleOpenForm()}>
              <Plus className="mr-2 h-5 w-5" /> Add House
            </Button>
          </div>
        )}
        {user && isFormOpen && (
          <PropertyForm
            open={isFormOpen}
            onOpenChange={handleFormClose}
            onSubmit={handleFormSubmit}
            initialData={editingHouse}
          />
        )}
      </main>
    </div>
  );
}

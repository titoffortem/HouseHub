"use client";

import * as React from "react";
import { House, HouseWithId } from "@/lib/types";
import { Header } from "@/components/homeview/header";
import { PropertySearch } from "@/components/homeview/property-search";
import { PropertyDetails } from "@/components/homeview/property-details";
import Map from "@/components/homeview/map-provider";
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, doc, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PropertyForm } from "@/components/homeview/property-form";
import { useToast } from "@/hooks/use-toast";
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";

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

  const adminRoleRef = useMemoFirebase(() => user ? doc(firestore, 'roles_admin', user.uid) : null, [firestore, user]);
  const { data: adminRole } = useDoc(adminRoleRef);
  const isAdmin = !!adminRole;

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

  const handleFormSubmit = async (values: House) => {
    try {
      if (editingHouse) {
        const houseRef = doc(firestore, 'houses', editingHouse.id);
        updateDocumentNonBlocking(houseRef, values);
        toast({ title: "House updated successfully!" });
      } else {
        addDocumentNonBlocking(collection(firestore, 'houses'), values);
        toast({ title: "House added successfully!" });
      }
      handleFormClose();
    } catch (error) {
      console.error("Error submitting form: ", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
    }
  };

  const handleDeleteHouse = async (houseId: string) => {
    if (window.confirm("Are you sure you want to delete this house?")) {
      try {
        const houseRef = doc(firestore, 'houses', houseId);
        deleteDocumentNonBlocking(houseRef);
        toast({ title: "House deleted successfully!" });
        handleDeselectHouse();
      } catch (error) {
        console.error("Error deleting house: ", error);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "Could not delete the house.",
        });
      }
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
          isAdmin={isAdmin}
          onEdit={handleOpenForm}
          onDelete={handleDeleteHouse}
        />
        {isAdmin && (
          <div className="absolute bottom-4 right-4 z-10">
            <Button size="lg" onClick={() => handleOpenForm()}>
              <Plus className="mr-2 h-5 w-5" /> Add House
            </Button>
          </div>
        )}
        {isAdmin && isFormOpen && (
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

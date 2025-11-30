
"use client";

import * as React from "react";
import { House, HouseWithId, Coordinates } from "@/lib/types";
import { Header } from "@/components/homeview/header";
import { PropertyDetails } from "@/components/homeview/property-details";
import Map from "@/components/homeview/map-provider";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, doc, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PropertyForm } from "@/components/homeview/property-form";
import { useToast } from "@/hooks/use-toast";


export default function Home() {
  const [filteredHouses, setFilteredHouses] = React.useState<HouseWithId[] | null>(null);
  const [selectedHouse, setSelectedHouse] = React.useState<HouseWithId | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingHouse, setEditingHouse] = React.useState<HouseWithId | null>(null);

  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const housesCollection = useMemoFirebase(() => firestore ? collection(firestore, "houses"): null, [firestore]);
  const { data: allHouses, isLoading } = useCollection<House>(housesCollection);

  const handleSearch = (searchTerm: string, filters: { rooms: number | null; minPrice: number; maxPrice: number }) => {
    if (!allHouses) return;

    if (!searchTerm) {
      setFilteredHouses(null); // Reset filter, null means all are shown normally
      return;
    }

    const results = allHouses.filter((house) =>
      house.address.toLowerCase().includes(searchTerm.toLowerCase())
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
    if (!firestore) return;

    try {
      const { OpenStreetMapProvider } = await import('leaflet-geosearch');
      
      const provider = new OpenStreetMapProvider({
         params: {
          'polygon_geojson': 1,
          'addressdetails': 1,
         }
      });
      
      const cleanedAddress = `Россия, ${values.address
        .replace(/[гд]\./g, '')
        .replace(/,/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()}`;

      const results = await provider.search({ query: cleanedAddress });
      
      if (results && results.length > 0) {
        const result = results[0];
        let coordinates: Coordinates;

        if (result.raw.geojson && (result.raw.geojson.type === 'Polygon' || result.raw.geojson.type === 'MultiPolygon')) {
          const polygonCoords = result.raw.geojson.type === 'Polygon' 
            ? result.raw.geojson.coordinates[0]
            : result.raw.geojson.coordinates[0][0];
            
          coordinates = {
            type: "Polygon",
            points: polygonCoords.map((p: [number, number]) => ({ lat: p[1], lng: p[0] }))
          };
        } else {
          coordinates = {
            type: "Point",
            points: [{ lat: result.y, lng: result.x }]
          };
        }
        
        const houseData: House = {
          ...values,
          coordinates: coordinates,
        };

        if (editingHouse) {
          const houseRef = doc(firestore, 'houses', editingHouse.id);
          await updateDoc(houseRef, houseData);
          toast({ title: "Данные о доме успешно обновлены" });
        } else {
          await addDoc(collection(firestore, 'houses'), houseData);
          toast({ title: "Дом успешно добавлен" });
        }
        handleFormClose();
      } else {
        toast({
          variant: "destructive",
          title: "Ошибка геокодирования",
          description: "Не удалось найти координаты для указанного адреса.",
        });
      }
    } catch (error: any) {
      console.error("Firestore error:", error);
      toast({
        variant: "destructive",
        title: "Ошибка сохранения дома",
        description: error.message || "Произошла ошибка. Проверьте свои права доступа.",
      });
    }
  };

  const handleDeleteHouse = async (houseId: string) => {
    if (!firestore || !user) {
      toast({
        variant: "destructive",
        title: "Ошибка аутентификации",
        description: "Вы должны быть авторизованы, чтобы удалить дом.",
      });
      return;
    }

    if (!window.confirm("Вы уверены, что хотите удалить этот дом?")) {
      return;
    }

    try {
      const houseRef = doc(firestore, "houses", houseId);
      await deleteDoc(houseRef);

      if (selectedHouse?.id === houseId) {
        setSelectedHouse(null);
      }
      toast({
        title: "Дом успешно удален",
      });
    } catch (error: any) {
      console.error("Error deleting document: ", error);
      toast({
        variant: "destructive",
        title: "Ошибка удаления дома",
        description:
          error.message || "Не удалось удалить дом. Проверьте права доступа.",
      });
    }
  };


  return (
    <div className="relative min-h-screen w-full bg-background">
      <Header onSearch={handleSearch} />
      <main className="relative h-[calc(100vh-4rem)] w-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">Загрузка домов...</div>
        ) : (
          <Map
            houses={allHouses || []}
            highlightedHouses={filteredHouses}
            onSelectHouse={handleSelectHouse}
          />
        )}
        <PropertyDetails
          house={selectedHouse}
          open={!!selectedHouse}
          onOpenChange={handleDeselectHouse}
          isAdmin={!!user}
          onEdit={handleOpenForm}
        />
        {user && (
          <div className="absolute bottom-4 right-4 z-10">
            <Button size="lg" onClick={() => handleOpenForm()}>
              <Plus className="mr-2 h-5 w-5" /> Добавить дом
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

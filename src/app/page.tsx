
"use client";

import * as React from "react";
import { House, HouseWithId, Coordinates } from "@/lib/types";
import { Header } from "@/components/homeview/header";
import { PropertyDetails } from "@/components/homeview/property-details";
import Map from "@/components/homeview/map-provider";
import {
  useCollection,
  useFirestore,
  useUser,
  useMemoFirebase,
  useDoc,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  PropertyForm,
  type FormValues,
} from "@/components/homeview/property-form";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [filteredHouses, setFilteredHouses] = React.useState<
    HouseWithId[] | null
  >(null);
  const [selectedHouse, setSelectedHouse] = React.useState<HouseWithId | null>(
    null
  );
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingHouse, setEditingHouse] = React.useState<HouseWithId | null>(
    null
  );
  const [isPickingLocation, setIsPickingLocation] = React.useState(false);
  const [pickedCoords, setPickedCoords] = React.useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [pickedOsmInfo, setPickedOsmInfo] = React.useState<{ osm_type: string; osm_id: number; } | null>(null);
  const [markerPosition, setMarkerPosition] = React.useState<
    [number, number] | null
  >(null);
  const [pickingToastId, setPickingToastId] = React.useState<
    string | undefined
  >();

  const { user } = useUser();
  const firestore = useFirestore();
  const { toast, dismiss } = useToast();

  const adminRoleRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, "roles_admin", user.uid) : null),
    [firestore, user]
  );
  const { data: adminRole } = useDoc(adminRoleRef);
  const isAdmin = !!adminRole;

  const housesCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, "houses") : null),
    [firestore]
  );
  const { data: allHouses, isLoading } = useCollection<House>(housesCollection);

  React.useEffect(() => {
    // If a house is selected and the list of all houses is available
    if (selectedHouse && allHouses) {
      // Find the latest version of the selected house in the main list
      const updatedVersion = allHouses.find((h) => h.id === selectedHouse.id);

      // If the house still exists in the list (it might have been deleted)
      if (updatedVersion) {
        // To prevent an infinite loop, only update the state if the data has actually changed.
        if (JSON.stringify(selectedHouse) !== JSON.stringify(updatedVersion)) {
          setSelectedHouse(updatedVersion);
        }
      } else {
        // If the house is not in the list anymore, it means it was deleted.
        // Deselect it to close the details panel.
        setSelectedHouse(null);
      }
    }
  }, [allHouses, selectedHouse]);

  const handleSearch = (searchTerm: string) => {
    if (!allHouses) return;

    if (!searchTerm) {
      setFilteredHouses(null);
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
    setPickedCoords(null);
    setPickedOsmInfo(null);
    setMarkerPosition(null);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingHouse(null);
    setIsPickingLocation(false);
    setPickedCoords(null);
    setPickedOsmInfo(null);
    setMarkerPosition(null);
    if (pickingToastId) {
      dismiss(pickingToastId);
      setPickingToastId(undefined);
    }
  };

  const handleMapClick = (latlng: { lat: number; lng: number }) => {
    if (isPickingLocation) {
      if (pickingToastId) {
        dismiss(pickingToastId);
        setPickingToastId(undefined);
      }
      setPickedCoords(latlng);
      setMarkerPosition([latlng.lat, latlng.lng]);
      setIsPickingLocation(false);
      setIsFormOpen(true); // Re-open form
    }
  };

  const handleSetIsPickingLocation = (isPicking: boolean) => {
    setIsPickingLocation(isPicking);
    if (isPicking) {
      const { id } = toast({
        title: "Укажите точку на карте",
        description: "Кликните на карте, чтобы выбрать местоположение дома.",
      });
      setPickingToastId(id);
      setIsFormOpen(false); // Hide form to allow map interaction
    }
  };

  const handleReverseGeocode = async (
    lat: number,
    lng: number
  ): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=ru`
      );
      if (!response.ok) {
        throw new Error("Reverse geocoding request failed");
      }
      const data = await response.json();
      if (data && data.display_name) {
        // We want buildings, which are usually 'way' or 'relation'.
        // If it's just a 'node', it's likely not a building outline we can use.
        if (data.osm_type && data.osm_id && data.osm_type !== 'node') {
          setPickedOsmInfo({ osm_type: data.osm_type, osm_id: data.osm_id });
        } else {
          setPickedOsmInfo(null);
          toast({
            variant: "destructive",
            title: "Контур здания не найден",
            description: "Пожалуйста, кликните точнее на здание. Будет сохранена только точка.",
          });
        }
        return data.display_name;
      }
      toast({
        variant: "destructive",
        title: "Адрес не найден",
        description: "Не удалось найти адрес для этих координат.",
      });
      setPickedOsmInfo(null);
      return null;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      toast({
        variant: "destructive",
        title: "Ошибка определения адреса",
        description:
          "Произошла ошибка при запросе к сервису геокодирования.",
      });
      setPickedOsmInfo(null);
      return null;
    }
  };

  const handleFormSubmit = async (values: FormValues) => {
    if (!firestore) return;

    let houseData: House;

    try {
      let coordinates: Coordinates;

      // If adding a NEW house and we have OSM info from a map click, use that to get a precise polygon.
      if (editingHouse === null && pickedOsmInfo) {
        const osmTypeChar = pickedOsmInfo.osm_type.charAt(0).toUpperCase();
        const osmId = `${osmTypeChar}${pickedOsmInfo.osm_id}`;
        
        const lookupResponse = await fetch(`https://nominatim.openstreetmap.org/lookup?osm_ids=${osmId}&format=jsonv2&polygon_geojson=1`);
        
        if (!lookupResponse.ok) {
            throw new Error('OSM lookup request failed');
        }
        const lookupData = await lookupResponse.json();

        let foundPolygon = false;
        if (lookupData && lookupData.length > 0 && lookupData[0].geojson) {
            const result = lookupData[0];
            if (result.geojson.type === "Polygon") {
                const polygonCoords = result.geojson.coordinates[0];
                coordinates = {
                    type: "Polygon",
                    points: polygonCoords.map((p: [number, number]) => ({ lat: p[1], lng: p[0] })),
                };
                foundPolygon = true;
            } else if (result.geojson.type === "MultiPolygon") {
                // Take the first, usually largest, polygon of a multipolygon
                const polygonCoords = result.geojson.coordinates[0][0]; 
                coordinates = {
                    type: "Polygon",
                    points: polygonCoords.map((p: [number, number]) => ({ lat: p[1], lng: p[0] })),
                };
                foundPolygon = true;
            }
        }

        // Fallback to a single point if lookup fails or doesn't return a polygon
        if (!foundPolygon) {
           if (pickedCoords) {
              coordinates = {
                  type: "Point",
                  points: [{ lat: pickedCoords.lat, lng: pickedCoords.lng }],
              };
           } else {
              // This should not happen if pickedOsmInfo is set
              throw new Error("Не удалось получить координаты для сохранения.");
           }
        }
      } else {
        // Existing logic for editing a house or adding by address string
        const { OpenStreetMapProvider } = await import("leaflet-geosearch");
        const provider = new OpenStreetMapProvider({
          params: { polygon_geojson: 1, addressdetails: 1 },
        });
        const results = await provider.search({ query: values.address });

        if (results && results.length > 0) {
          const result = results[0];
          
          if (
            result.raw.geojson &&
            (result.raw.geojson.type === "Polygon" ||
              result.raw.geojson.type === "MultiPolygon")
          ) {
            const polygonCoords =
              result.raw.geojson.type === "Polygon"
                ? result.raw.geojson.coordinates[0]
                : result.raw.geojson.coordinates[0][0];
            coordinates = {
              type: "Polygon",
              points: polygonCoords.map((p: [number, number]) => ({
                lat: p[1],
                lng: p[0],
              })),
            };
          } else {
            coordinates = {
              type: "Point",
              points: [{ lat: result.y, lng: result.x }],
            };
          }
        } else {
          toast({
            variant: "destructive",
            title: "Ошибка геокодирования",
            description: "Не удалось найти координаты для указанного адреса.",
          });
          return;
        }
      }

      houseData = {
        address: values.address,
        year: values.year,
        buildingSeries: values.buildingSeries,
        floors: values.floors,
        imageUrl: values.imageUrl,
        floorPlans: values.floorPlans.filter((p) => p.url),
        coordinates: coordinates,
      };

    } catch (error: any) {
      console.error("Geocoding/Data processing error:", error);
      toast({
        variant: "destructive",
        title: "Ошибка обработки данных",
        description: error.message || "Произошла ошибка при подготовке данных для сохранения.",
      });
      return;
    }

    if (editingHouse) {
      const houseRef = doc(firestore, "houses", editingHouse.id);
      updateDocumentNonBlocking(houseRef, houseData as any);
      toast({ title: "Данные о доме успешно обновлены" });
    } else {
      const housesCollectionRef = collection(firestore, "houses");
      addDocumentNonBlocking(housesCollectionRef, houseData);
      toast({ title: "Дом успешно добавлен" });
    }
    handleFormClose();
  };

  const handleDeleteHouse = (houseId: string) => {
    if (!firestore || !user) {
      toast({
        variant: "destructive",
        title: "Ошибка аутентификации",
        description: "Вы должны быть авторизованы, чтобы удалить дом.",
      });
      return;
    }

    const houseRef = doc(firestore, "houses", houseId);
    deleteDocumentNonBlocking(houseRef);

    if (selectedHouse?.id === houseId) {
      setSelectedHouse(null);
    }
    toast({
      title: "Дом успешно удален",
    });
  };

  return (
    <div className="relative min-h-screen w-full bg-background">
      <Header onSearch={(searchTerm) => handleSearch(searchTerm)} />
      <main className="relative h-[calc(100vh-4rem)] w-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            Загрузка домов...
          </div>
        ) : (
          <Map
            houses={allHouses || []}
            highlightedHouses={filteredHouses}
            onSelectHouse={handleSelectHouse}
            onMapClick={handleMapClick}
            markerPosition={markerPosition}
            isPickingLocation={isPickingLocation}
          />
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
              <Plus className="mr-2 h-5 w-5" /> Добавить дом
            </Button>
          </div>
        )}
        {isAdmin && (
          <PropertyForm
            open={isFormOpen}
            onOpenChange={handleFormClose}
            onSubmit={handleFormSubmit}
            onReverseGeocode={handleReverseGeocode}
            initialData={editingHouse}
            onSetIsPickingLocation={handleSetIsPickingLocation}
            pickedCoords={pickedCoords}
          />
        )}
      </main>
    </div>
  );
}

    
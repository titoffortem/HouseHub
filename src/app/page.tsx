
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
import { PropertySearch } from "@/components/homeview/property-search";

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

  const handleSearch = (params: {
    searchTerm: string;
    searchType: string;
    city: string;
    searchAllMap: boolean;
  }) => {
    const { searchTerm, searchType, city, searchAllMap } = params;

    if (!allHouses) return;

    const hasTerm = searchTerm && searchTerm.trim() !== "" && searchTerm.trim() !== "-";
    const hasLocation = city.trim();

    const isFilteringByTerm = hasTerm;
    const isFilteringByLocation = (searchType === "year" || searchType === "buildingSeries") && !searchAllMap && hasLocation;

    if (!isFilteringByTerm && !isFilteringByLocation) {
      setFilteredHouses(null);
      return;
    }

    const lowercasedSearchTerm = searchTerm.toLowerCase().trim();
    const lowercasedCity = city.toLowerCase().trim();

    const results = allHouses.filter((house) => {
      // Filter by search term (year, series, address)
      if (isFilteringByTerm) {
        let termMatch = false;
        switch (searchType) {
          case "year": {
            const term = searchTerm.trim();
            if (term.includes("-")) {
              const [fromStr, toStr] = term.split("-");
              const from = fromStr ? parseInt(fromStr, 10) : null;
              const to = toStr ? parseInt(toStr, 10) : null;
              const houseYear = house.year;
              const isFromValid = from !== null && !isNaN(from);
              const isToValid = to !== null && !isNaN(to);

              if (isFromValid && isToValid) {
                if (houseYear >= from && houseYear <= to) termMatch = true;
              } else if (isFromValid) {
                if (houseYear >= from) termMatch = true;
              } else if (isToValid) {
                if (houseYear <= to) termMatch = true;
              }
            } else {
              const year = parseInt(term, 10);
              if (!isNaN(year)) {
                if (house.year === year) termMatch = true;
              }
            }
            break;
          }
          case "buildingSeries": {
            const searchSeries = lowercasedSearchTerm.split(',').map(s => s.trim()).filter(s => s);
            if (searchSeries.length > 0) {
              const houseSeriesLower = house.buildingSeries.toLowerCase();
              if (searchSeries.some(s => houseSeriesLower.includes(s))) {
                termMatch = true;
              }
            }
            break;
          }
          default: // address
            if (house.address.toLowerCase().includes(lowercasedSearchTerm))
              termMatch = true;
            break;
        }
        if (!termMatch) return false;
      }

      // Filter by location (city)
      if (isFilteringByLocation) {
        const houseAddressLower = house.address.toLowerCase();
        const cityMatch = lowercasedCity
          ? houseAddressLower.includes(lowercasedCity)
          : true;

        if (!cityMatch) return false;
      }

      return true;
    });

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
    // Reset picking state when opening form
    setPickedCoords(null);
    setMarkerPosition(null);
    setIsPickingLocation(false);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingHouse(null);
    setIsPickingLocation(false);
    setPickedCoords(null);
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
      // Re-open form with the new coordinates. It will trigger the useEffect in PropertyForm
      setIsFormOpen(true);
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

  const handleReverseGeocode = React.useCallback(async (
    lat: number,
    lng: number
  ): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=ru`
      );
      if (!response.ok) {
        throw new Error("Reverse geocoding request failed");
      }
      const data = await response.json();

      if (data && data.address) {
        const { address } = data;
        const city = address.city || address.town || address.village || "";
        const road = address.road || "";
        const houseNumber = address.house_number || "";
        
        const streetTypes = /улица|проспект|переулок|площадь|шоссе|бульвар|набережная|проезд/gi;
        const cleanedRoad = road.replace(streetTypes, "").trim();

        const formattedAddress = [city, cleanedRoad, houseNumber].filter(Boolean).join(" ");
        
        if (formattedAddress) {
            return formattedAddress;
        }
      }
      
      return data.display_name || null;

    } catch (error) {
      console.error("Reverse geocoding error:", error);
      toast({
        variant: "destructive",
        title: "Ошибка определения адреса",
        description:
          "Произошла ошибка при запросе к сервису геокодирования.",
      });
      return null;
    }
  }, [toast]);

  const handleFormSubmit = async (values: FormValues) => {
    if (!firestore) return;

    let houseData: House;
    let coordinates: Coordinates | undefined;

    try {
      // --- Phase 1: Determine coordinates ---

      // Standard geocoding by address (for edits, manual adds, or as a reliable fallback for map clicks)
      if (values.address) {
        const { OpenStreetMapProvider } = await import("leaflet-geosearch");
        const provider = new OpenStreetMapProvider({
          params: { polygon_geojson: 1, addressdetails: 1, countrycodes: 'ru' },
        });
        const results = await provider.search({ query: values.address });

        if (results && results.length > 0) {
          const result = results[0];
          const geojson = (result.raw as any).geojson;
          if (
            geojson &&
            (geojson.type === "Polygon" || geojson.type === "MultiPolygon")
          ) {
            const polygonCoords =
              geojson.type === "Polygon"
                ? geojson.coordinates[0]
                : geojson.coordinates[0][0];
            coordinates = {
              type: "Polygon",
              points: polygonCoords.map((p: [number, number]) => ({
                lat: p[1],
                lng: p[0],
              })),
            };
          } else {
            // If geocoding finds a result but no polygon, use its point.
            coordinates = {
              type: "Point",
              points: [{ lat: result.y, lng: result.x }],
            };
          }
        }
      }

      // C. Final fallback for new houses if all geocoding fails: use the clicked point.
      if (!coordinates && editingHouse === null && pickedCoords) {
          coordinates = {
              type: "Point",
              points: [{ lat: pickedCoords.lat, lng: pickedCoords.lng }],
          };
      }

      // If after all attempts, we still don't have coordinates, show an error.
      if (!coordinates) {
        toast({
          variant: "destructive",
          title: "Ошибка геокодирования",
          description: "Не удалось найти координаты для указанного адреса. Попробуйте указать точнее.",
        });
        return;
      }
      
      // Save the location to localStorage for the next visit
      if (coordinates && coordinates.points.length > 0) {
        const lastLocation = {
          lat: coordinates.points[0].lat,
          lng: coordinates.points[0].lng,
          zoom: 13, // A reasonable default zoom level
        };
        localStorage.setItem('lastHouseLocation', JSON.stringify(lastLocation));
      }
      
      // --- Phase 2: Assemble and save data ---
      houseData = {
        address: values.address,
        year: values.year,
        buildingSeries: values.buildingSeries,
        floors: values.floors,
        imageUrl: values.imageUrl,
        floorPlans: values.floorPlans,
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

    // --- Phase 3: Firestore operation ---
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
      <Header />
      <main className="relative h-[calc(100vh-4rem)] w-full">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl px-4">
            <PropertySearch onSearch={handleSearch} />
        </div>
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
            <Button size="lg" className="bg-black text-white hover:bg-black/90" onClick={() => handleOpenForm()}>
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

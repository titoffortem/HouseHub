
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
import { List, Plus } from "lucide-react";
import {
  PropertyForm,
  type FormValues,
} from "@/components/homeview/property-form";
import { useToast } from "@/hooks/use-toast";
import { SearchResultsList } from "@/components/homeview/search-results-list";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function Home() {
  const [filteredHouses, setFilteredHouses] = React.useState<
    HouseWithId[] | null
  >(null);
  const [selectedHouse, setSelectedHouse] = React.useState<HouseWithId | null>(
    null
  );
  const [mapFocusHouse, setMapFocusHouse] = React.useState<HouseWithId | null>(
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
  const [returnToList, setReturnToList] = React.useState(false);
  const [panelView, setPanelView] = React.useState<'list' | 'details' | null>(null);
  const [osmFetchedCoords, setOsmFetchedCoords] = React.useState<Coordinates | null>(null);

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
        setPanelView(null);
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
    
    setPanelView(null);
    setSelectedHouse(null);
    setMapFocusHouse(null);
    setReturnToList(false);
    
    const hasTerm = searchTerm.trim() !== "" && searchTerm.trim() !== "-";
    const hasLocation = !searchAllMap && city.trim() !== "";

    if (!hasTerm && !hasLocation) {
      setFilteredHouses(null);
      return;
    }
    
    const lowercasedSearchTerm = searchTerm.toLowerCase().trim();
    const lowercasedCity = city.toLowerCase().trim();

    // Helper to parse year string into a [from, to] tuple.
    const parseYearRange = (yearStr: string): [number, number] | null => {
        if (!yearStr) return null;
        if (yearStr.includes("-")) {
            const parts = yearStr.split("-");
            const from = parts[0] ? parseInt(parts[0], 10) : -Infinity;
            const to = parts[1] ? parseInt(parts[1], 10) : Infinity;
            if (isNaN(from) && isNaN(to)) return null;
            return [from, to];
        }
        const year = parseInt(yearStr, 10);
        return isNaN(year) ? null : [year, year];
    };

    const results = allHouses.filter((house) => {
      // If there's a location filter, it must match
      if (hasLocation) {
        if (!house.address.toLowerCase().includes(lowercasedCity)) {
          return false;
        }
      }

      // If there's no term filter, the house passes (since we already checked location)
      if (!hasTerm) {
        return true;
      }

      // Check against the term filter
      switch (searchType) {
        case "address":
          return house.address.toLowerCase().includes(lowercasedSearchTerm);
        case "year": {
          const searchTermRange = parseYearRange(searchTerm.trim());
          if (!searchTermRange) return false;
          const [searchFrom, searchTo] = searchTermRange;

          const houseYearRange = parseYearRange(String(house.year));
          if (!houseYearRange) return false;
          const [houseFrom, houseTo] = houseYearRange;

          // Check for interval overlap: search range must overlap with house's year range
          return Math.max(searchFrom, houseFrom) <= Math.min(searchTo, houseTo);
        }
        case "buildingSeries": {
          const searchSeries = lowercasedSearchTerm.split(',').map(s => s.trim()).filter(s => s);
          const houseSeries = house.buildingSeries;

          if (Array.isArray(houseSeries)) {
            // Check if any of the search terms is a substring of any of the house's series.
            return searchSeries.some(searchTerm => 
              houseSeries.some(houseTerm => houseTerm.toLowerCase().includes(searchTerm))
            );
          } else if (typeof houseSeries === 'string') { // Backward compatibility
            const houseSeriesLower = (houseSeries as string).toLowerCase();
            return searchSeries.some(s => houseSeriesLower.includes(s));
          }
          
          return false;
        }
        default:
          return true;
      }
    });
    
    setFilteredHouses(results);
  };

  const handleSelectHouse = (house: HouseWithId) => {
    setSelectedHouse(house);
    setMapFocusHouse(house);
    setPanelView('details');
    setReturnToList(false);
  };

  const handleSelectHouseFromList = (house: HouseWithId) => {
    setSelectedHouse(house);
    setMapFocusHouse(house);
    setPanelView('details');
    setReturnToList(true);
  };
  
  const handlePanelOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // This logic is when user clicks the 'X' on the sheet.
      if (panelView === 'details' && returnToList) {
          // If they were viewing details from a list, go back to the list.
          setPanelView('list');
          setSelectedHouse(null); // Deselect house to hide details view
      } else {
          // Otherwise, just close everything.
          setPanelView(null);
          setSelectedHouse(null);
          setReturnToList(false);
          // Keep map focused
      }
    }
  };

  const handleOpenForm = (house?: HouseWithId) => {
    setEditingHouse(house || null);
    setIsFormOpen(true);
    // Reset picking state when opening form
    setPickedCoords(null);
    setMarkerPosition(null);
    setIsPickingLocation(false);
    setOsmFetchedCoords(null);
  };

  const handleFormClose = React.useCallback(() => {
    setIsFormOpen(false);
    setEditingHouse(null);
    setIsPickingLocation(false);
    setPickedCoords(null);
    setMarkerPosition(null);
    setOsmFetchedCoords(null);
    if (pickingToastId) {
      dismiss(pickingToastId);
      setPickingToastId(undefined);
    }
  }, [pickingToastId, dismiss]);

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

  const handleFetchFromOSM = React.useCallback(async (osmId: string): Promise<Partial<FormValues> | null> => {
    if (!/^\d+$/.test(osmId)) {
        toast({
            variant: "destructive",
            title: "Неверный ID",
            description: "OSM ID должен состоять только из цифр.",
        });
        return null;
    }

    try {
        const response = await fetch(`https://overpass-api.de/api/interpreter?data=[out:json];(rel(${osmId});way(${osmId}););(._;>;);out geom;`);
        if (!response.ok) {
            throw new Error('OSM Overpass API request failed');
        }
        const data = await response.json();
        
        const elementWithGeometry = data.elements?.find((el: any) => el.type === 'way' && el.geometry);

        if (!elementWithGeometry) {
            toast({
                variant: "destructive",
                title: "Ничего не найдено",
                description: "Не удалось найти объект с таким ID или у него нет геометрии.",
            });
            return null;
        }

        const coordinates: Coordinates = {
            type: 'Polygon',
            points: elementWithGeometry.geometry.map((p: { lat: number; lon: number }) => ({ lat: p.lat, lng: p.lon }))
        };
        setOsmFetchedCoords(coordinates);
        
        if (coordinates.points.length > 0) {
          const tempHouse: HouseWithId = {
            id: 'temp-focus',
            coordinates,
            address: '',
            year: '',
            buildingSeries: [],
            floors: 0,
            imageUrl: '',
            floorPlans: []
          };
          setMapFocusHouse(tempHouse);
        }

        const mainElement = data.elements?.find((el: any) => el.id.toString() === osmId);
        const tags = mainElement?.tags || elementWithGeometry.tags || {};
        const street = tags['addr:street'] || '';
        const houseNumber = tags['addr:housenumber'] || '';
        const city = tags['addr:city'] || '';
        const address = [city, street, houseNumber].filter(Boolean).join(', ');
        
        const floorsStr = tags['building:levels'];

        return {
            address: address || "Адрес не найден в тегах OSM",
            year: tags['start_date'] || '',
            floors: floorsStr ? parseInt(floorsStr, 10) : undefined,
            osmId: osmId
        };
    } catch (error) {
        console.error("OSM Fetch error:", error);
        toast({
            variant: "destructive",
            title: "Ошибка загрузки из OSM",
            description: "Произошла ошибка при запросе к Overpass API.",
        });
        return null;
    }
}, [toast]);

  const handleFormSubmit = React.useCallback(async (values: FormValues) => {
    if (!firestore) return;

    let houseData: House;
    let coordinates: Coordinates | undefined;

    try {
        if (values.inputType === 'coords') {
            if (pickedCoords) {
                coordinates = {
                    type: "Point",
                    points: [{ lat: pickedCoords.lat, lng: pickedCoords.lng }],
                };
            } else if (editingHouse) {
                coordinates = editingHouse.coordinates;
            } else {
                toast({
                  variant: "destructive",
                  title: "Местоположение не выбрано",
                  description: "Пожалуйста, укажите точку на карте, прежде чем сохранять.",
                });
                return;
            }
        } else if (values.inputType === 'osm') {
            if (osmFetchedCoords) {
                coordinates = osmFetchedCoords;
            } else if (editingHouse && editingHouse.osmId === values.osmId) {
                coordinates = editingHouse.coordinates;
            } else {
                 toast({
                  variant: "destructive",
                  title: "Ошибка данных OSM",
                  description: "Пожалуйста, нажмите 'Загрузить', чтобы получить данные из OSM, прежде чем сохранять.",
                });
                return;
            }
        } else { // inputType is 'address'
            if (editingHouse && editingHouse.address === values.address) {
                // Address is unchanged on an existing house, so reuse old coordinates.
                coordinates = editingHouse.coordinates;
            } else {
                // New house, or address has changed on an existing house. Geocode it directly.
                const searchParams = new URLSearchParams({
                    q: values.address,
                    format: 'json',
                    polygon_geojson: '1',
                    addressdetails: '1',
                    countrycodes: 'ru'
                });

                const geocodeResponse = await fetch(`https://nominatim.openstreetmap.org/search?${searchParams.toString()}`);
                
                if (!geocodeResponse.ok) {
                    throw new Error("Geocoding request failed");
                }

                const results = await geocodeResponse.json();

                if (results && results.length > 0) {
                    const result = results[0]; // Take the first, most relevant result
                    const geojson = result.geojson;

                    if (geojson && (geojson.type === "Polygon" || geojson.type === "MultiPolygon")) {
                        const polygonCoords = geojson.type === "Polygon" ? geojson.coordinates[0] : geojson.coordinates[0][0];
                        coordinates = { type: "Polygon", points: polygonCoords.map((p: [number, number]) => ({ lat: p[1], lng: p[0] })) };
                    } else {
                        // Fallback to point if no polygon is found
                        coordinates = { type: "Point", points: [{ lat: parseFloat(result.lat), lng: parseFloat(result.lon) }] };
                    }
                }
            }
        }
      
      // If after all attempts, we still don't have coordinates, show an error.
      if (!coordinates) {
        toast({
          variant: "destructive",
          title: "Ошибка геокодирования",
          description: "Не удалось найти координаты для указанного адреса. Попробуйте указать точнее или через OSM ID.",
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
        osmId: values.osmId || "",
        address: values.address,
        year: values.year,
        buildingSeries: values.buildingSeries.split(',').map(s => s.trim()).filter(Boolean),
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
  }, [firestore, toast, editingHouse, pickedCoords, osmFetchedCoords, handleFormClose]);

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

    toast({
      title: "Дом успешно удален",
    });
    setPanelView(null);
    setSelectedHouse(null);
  };

  return (
    <div className="relative h-screen w-full bg-background flex flex-col">
      <Header onSearch={handleSearch} />
      <main className="relative flex-1 grid">
          <div className="relative h-full w-full">
            {isLoading && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-20">
                Загрузка домов...
              </div>
            )}
            <Map
              houses={allHouses || []}
              highlightedHouses={filteredHouses}
              selectedHouse={selectedHouse}
              mapFocusHouse={mapFocusHouse}
              onSelectHouse={handleSelectHouse}
              onMapClick={handleMapClick}
              markerPosition={markerPosition}
              isPickingLocation={isPickingLocation}
            />
          </div>
        
        <div className="absolute bottom-4 left-4 z-10">
          {filteredHouses && filteredHouses.length > 0 && !panelView && (
            <Button size="lg" variant="secondary" onClick={() => setPanelView('list')}>
              <List className="mr-2 h-5 w-5" /> Показать список ({filteredHouses.length})
            </Button>
          )}
        </div>
        <div className="absolute bottom-4 right-4 z-10">
          {isAdmin && (
            <Button size="lg" className="bg-black text-white hover:bg-black/90" onClick={() => handleOpenForm()}>
              <Plus className="mr-2 h-5 w-5" /> Добавить дом
            </Button>
          )}
        </div>

        <Sheet open={!!panelView} onOpenChange={handlePanelOpenChange}>
          <SheetContent className="w-full sm:w-[540px] p-0 flex flex-col" side="left">
            <div style={{ display: panelView === 'list' ? 'flex' : 'none' }} className="h-full w-full flex-col">
              {filteredHouses && (
                <SearchResultsList
                  houses={filteredHouses}
                  onSelectHouse={handleSelectHouseFromList}
                />
              )}
            </div>
            <div style={{ display: panelView === 'details' ? 'flex' : 'none' }} className="h-full w-full flex-col">
              {selectedHouse && (
                <PropertyDetails
                  house={selectedHouse}
                  isAdmin={isAdmin}
                  onEdit={handleOpenForm}
                  onDelete={handleDeleteHouse}
                />
              )}
            </div>
          </SheetContent>
        </Sheet>

        {isAdmin && (
          <PropertyForm
            open={isFormOpen}
            onOpenChange={handleFormClose}
            onSubmit={handleFormSubmit}
            onReverseGeocode={handleReverseGeocode}
            initialData={editingHouse}
            onSetIsPickingLocation={handleSetIsPickingLocation}
            pickedCoords={pickedCoords}
            onFetchFromOSM={handleFetchFromOSM}
          />
        )}
      </main>
    </div>
  );
}

    

    
"use client";

import * as React from "react";
import { House } from "@/lib/types";
import { houses as allHouses } from "@/lib/data";
import { Header } from "@/components/homeview/header";
import { PropertySearch } from "@/components/homeview/property-search";
import { PropertyDetails } from "@/components/homeview/property-details";
import Map from "@/components/homeview/map-provider";

export default function Home() {
  const [filteredHouses, setFilteredHouses] = React.useState<House[]>(allHouses);
  const [selectedHouse, setSelectedHouse] = React.useState<House | null>(null);

  const handleSearch = (searchTerm: string, filters: { rooms: number | null, minPrice: number, maxPrice: number }) => {
    let results = allHouses;

    if (searchTerm) {
      results = results.filter(house =>
        house.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filters.rooms) {
        results = results.filter(house => house.rooms === filters.rooms);
    }
    
    results = results.filter(house => house.price >= filters.minPrice && house.price <= filters.maxPrice);

    setFilteredHouses(results);
  };
  
  const handleSelectHouse = (house: House) => {
    setSelectedHouse(house);
  };

  const handleDeselectHouse = () => {
    setSelectedHouse(null);
  }

  return (
    <div className="relative min-h-screen w-full bg-background">
      <Header />
      <main className="relative h-[calc(100vh-4rem)] w-full">
        <PropertySearch onSearch={handleSearch} />
        <Map houses={filteredHouses} onSelectHouse={handleSelectHouse} />
        <PropertyDetails house={selectedHouse} open={!!selectedHouse} onOpenChange={handleDeselectHouse} />
      </main>
    </div>
  );
}


"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface PropertySearchProps {
  onSearch: (searchTerm: string, filters: { rooms: number | null, minPrice: number, maxPrice: number }) => void;
}

export function PropertySearch({ onSearch }: PropertySearchProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  
  // These filters are no longer used, but we keep the state in case they are re-added.
  const [rooms, setRooms] = React.useState<number | null>(null);
  const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 99999999]);

  const handleSearch = () => {
    onSearch(searchTerm, { rooms, minPrice: priceRange[0], maxPrice: priceRange[1] });
  };
  
  const handleClearFilters = () => {
    setSearchTerm("");
    setRooms(null);
    setPriceRange([0, 99999999]);
    onSearch("", { rooms: null, minPrice: 0, maxPrice: 99999999 });
  }

  return (
    <div className="w-full max-w-lg">
      <div className="flex items-center gap-2 rounded-lg bg-background p-1 shadow-sm border">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Поиск по адресу..."
            className="w-full pl-10 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} variant="accent" size="sm">
          Поиск
        </Button>
         <Button onClick={handleClearFilters} variant="ghost" size="icon" className="h-8 w-8">
            <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

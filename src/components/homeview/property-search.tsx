"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SlidersHorizontal, Search, X } from "lucide-react";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Slider } from "../ui/slider";

interface PropertySearchProps {
  onSearch: (searchTerm: string, filters: { rooms: number | null, minPrice: number, maxPrice: number }) => void;
}

export function PropertySearch({ onSearch }: PropertySearchProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  
  // These filters are no longer used, but we keep the state in case they are re-added.
  // The UI for them is removed.
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
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-lg px-4">
      <div className="flex items-center gap-2 rounded-lg bg-card p-2 shadow-lg border">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by address..."
            className="w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        {/* Popover for filters is hidden as filters are removed */}
        <Button onClick={handleSearch} variant="accent">
          Search
        </Button>
         <Button onClick={handleClearFilters} variant="ghost" size="icon">
            <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

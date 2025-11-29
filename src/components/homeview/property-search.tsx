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
  const [rooms, setRooms] = React.useState<number | null>(null);
  const [priceRange, setPriceRange] = React.useState<[number, number]>([100000, 1000000]);

  const handleSearch = () => {
    onSearch(searchTerm, { rooms, minPrice: priceRange[0], maxPrice: priceRange[1] });
  };
  
  const handleClearFilters = () => {
    setSearchTerm("");
    setRooms(null);
    setPriceRange([100000, 1000000]);
    onSearch("", { rooms: null, minPrice: 100000, maxPrice: 1000000 });
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
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none font-headline">Filters</h4>
                <p className="text-sm text-muted-foreground">
                  Refine your search results.
                </p>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="rooms">Rooms</Label>
                  <Select onValueChange={(value) => setRooms(value === 'any' ? null : Number(value))} value={rooms ? String(rooms) : 'any'}>
                    <SelectTrigger id="rooms" className="col-span-2 h-8">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Price Range</Label>
                  <div className="text-sm text-muted-foreground">
                    ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
                  </div>
                   <Slider
                    defaultValue={[100000, 1000000]}
                    min={0}
                    max={1000000}
                    step={50000}
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSearch} size="sm">Apply</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
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

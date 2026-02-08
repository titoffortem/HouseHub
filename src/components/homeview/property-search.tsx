
"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "../ui/separator";

interface PropertySearchProps {
  onSearch: (params: {
    searchTerm: string;
    searchType: string;
    city: string;
    region: string;
    searchAllMap: boolean;
  }) => void;
}

export function PropertySearch({ onSearch }: PropertySearchProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [yearFrom, setYearFrom] = React.useState("");
  const [yearTo, setYearTo] = React.useState("");
  const [searchType, setSearchType] = React.useState("address");
  const [city, setCity] = React.useState("");
  const [region, setRegion] = React.useState("");
  const [searchAllMap, setSearchAllMap] = React.useState(true);

  const handleSearch = () => {
    let term = searchTerm;
    if (searchType === "year") {
      // For single year, user can just fill the 'From' field.
      // For range, they fill both.
      if (yearFrom && !yearTo) {
        term = yearFrom;
      } else {
        term = `${yearFrom}-${yearTo}`;
      }
    }
    onSearch({ searchTerm: term, searchType, city, region, searchAllMap });
  };
  
  const handleClear = () => {
    setSearchTerm("");
    setYearFrom("");
    setYearTo("");
    setCity("");
    setRegion("");
    setSearchAllMap(true);
    onSearch({ searchTerm: "", searchType, city: "", region: "", searchAllMap: true });
  };

  const handleSearchTypeChange = (value: string) => {
    setSearchType(value);
    setSearchTerm("");
    setYearFrom("");
    setYearTo("");
    // Don't clear city/region to allow switching between search types with location
    onSearch({ searchTerm: "", searchType: value, city, region, searchAllMap });
  };

  return (
    <div className="relative w-full max-w-xl">
      <div className="flex items-center gap-2 rounded-lg bg-card p-1 shadow-sm border">
        <Select value={searchType} onValueChange={handleSearchTypeChange}>
          <SelectTrigger className="w-[120px] h-9 border-0 focus:ring-0 focus:ring-offset-0 bg-transparent shadow-none text-muted-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="address">По адресу</SelectItem>
            <SelectItem value="year">По году</SelectItem>
            <SelectItem value="buildingSeries">По серии</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative flex-grow flex items-center">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          {searchType === 'year' ? (
              <div className="flex w-full items-center">
                  <Input
                      type="number"
                      placeholder="От"
                      className="w-full pl-10 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent h-9"
                      value={yearFrom}
                      onChange={(e) => setYearFrom(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <span className="text-muted-foreground px-1">-</span>
                  <Input
                      type="number"
                      placeholder="До"
                      className="w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent h-9"
                      value={yearTo}
                      onChange={(e) => setYearTo(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
              </div>
          ) : (
              <Input
                  type='text'
                  placeholder={
                      searchType === 'address' ? 'Поиск по адресу...' :
                      'Введите серию...'
                  }
                  className="w-full pl-10 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent h-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
          )}
        </div>
        <Button onClick={handleSearch} variant="accent" size="sm">
          Поиск
        </Button>
         <Button onClick={handleClear} variant="ghost" size="icon" className="h-8 w-8">
            <X className="h-5 w-5" />
        </Button>
      </div>
       {searchType === 'year' && (
        <div className="absolute top-full z-10 mt-2 w-full flex items-center gap-2 rounded-lg bg-background p-1 shadow-sm border text-sm">
            <Input 
                type="text"
                placeholder="Город"
                className="h-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={searchAllMap}
            />
             <Separator orientation="vertical" className="h-6" />
            <Input 
                type="text"
                placeholder="Область/Регион"
                className="h-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                disabled={searchAllMap}
            />
             <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center space-x-2 whitespace-nowrap px-3">
                <Checkbox id="all-map" checked={searchAllMap} onCheckedChange={(checked) => setSearchAllMap(!!checked)} />
                <Label htmlFor="all-map" className="font-normal text-muted-foreground">По всей карте</Label>
            </div>
        </div>
      )}
    </div>
  );
}

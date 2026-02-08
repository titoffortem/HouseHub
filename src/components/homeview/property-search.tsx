
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

interface PropertySearchProps {
  onSearch: (searchTerm: string, searchType: string) => void;
}

export function PropertySearch({ onSearch }: PropertySearchProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [yearFrom, setYearFrom] = React.useState("");
  const [yearTo, setYearTo] = React.useState("");
  const [searchType, setSearchType] = React.useState("address");

  const handleSearch = () => {
    if (searchType === "year") {
      // For single year, user can just fill the 'From' field.
      // For range, they fill both.
      if (yearFrom && !yearTo) {
        onSearch(yearFrom, searchType);
      } else {
        const term = `${yearFrom}-${yearTo}`;
        onSearch(term, searchType);
      }
    } else {
      onSearch(searchTerm, searchType);
    }
  };
  
  const handleClear = () => {
    setSearchTerm("");
    setYearFrom("");
    setYearTo("");
    onSearch("", searchType);
  };

  const handleSearchTypeChange = (value: string) => {
    setSearchType(value);
    handleClear(); // Clear inputs when changing search type
  };

  return (
    <div className="w-full max-w-lg">
      <div className="flex items-center gap-2 rounded-lg bg-background p-1 shadow-sm border">
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
    </div>
  );
}

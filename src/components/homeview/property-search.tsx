
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
  const [searchType, setSearchType] = React.useState("address");

  const handleSearch = () => {
    onSearch(searchTerm, searchType);
  };
  
  const handleClear = () => {
    setSearchTerm("");
    onSearch("", searchType);
  }

  return (
    <div className="w-full max-w-lg">
      <div className="flex items-center gap-2 rounded-lg bg-background p-1 shadow-sm border">
        <Select value={searchType} onValueChange={(value) => { setSearchType(value); setSearchTerm(''); onSearch('', value); }}>
          <SelectTrigger className="w-[120px] h-9 border-0 focus:ring-0 focus:ring-offset-0 bg-transparent shadow-none text-muted-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="address">По адресу</SelectItem>
            <SelectItem value="year">По году</SelectItem>
            <SelectItem value="buildingSeries">По серии</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type={searchType === 'year' ? 'number' : 'text'}
            placeholder={
                searchType === 'address' ? 'Поиск по адресу...' :
                searchType === 'year' ? 'Введите год...' :
                'Введите серию...'
            }
            className="w-full pl-10 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
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

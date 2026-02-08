"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HouseWithId } from "@/lib/types";
import Image from "next/image";
import { Building, Calendar } from "lucide-react";

interface SearchResultsListProps {
  houses: HouseWithId[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectHouse: (house: HouseWithId) => void;
}

export function SearchResultsList({
  houses,
  open,
  onOpenChange,
  onSelectHouse,
}: SearchResultsListProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-[540px] p-0 flex flex-col" side="left">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="font-headline text-2xl">
            Результаты поиска
          </SheetTitle>
          <SheetDescription>
            Найдено домов: {houses.length}. Нажмите на дом, чтобы просмотреть детали.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow">
          <div className="flex flex-col">
            {houses.map((house) => (
              <button
                key={house.id}
                onClick={() => onSelectHouse(house)}
                className="flex items-center gap-4 p-4 text-left border-b hover:bg-accent/50 transition-colors w-full"
              >
                <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  {house.imageUrl ? (
                    <Image
                      src={house.imageUrl}
                      alt={`Фото ${house.address}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 80px, 96px"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full">
                        <Building className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <p className="font-semibold text-foreground leading-tight">
                    {house.address}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span>{house.year}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Building className="h-4 w-4" />
                      <span>{house.buildingSeries}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

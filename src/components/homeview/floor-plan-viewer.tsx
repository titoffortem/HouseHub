
"use client";

import { useState } from "react";
import Image from "next/image";
import { HouseWithId } from "@/lib/types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";

interface FloorPlanViewerProps {
  house: HouseWithId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FloorPlanViewer({
  house,
  open,
  onOpenChange,
}: FloorPlanViewerProps) {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);

  // When the dialog closes, reset the selected floor
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedFloor(null);
    }
    onOpenChange(isOpen);
  };

  const getFloorPlanUrl = (floor: number) => {
    try {
      const url = new URL(house.floorPlanUrl);
      const parts = url.pathname.split('/');
      if (parts.length >= 3 && parts[1] === 'seed') {
        const seed = parts[2];
        parts[2] = `${seed}-floor-${floor}`;
        url.pathname = parts.join('/');
        return url.toString();
      }
    } catch (e) {
      // Fallback for invalid URLs
    }
    // Simple fallback if URL structure is not as expected
    return house.floorPlanUrl.replace('/new/', `/floor-${floor}/`);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-screen h-screen max-w-full max-h-full bg-black/90 p-4 sm:p-6 flex flex-col border-0 rounded-none">
        <DialogTitle className="sr-only">
          {selectedFloor ? `Floor plan for floor ${selectedFloor}` : "Select a floor to view its plan"}
        </DialogTitle>
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          {selectedFloor && (
            <Button
              size="icon"
              variant="secondary"
              onClick={() => setSelectedFloor(null)}
              aria-label="Back to floor list"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Button
            size="icon"
            variant="secondary"
            onClick={() => handleOpenChange(false)}
            aria-label="Close viewer"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-grow flex items-center justify-center relative">
          {selectedFloor ? (
            <div className="relative w-full h-full">
              <Image
                src={getFloorPlanUrl(selectedFloor)}
                alt={`Floor plan for floor ${selectedFloor}`}
                fill
                className="object-contain"
                sizes="100vw"
                data-ai-hint={`${house.floorPlanHint} floor ${selectedFloor}`}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-white">
              <h2 className="text-2xl md:text-3xl font-headline">Выберите этаж</h2>
              <ScrollArea className="h-[70vh] w-full max-w-xs">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-1">
                  {Array.from({ length: house.floors }, (_, i) => i + 1).map(
                    (floor) => (
                      <Button
                        key={floor}
                        variant="outline"
                        className="aspect-square h-auto w-auto text-lg bg-transparent text-white hover:bg-white/20"
                        onClick={() => setSelectedFloor(floor)}
                      >
                        {floor}
                      </Button>
                    )
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

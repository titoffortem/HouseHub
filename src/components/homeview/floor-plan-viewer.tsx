
"use client";

import { useState } from "react";
import Image from "next/image";
import { HouseWithId } from "@/lib/types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

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
  const [selectedFloorIndex, setSelectedFloorIndex] = useState<number | null>(null);

  // When the dialog closes, reset the selected floor
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedFloorIndex(null);
    }
    onOpenChange(isOpen);
  };
  
  const selectedPlan = selectedFloorIndex !== null ? house.floorPlans[selectedFloorIndex] : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-screen h-screen max-w-full max-h-full bg-black/90 p-4 sm:p-6 flex flex-col border-0 rounded-none">
        <DialogTitle className="sr-only">
          {selectedPlan ? `План этажа ${selectedFloorIndex! + 1}` : "Выберите этаж для просмотра плана"}
        </DialogTitle>
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          {selectedPlan && (
            <Button
              size="icon"
              variant="secondary"
              onClick={() => setSelectedFloorIndex(null)}
              aria-label="Вернуться к списку этажей"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Button
            size="icon"
            variant="secondary"
            onClick={() => handleOpenChange(false)}
            aria-label="Закрыть просмотр"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-grow flex items-center justify-center relative">
          {selectedPlan ? (
            <div className="relative w-full h-full">
              <Image
                src={selectedPlan.url}
                alt={`План этажа ${selectedFloorIndex! + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-white">
              <h2 className="text-2xl md:text-3xl font-headline">Выберите этаж</h2>
              <ScrollArea className="h-[70vh] w-full max-w-xs">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-1">
                  {house.floorPlans.map(
                    (plan, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="aspect-square h-auto w-auto text-lg bg-transparent text-white hover:bg-white/20"
                        onClick={() => setSelectedFloorIndex(index)}
                        disabled={!plan.url}
                      >
                        {index + 1}
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

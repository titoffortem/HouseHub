
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { HouseWithId } from "@/lib/types";
import {
  Building,
  Calendar,
  ChevronsUpDown,
  Pencil,
  Trash2,
} from "lucide-react";
import { FloorPlan } from "./floor-plan";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { FloorPlanViewer } from "./floor-plan-viewer";


interface PropertyDetailsProps {
  house: HouseWithId | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin: boolean;
  onEdit: (house: HouseWithId) => void;
}

const DetailItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => (
  <div className="flex items-start gap-3">
    <div className="text-muted-foreground mt-1">{icon}</div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  </div>
);

export function PropertyDetails({
  house,
  open,
  onOpenChange,
  isAdmin,
  onEdit,
}: PropertyDetailsProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    // Close the viewer if the main sheet is closed
    if (!open) {
      setIsViewerOpen(false);
    }
  }, [open]);

  if (!house) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:w-[540px] p-0 flex flex-col" side="left">
          <ScrollArea className="flex-grow">
            <FloorPlan
              src={house.floorPlanUrl}
              alt={`Photo of ${house.address}`}
              hint={"photo of modern building"}
            />
            <div className="p-6">
              <SheetHeader>
                <SheetTitle className="font-headline text-2xl">
                  {house.address}
                </SheetTitle>
              </SheetHeader>
            </div>
            <Separator />
            <div className="p-6">
              <h3 className="text-lg font-headline font-semibold mb-4">
                Property Details
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                <DetailItem
                  icon={<Calendar className="h-5 w-5" />}
                  label="Year Built"
                  value={house.year}
                />
                <DetailItem
                  icon={<Building className="h-5 w-5" />}
                  label="Building Series"
                  value={house.buildingSeries}
                />
                <div className="flex items-center justify-between col-span-2">
                   <DetailItem
                    icon={<ChevronsUpDown className="h-5 w-5" />}
                    label="Floors"
                    value={house.floors}
                  />
                  <Button variant="outline" size="sm" onClick={() => setIsViewerOpen(true)}>
                    Посмотреть планировки
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
          {isAdmin && (
            <>
              <Separator />
              <SheetFooter className="p-4 flex-shrink-0">
                <div className="flex w-full gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => onEdit(house)}
                  >
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </Button>
                </div>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
      {house && (
        <FloorPlanViewer
          house={house}
          open={isViewerOpen}
          onOpenChange={setIsViewerOpen}
        />
      )}
    </>
  );
}

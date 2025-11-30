import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { HouseWithId } from "@/lib/types";
import {
  Building,
  Calendar,
  Check,
  ChevronsUpDown,
  Layers3,
  Trash2 as TrashIcon,
  X,
  Pencil,
} from "lucide-react";
import { FloorPlan } from "./floor-plan";
import { Button } from "../ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";

interface PropertyDetailsProps {
  house: HouseWithId | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin: boolean;
  onEdit: (house: HouseWithId) => void;
  onDelete: (houseId: string) => void;
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

const BooleanItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: boolean;
}) => (
  <div className="flex items-center gap-3">
    <div className="text-muted-foreground">{icon}</div>
    <p className="font-medium text-foreground">{label}</p>
    {value ? (
      <Check className="h-5 w-5 text-green-500" />
    ) : (
      <X className="h-5 w-5 text-destructive" />
    )}
  </div>
);

export function PropertyDetails({
  house,
  open,
  onOpenChange,
  isAdmin,
  onEdit,
  onDelete,
}: PropertyDetailsProps) {
  if (!house) return null;
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);

  const getFloorPlanUrl = (floor: number) => {
    // Attempt to create a unique URL per floor by modifying the seed
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
      // Fallback if URL is not standard
    }
    return house.floorPlanUrl;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-[540px] p-0 flex flex-col" side="left">
        <ScrollArea className="flex-grow">
          <div className="p-6">
            <SheetHeader>
              <SheetTitle className="font-headline text-2xl">
                {house.address}
              </SheetTitle>
              <SheetDescription className="flex items-center gap-2 text-lg">
                {house.price.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
              </SheetDescription>
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
              <DetailItem
                icon={<ChevronsUpDown className="h-5 w-5" />}
                label="Floors"
                value={house.floors}
              />
              <div className="col-span-2 grid grid-cols-2 gap-4">
                <BooleanItem
                  icon={<Layers3 className="h-5 w-5" />}
                  label="Elevator"
                  value={house.hasElevator}
                />
                <BooleanItem
                  icon={<TrashIcon className="h-5 w-5" />}
                  label="Garbage Chute"
                  value={house.hasGarbageChute}
                />
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full mt-6">
              <AccordionItem value="item-1">
                <AccordionTrigger>Посмотреть планировки</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-2">
                    {Array.from({ length: house.floors }, (_, i) => i + 1).map(
                      (floor) => (
                        <Button
                          key={floor}
                          variant={selectedFloor === floor ? "secondary" : "ghost"}
                          onClick={() => setSelectedFloor(floor)}
                          className="justify-start"
                        >
                          Этаж {floor}
                        </Button>
                      )
                    )}
                  </div>
                  {selectedFloor && (
                     <FloorPlan
                        src={getFloorPlanUrl(selectedFloor)}
                        alt={`Floor plan for ${house.address}, floor ${selectedFloor}`}
                        hint={`${house.floorPlanHint} floor ${selectedFloor}`}
                      />
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => onDelete(house.id)}
                >
                  <TrashIcon className="mr-2 h-4 w-4" /> Delete
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

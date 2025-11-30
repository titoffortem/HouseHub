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
  BedDouble,
  Building,
  Calendar,
  Check,
  ChevronsUpDown,
  Home,
  Layers3,
  MapPin,
  Ruler,
  Trash2 as TrashIcon,
  Wallet,
  Warehouse,
  Droplets,
  X,
  Pencil,
} from "lucide-react";
import { FloorPlan } from "./floor-plan";
import { Button } from "../ui/button";

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

            <div className="mt-6">
              <h3 className="text-lg font-headline font-semibold">
                Floor Plan
              </h3>
              <FloorPlan
                src={house.floorPlanUrl}
                alt={`Floor plan for ${house.address}`}
                hint={house.floorPlanHint}
              />
            </div>
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

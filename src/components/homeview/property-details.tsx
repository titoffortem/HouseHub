import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { House } from "@/lib/types";
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
  Trash2,
  Wallet,
  Warehouse,
  Droplets,
  X,
} from "lucide-react";
import Image from "next/image";
import { FloorPlan } from "./floor-plan";

interface PropertyDetailsProps {
  house: House | null;
  open: boolean;
  onOpenChange: () => void;
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
}: PropertyDetailsProps) {
  if (!house) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-[540px] p-0" side="left">
        <ScrollArea className="h-full">
          <div className="p-6">
            <SheetHeader>
              <SheetTitle className="font-headline text-2xl">
                {house.address}
              </SheetTitle>
              <SheetDescription className="flex items-center gap-2 text-lg">
                <Wallet className="h-5 w-5 text-accent" />
                <span>
                  {house.price.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </span>
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
                icon={<Ruler className="h-5 w-5" />}
                label="Size"
                value={`${house.size} m²`}
              />
              <DetailItem
                icon={<BedDouble className="h-5 w-5" />}
                label="Rooms"
                value={house.rooms}
              />
              <DetailItem
                icon={<Calendar className="h-5 w-5" />}
                label="Year Built"
                value={house.year}
              />
              <DetailItem
                icon={<Home className="h-5 w-5" />}
                label="Wall Material"
                value={house.wallMaterial}
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
              <DetailItem
                icon={<MapPin className="h-5 w-5" />}
                label="Floor Type"
                value={house.floorType}
              />
              <DetailItem
                icon={<Warehouse className="h-5 w-5" />}
                label="Foundation"
                value={house.foundationType}
              />
              <DetailItem
                icon={<Droplets className="h-5 w-5" />}
                label="Hot Water"
                value={house.hotWaterSupply}
              />
              <div className="col-span-2 grid grid-cols-2 gap-4">
                <BooleanItem
                  icon={<Layers3 className="h-5 w-5" />}
                  label="Elevator"
                  value={house.hasElevator}
                />
                <BooleanItem
                  icon={<Trash2 className="h-5 w-5" />}
                  label="Garbage Chute"
                  value={house.hasGarbageChute}
                />
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}


import {
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
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";


interface PropertyDetailsProps {
  house: HouseWithId | null;
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

export function PropertyDetails({
  house,
  isAdmin,
  onEdit,
  onDelete,
}: PropertyDetailsProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    // Close the viewer if the house changes (or becomes null)
    if (!house) {
      setIsViewerOpen(false);
    }
  }, [house]);

  if (!house) return null;

  const handleConfirmDelete = () => {
    onDelete(house.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <ScrollArea className="flex-grow">
        <FloorPlan
          src={house.imageUrl}
          alt={`Фото ${house.address}`}
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
            Детали объекта
          </h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <DetailItem
              icon={<Calendar className="h-5 w-5" />}
              label="Год постройки"
              value={house.year}
            />
            <DetailItem
              icon={<Building className="h-5 w-5" />}
              label="Серия здания"
              value={Array.isArray(house.buildingSeries) ? house.buildingSeries.join(', ') : house.buildingSeries}
            />
            <div className="flex items-center justify-between col-span-2">
               <DetailItem
                icon={<ChevronsUpDown className="h-5 w-5" />}
                label="Этажность"
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
                <Pencil className="mr-2 h-4 w-4" /> Редактировать
              </Button>
               <Button
                variant="destructive"
                className="flex-1"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Удалить
              </Button>
            </div>
          </SheetFooter>
        </>
      )}
      {/* These dialogs are portaled, so they can remain here */}
      <FloorPlanViewer
        house={house}
        open={isViewerOpen}
        onOpenChange={setIsViewerOpen}
      />
      {isAdmin && (
        <DeleteConfirmationDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  );
}

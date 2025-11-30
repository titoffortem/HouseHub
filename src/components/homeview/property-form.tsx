
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { House, HouseWithId } from "@/lib/types";
import { useEffect } from "react";

const formSchema = z.object({
  address: z.string().min(1, "Address is required"),
  year: z.coerce.number().int().min(1800).max(new Date().getFullYear()),
  buildingSeries: z.string().min(1),
  floors: z.coerce.number().int().positive(),
  floorPlanUrl: z.string().url(),
  floorPlanHint: z.string().min(1),
  imageUrl: z.string().url(),
  imageHint: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

interface PropertyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Omit<House, 'coordinates'>) => void;
  initialData?: HouseWithId | null;
}

export function PropertyForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: PropertyFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (open) {
      reset(initialData
        ? {
            address: initialData.address,
            year: initialData.year,
            buildingSeries: initialData.buildingSeries,
            floors: initialData.floors,
            floorPlanUrl: initialData.floorPlanUrl,
            floorPlanHint: initialData.floorPlanHint,
            imageUrl: initialData.imageUrl,
            imageHint: initialData.imageHint,
          }
        : {
            address: "",
            year: new Date().getFullYear(),
            buildingSeries: "",
            floors: 1,
            floorPlanUrl: "https://picsum.photos/seed/plan/800/600",
            floorPlanHint: "floor plan",
            imageUrl: "https://picsum.photos/seed/house/800/600",
            imageHint: "modern building",
          }
      );
    }
  }, [open, initialData, reset]);

  const handleFormSubmit = (data: FormValues) => {
    onSubmit(data);
    onOpenChange(false); // Close dialog on submit
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] grid-rows-[auto_1fr_auto] p-0 max-h-[90vh]">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{initialData ? "Edit House" : "Add New House"}</DialogTitle>
          <DialogDescription>
            Fill in the details for the property. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="overflow-y-auto">
          <form id="property-form" onSubmit={handleSubmit(handleFormSubmit)} className="px-6 py-4 space-y-4">
            <div className="space-y-1">
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...register("address")} />
              {errors.address && <p className="text-destructive text-sm">{errors.address.message}</p>}
            </div>
             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <Label htmlFor="year">Year Built</Label>
                    <Input id="year" type="number" {...register("year")} />
                    {errors.year && <p className="text-destructive text-sm">{errors.year.message}</p>}
                </div>
                <div className="space-y-1">
                    <Label htmlFor="buildingSeries">Building Series</Label>
                    <Input id="buildingSeries" {...register("buildingSeries")} />
                    {errors.buildingSeries && <p className="text-destructive text-sm">{errors.buildingSeries.message}</p>}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="floors">Floors</Label>
                    <Input id="floors" type="number" {...register("floors")} />
                    {errors.floors && <p className="text-destructive text-sm">{errors.floors.message}</p>}
                </div>
            </div>
             <div className="space-y-1">
                <Label htmlFor="imageUrl">House Image URL</Label>
                <Input id="imageUrl" {...register("imageUrl")} />
                {errors.imageUrl && <p className="text-destructive text-sm">{errors.imageUrl.message}</p>}
            </div>
             <div className="space-y-1">
                <Label htmlFor="imageHint">House Image Hint</Label>
                <Input id="imageHint" {...register("imageHint")} />
                {errors.imageHint && <p className="text-destructive text-sm">{errors.imageHint.message}</p>}
            </div>
            <hr className="my-2" />
             <div className="space-y-1">
                <Label htmlFor="floorPlanUrl">Floor Plan URL</Label>
                <Input id="floorPlanUrl" {...register("floorPlanUrl")} />
                {errors.floorPlanUrl && <p className="text-destructive text-sm">{errors.floorPlanUrl.message}</p>}
            </div>
             <div className="space-y-1">
                <Label htmlFor="floorPlanHint">Floor Plan Hint</Label>
                <Input id="floorPlanHint" {...register("floorPlanHint")} />
                {errors.floorPlanHint && <p className="text-destructive text-sm">{errors.floorPlanHint.message}</p>}
            </div>
          </form>
        </ScrollArea>
        <DialogFooter className="p-6 pt-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="property-form">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

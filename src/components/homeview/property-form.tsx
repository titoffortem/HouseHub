
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
    defaultValues: initialData
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
        },
  });

  const handleFormSubmit = (data: FormValues) => {
    onSubmit(data);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogHeader>
            <DialogTitle>{initialData ? "Edit House" : "Add New House"}</DialogTitle>
            <DialogDescription>
              Fill in the details for the property. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] p-1">
          <div className="grid gap-4 py-4 px-6">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">Address</Label>
              <Input id="address" {...register("address")} className="col-span-3" />
              {errors.address && <p className="col-span-4 text-destructive text-sm">{errors.address.message}</p>}
            </div>
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <Label htmlFor="year">Year Built</Label>
                    <Input id="year" type="number" {...register("year")} />
                    {errors.year && <p className="text-destructive text-sm">{errors.year.message}</p>}
                </div>
                <div>
                    <Label htmlFor="buildingSeries">Building Series</Label>
                    <Input id="buildingSeries" {...register("buildingSeries")} />
                    {errors.buildingSeries && <p className="text-destructive text-sm">{errors.buildingSeries.message}</p>}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="floors">Floors</Label>
                    <Input id="floors" type="number" {...register("floors")} />
                    {errors.floors && <p className="text-destructive text-sm">{errors.floors.message}</p>}
                </div>
            </div>
             <div>
                <Label htmlFor="imageUrl">House Image URL</Label>
                <Input id="imageUrl" {...register("imageUrl")} />
                {errors.imageUrl && <p className="text-destructive text-sm">{errors.imageUrl.message}</p>}
            </div>
             <div>
                <Label htmlFor="imageHint">House Image Hint</Label>
                <Input id="imageHint" {...register("imageHint")} />
                {errors.imageHint && <p className="text-destructive text-sm">{errors.imageHint.message}</p>}
            </div>
            <hr className="my-2" />
             <div>
                <Label htmlFor="floorPlanUrl">Floor Plan URL</Label>
                <Input id="floorPlanUrl" {...register("floorPlanUrl")} />
                {errors.floorPlanUrl && <p className="text-destructive text-sm">{errors.floorPlanUrl.message}</p>}
            </div>
             <div>
                <Label htmlFor="floorPlanHint">Floor Plan Hint</Label>
                <Input id="floorPlanHint" {...register("floorPlanHint")} />
                {errors.floorPlanHint && <p className="text-destructive text-sm">{errors.floorPlanHint.message}</p>}
            </div>
          </div>
          </ScrollArea>
          <DialogFooter className="px-6 pb-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

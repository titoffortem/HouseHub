"use client";

import { useForm, Controller } from "react-hook-form";
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
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { House, HouseWithId } from "@/lib/types";

const formSchema = z.object({
  address: z.string().min(1, "Address is required"),
  price: z.coerce.number().positive("Price must be a positive number"),
  coordinates: z
    .string()
    .refine(
      (val) => {
        const parts = val.split(",").map((p) => p.trim());
        return parts.length === 2 && !isNaN(parseFloat(parts[0])) && !isNaN(parseFloat(parts[1]));
      },
      { message: "Enter as 'latitude, longitude'" }
    )
    .transform((val) => val.split(",").map((p) => parseFloat(p.trim())) as [number, number]),
  size: z.coerce.number().positive(),
  rooms: z.coerce.number().int().positive(),
  year: z.coerce.number().int().min(1800).max(new Date().getFullYear()),
  wallMaterial: z.string().min(1),
  buildingSeries: z.string().min(1),
  floors: z.coerce.number().int().positive(),
  floorType: z.string().min(1),
  foundationType: z.string().min(1),
  hotWaterSupply: z.string().min(1),
  hasElevator: z.boolean().default(false),
  hasGarbageChute: z.boolean().default(false),
  floorPlanUrl: z.string().url(),
  floorPlanHint: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

interface PropertyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: House) => void;
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
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? { ...initialData, coordinates: initialData.coordinates.join(", ") }
      : {
          address: "",
          price: 0,
          coordinates: "",
          size: 0,
          rooms: 1,
          year: new Date().getFullYear(),
          wallMaterial: "",
          buildingSeries: "",
          floors: 1,
          floorType: "",
          foundationType: "",
          hotWaterSupply: "",
          hasElevator: false,
          hasGarbageChute: false,
          floorPlanUrl: "https://picsum.photos/seed/new/800/600",
          floorPlanHint: "floor plan",
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
                    <Label htmlFor="price">Price</Label>
                    <Input id="price" type="number" {...register("price")} />
                    {errors.price && <p className="text-destructive text-sm">{errors.price.message}</p>}
                </div>
                <div>
                    <Label htmlFor="coordinates">Coordinates</Label>
                    <Input id="coordinates" {...register("coordinates")} placeholder="lat, long" />
                    {errors.coordinates && <p className="text-destructive text-sm">{errors.coordinates.message}</p>}
                </div>
            </div>
             <div className="grid grid-cols-3 gap-4">
                <div>
                    <Label htmlFor="size">Size (m²)</Label>
                    <Input id="size" type="number" {...register("size")} />
                    {errors.size && <p className="text-destructive text-sm">{errors.size.message}</p>}
                </div>
                <div>
                    <Label htmlFor="rooms">Rooms</Label>
                    <Input id="rooms" type="number" {...register("rooms")} />
                    {errors.rooms && <p className="text-destructive text-sm">{errors.rooms.message}</p>}
                </div>
                 <div>
                    <Label htmlFor="year">Year Built</Label>
                    <Input id="year" type="number" {...register("year")} />
                    {errors.year && <p className="text-destructive text-sm">{errors.year.message}</p>}
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="wallMaterial">Wall Material</Label>
                    <Input id="wallMaterial" {...register("wallMaterial")} />
                    {errors.wallMaterial && <p className="text-destructive text-sm">{errors.wallMaterial.message}</p>}
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
                <div>
                    <Label htmlFor="floorType">Floor Type</Label>
                    <Input id="floorType" {...register("floorType")} />
                    {errors.floorType && <p className="text-destructive text-sm">{errors.floorType.message}</p>}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="foundationType">Foundation Type</Label>
                    <Input id="foundationType" {...register("foundationType")} />
                    {errors.foundationType && <p className="text-destructive text-sm">{errors.foundationType.message}</p>}
                </div>
                <div>
                    <Label htmlFor="hotWaterSupply">Hot Water Supply</Label>
                    <Input id="hotWaterSupply" {...register("hotWaterSupply")} />
                    {errors.hotWaterSupply && <p className="text-destructive text-sm">{errors.hotWaterSupply.message}</p>}
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <Controller
                    control={control}
                    name="hasElevator"
                    render={({ field }) => <Switch id="hasElevator" checked={field.value} onCheckedChange={field.onChange} />}
                />
                <Label htmlFor="hasElevator">Has Elevator</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Controller
                    control={control}
                    name="hasGarbageChute"
                    render={({ field }) => <Switch id="hasGarbageChute" checked={field.value} onCheckedChange={field.onChange} />}
                />
                <Label htmlFor="hasGarbageChute">Has Garbage Chute</Label>
            </div>
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

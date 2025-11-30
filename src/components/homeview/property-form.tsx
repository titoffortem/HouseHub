
"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
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
import { House, HouseWithId, FloorPlan } from "@/lib/types";
import { useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Separator } from "../ui/separator";

const floorPlanSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  hint: z.string().min(1, "Hint is required"),
});

const formSchema = z.object({
  address: z.string().min(1, "Address is required"),
  year: z.coerce.number().int().min(1800).max(new Date().getFullYear()),
  buildingSeries: z.string().min(1, "Building series is required"),
  floors: z.coerce.number().int().positive("Must be a positive number"),
  imageUrl: z.string().url("Must be a valid URL"),
  imageHint: z.string().min(1, "Image hint is required"),
  floorPlans: z.array(floorPlanSchema).min(1, "At least one floor plan is required"),
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
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      floorPlans: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "floorPlans",
  });

  useEffect(() => {
    if (open) {
      reset(initialData
        ? {
            ...initialData,
          }
        : {
            address: "",
            year: new Date().getFullYear(),
            buildingSeries: "",
            floors: 1,
            imageUrl: "https://picsum.photos/seed/house/800/600",
            imageHint: "modern building",
            floorPlans: [
              { url: "https://picsum.photos/seed/plan1/800/600", hint: "floor plan 1" },
            ],
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
        <ScrollArea className="h-[65vh] overflow-y-auto">
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
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Floor Plans</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ url: `https://picsum.photos/seed/plan${fields.length + 1}/800/600`, hint: `floor plan ${fields.length + 1}` })}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Floor
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="space-y-2 p-4 border rounded-md relative">
                   <h4 className="font-medium text-sm">Floor {index + 1}</h4>
                  <div className="space-y-1">
                    <Label htmlFor={`floorPlans.${index}.url`}>Floor Plan URL</Label>
                    <Input
                      id={`floorPlans.${index}.url`}
                      {...register(`floorPlans.${index}.url`)}
                    />
                    {errors.floorPlans?.[index]?.url && <p className="text-destructive text-sm">{errors.floorPlans[index].url.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`floorPlans.${index}.hint`}>Floor Plan Hint</Label>
                    <Input
                      id={`floorPlans.${index}.hint`}
                      {...register(`floorPlans.${index}.hint`)}
                    />
                     {errors.floorPlans?.[index]?.hint && <p className="text-destructive text-sm">{errors.floorPlans[index].hint.message}</p>}
                  </div>
                   <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-destructive"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
               {errors.floorPlans && !errors.floorPlans.root?.message && (
                <p className="text-destructive text-sm">{errors.floorPlans.message}</p>
              )}
            </div>

          </form>
        </ScrollArea>
        <DialogFooter className="p-6 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="property-form">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

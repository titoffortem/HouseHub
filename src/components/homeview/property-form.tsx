
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
import { House, HouseWithId } from "@/lib/types";
import { useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Separator } from "../ui/separator";

const floorPlanSchema = z.object({
  url: z.string().url("Должен быть действительный URL"),
});

const formSchema = z.object({
  address: z.string().min(1, "Адрес обязателен"),
  year: z.coerce.number().int().min(1800).max(new Date().getFullYear()),
  buildingSeries: z.string().min(1, "Серия здания обязательна"),
  floors: z.coerce.number().int().positive("Должно быть положительное число"),
  imageUrl: z.string().url("Должен быть действительный URL"),
  floorPlans: z.array(floorPlanSchema).min(1, "Требуется хотя бы один план этажа"),
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
            imageUrl: "",
            floorPlans: [
              { url: "" },
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
          <DialogTitle>{initialData ? "Редактировать дом" : "Добавить новый дом"}</DialogTitle>
          <DialogDescription>
            Заполните данные об объекте. Нажмите "Сохранить", когда закончите.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[65vh] overflow-y-auto">
          <form id="property-form" onSubmit={handleSubmit(handleFormSubmit)} className="px-6 py-4 space-y-4">
            <div className="space-y-1">
              <Label htmlFor="address">Адрес</Label>
              <Input id="address" {...register("address")} />
              {errors.address && <p className="text-destructive text-sm">{errors.address.message}</p>}
            </div>
             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <Label htmlFor="year">Год постройки</Label>
                    <Input id="year" type="number" {...register("year")} />
                    {errors.year && <p className="text-destructive text-sm">{errors.year.message}</p>}
                </div>
                <div className="space-y-1">
                    <Label htmlFor="buildingSeries">Серия здания</Label>
                    <Input id="buildingSeries" {...register("buildingSeries")} />
                    {errors.buildingSeries && <p className="text-destructive text-sm">{errors.buildingSeries.message}</p>}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="floors">Этажность</Label>
                    <Input id="floors" type="number" {...register("floors")} />
                    {errors.floors && <p className="text-destructive text-sm">{errors.floors.message}</p>}
                </div>
            </div>
             <div className="space-y-1">
                <Label htmlFor="imageUrl">URL изображения дома</Label>
                <Input id="imageUrl" {...register("imageUrl")} />
                {errors.imageUrl && <p className="text-destructive text-sm">{errors.imageUrl.message}</p>}
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Планы этажей</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ url: "" })}
                >
                  <Plus className="mr-2 h-4 w-4" /> Добавить этаж
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="space-y-2 p-4 border rounded-md relative">
                   <h4 className="font-medium text-sm">Этаж {index + 1}</h4>
                  <div className="space-y-1">
                    <Label htmlFor={`floorPlans.${index}.url`}>URL плана этажа</Label>
                    <Input
                      id={`floorPlans.${index}.url`}
                      {...register(`floorPlans.${index}.url`)}
                    />
                    {errors.floorPlans?.[index]?.url && <p className="text-destructive text-sm">{errors.floorPlans[index].url.message}</p>}
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
            Отмена
          </Button>
          <Button type="submit" form="property-form">Сохранить изменения</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

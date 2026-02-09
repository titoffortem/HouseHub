
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
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HouseWithId } from "@/lib/types";
import { useEffect } from "react";
import { Plus, Trash2, MapPin, X } from "lucide-react";
import { Separator } from "../ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const floorPlanSchema = z.object({
  url: z.string().url("Должен быть действительный URL").or(z.literal("")),
});

const formSchema = z.object({
  osmId: z.string().optional(),
  address: z.string().min(1, "Адрес обязателен"),
  year: z.string().regex(/^\d{4}(?:-\d{4})?$/, { message: "Год должен быть в формате ГГГГ или ГГГГ-ГГГГ" }).min(1, "Год постройки обязателен"),
  buildingSeries: z.string().min(1, "Серия здания обязательна"),
  floors: z.coerce.number().int().positive("Должно быть положительное число"),
  imageUrl: z.string().url("Должен быть действительный URL").or(z.literal("")),
  floorPlans: z.array(floorPlanSchema),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  inputType: z.enum(['address', 'coords']).default('address'),
}).superRefine((data, ctx) => {
    if (data.inputType === 'coords') {
        if (data.lat === undefined || Number.isNaN(data.lat)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['lat'], message: 'Широта обязательна' });
        }
        if (data.lng === undefined || Number.isNaN(data.lng)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['lng'], message: 'Долгота обязательна' });
        }
    }
});


export type FormValues = z.infer<typeof formSchema>;

interface PropertyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: FormValues) => void;
  onReverseGeocode: (lat: number, lng: number) => Promise<string | null>;
  initialData?: HouseWithId | null;
  onSetIsPickingLocation: (isPicking: boolean) => void;
  pickedCoords: { lat: number; lng: number } | null;
  onFetchFromOSM: (osmId: string) => Promise<Partial<FormValues> | null>;
}

export function PropertyForm({
  open,
  onOpenChange,
  onSubmit,
  onReverseGeocode,
  initialData,
  onSetIsPickingLocation,
  pickedCoords,
  onFetchFromOSM,
}: PropertyFormProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      osmId: "",
      address: "",
      year: "",
      inputType: "address",
      imageUrl: "",
      floorPlans: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "floorPlans",
  });
  
  const inputType = watch("inputType");

  useEffect(() => {
    if (!open) {
      return; // Do nothing if the form is not open
    }

    if (initialData) {
      // EDITING mode
      reset({
        ...initialData,
        osmId: initialData.osmId || "",
        year: String(initialData.year),
        buildingSeries: Array.isArray(initialData.buildingSeries) ? initialData.buildingSeries.join(', ') : (initialData.buildingSeries || ''),
        inputType: 'address',
        lat: initialData.coordinates.points[0]?.lat,
        lng: initialData.coordinates.points[0]?.lng,
        floorPlans: initialData.floorPlans.length > 0 ? initialData.floorPlans : [{ url: "" }],
      });
    } else if (pickedCoords) {
      // CREATING from map click
      setValue('inputType', 'coords', { shouldValidate: true }); 
      setValue('lat', pickedCoords.lat, { shouldValidate: true });
      setValue('lng', pickedCoords.lng, { shouldValidate: true });
      
      setValue('address', 'Поиск адреса...', { shouldValidate: false });
      onReverseGeocode(pickedCoords.lat, pickedCoords.lng).then(address => {
        if (address) {
          setValue("address", address, { shouldValidate: true });
        } else {
          setValue("address", "", { shouldValidate: true });
        }
      });
    } else {
      // CREATING from scratch
      reset({
        osmId: "",
        address: "",
        year: "",
        buildingSeries: "",
        floors: 1,
        imageUrl: "",
        floorPlans: [{ url: "" }],
        inputType: 'address',
        lat: undefined,
        lng: undefined,
      });
    }
  }, [open, initialData, pickedCoords, reset, setValue, onReverseGeocode]);

  const handleFetchOsmData = async () => {
    const osmId = watch('osmId');
    if (osmId) {
        const fetchedData = await onFetchFromOSM(osmId);
        if (fetchedData) {
            Object.entries(fetchedData).forEach(([key, value]) => {
                if (value !== undefined) {
                    setValue(key as keyof FormValues, value, { shouldValidate: true });
                }
            });
        }
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] grid-rows-[auto_1fr_auto] p-0 max-h-[90vh]">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{initialData ? "Редактировать дом" : "Добавить новый дом"}</DialogTitle>
          <DialogDescription>
            Заполните данные об объекте. Нажмите "Сохранить", когда закончите.
          </DialogDescription>
        </DialogHeader>
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
        </DialogClose>
        <ScrollArea className="h-[65vh] overflow-y-auto">
          <form id="property-form" onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 space-y-4">
            
            <div className="flex items-end gap-2">
                <div className="space-y-1 flex-grow">
                    <Label htmlFor="osmId">OSM ID</Label>
                    <Input id="osmId" {...register("osmId")} placeholder="ID объекта из OpenStreetMap" />
                    {errors.osmId && <p className="text-destructive text-sm">{errors.osmId.message}</p>}
                </div>
                <Button 
                    type="button" 
                    variant="secondary"
                    onClick={handleFetchOsmData}
                >
                    Загрузить
                </Button>
            </div>
            <Separator />

            <div className="space-y-2">
              <Label>Способ ввода координат</Label>
               <Controller
                control={control}
                name="inputType"
                render={({ field }) => (
                    <RadioGroup
                        onValueChange={(value) => {
                            field.onChange(value);
                            if (value === 'coords') {
                                onSetIsPickingLocation(true);
                            }
                        }}
                        value={field.value}
                        className="flex space-x-4 pt-1"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="address" id="r1" disabled={!!initialData || !!watch('osmId')}/>
                            <Label htmlFor="r1" className="font-normal">По адресу</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="coords" id="r2" disabled={!!initialData || !!watch('osmId')}/>
                            <Label htmlFor="r2" className="font-normal">По карте</Label>
                        </div>
                    </RadioGroup>
                )}
            />
            </div>

            {inputType === 'address' ? (
              <div className="space-y-1">
                <Label htmlFor="address">Адрес</Label>
                <Input id="address" {...register("address")} />
                {errors.address && <p className="text-destructive text-sm">{errors.address.message}</p>}
              </div>
            ) : (
              <div className="space-y-4 rounded-lg border p-4">
                 <Button type="button" variant="outline" onClick={() => onSetIsPickingLocation(true)}>
                    <MapPin className="mr-2 h-4 w-4" />
                    Указать другую точку
                </Button>
                <div className="space-y-1">
                    <Label htmlFor="address">Найденный адрес (можно изменить)</Label>
                    <Input id="address" {...register("address")} placeholder="Адрес появится здесь..."/>
                    {errors.address && <p className="text-destructive text-sm">{errors.address.message}</p>}
                </div>
                {/* Hidden inputs for validation */}
                <input type="hidden" {...register("lat")} />
                <input type="hidden" {...register("lng")} />
              </div>
            )}
             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <Label htmlFor="year">Год постройки</Label>
                    <Input id="year" type="text" {...register("year")} placeholder="ГГГГ или ГГГГ-ГГГГ"/>
                    {errors.year && <p className="text-destructive text-sm">{errors.year.message}</p>}
                </div>
                <div className="space-y-1">
                    <Label htmlFor="buildingSeries">Серия здания</Label>
                    <Input id="buildingSeries" {...register("buildingSeries")} placeholder="Несколько серий через запятую"/>
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
          <Button type="submit" form="property-form">Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

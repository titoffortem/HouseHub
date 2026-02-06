"use client";

import Image from "next/image";
import { Card } from "../ui/card";

interface FloorPlanProps {
  src: string;
  alt: string;
}

export function FloorPlan({ src, alt }: FloorPlanProps) {
  if (!src) {
    return (
      <Card className="overflow-hidden relative group rounded-none border-0 border-b">
        <div className="relative w-full aspect-[4/3] bg-muted flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Нет изображения</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden relative group rounded-none border-0 border-b">
      <div className="relative w-full aspect-[4/3]">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          key={src} // Add key to force re-render on src change
        />
      </div>
    </Card>
  );
}

"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "../ui/card";
import { ZoomIn, ZoomOut, Expand } from "lucide-react";
import { Button } from "../ui/button";

interface FloorPlanProps {
  src: string;
  alt: string;
  hint: string;
}

export function FloorPlan({ src, alt, hint }: FloorPlanProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <Card className="mt-4 overflow-hidden relative group">
      <div
        className={cn(
          "relative w-full aspect-[4/3] cursor-pointer transition-transform duration-300",
          isZoomed ? "scale-150" : "scale-100"
        )}
        onClick={() => setIsZoomed(!isZoomed)}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          data-ai-hint={hint}
        />
      </div>
      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="icon" variant="secondary" onClick={() => setIsZoomed(true)} aria-label="Zoom In">
          <ZoomIn className="h-5 w-5" />
        </Button>
        <Button size="icon" variant="secondary" onClick={() => setIsZoomed(false)} aria-label="Zoom Out">
          <ZoomOut className="h-5 w-5" />
        </Button>
      </div>
       <div className="absolute bottom-2 left-2 p-2 bg-black/50 rounded-lg text-white text-xs">
          {isZoomed ? "Click to zoom out" : "Click to zoom in"}
      </div>
    </Card>
  );
}

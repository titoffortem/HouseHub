
"use client";

import Image from "next/image";
import { Card } from "../ui/card";

interface FloorPlanProps {
  src: string;
  alt: string;
  hint: string;
}

export function FloorPlan({ src, alt, hint }: FloorPlanProps) {
  return (
    <Card className="overflow-hidden relative group rounded-none border-0 border-b">
      <div className="relative w-full aspect-[4/3]">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          data-ai-hint={hint}
          key={src} // Add key to force re-render on src change
        />
      </div>
    </Card>
  );
}

"use client";

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react';

const MapComponent = dynamic(() => import('./map-component'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted animate-pulse" />
});

export default function Map(props: any) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? <MapComponent {...props} /> : <div className="h-full w-full bg-muted animate-pulse" />;
}

"use client";

import React, { useEffect, useRef } from 'react';
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { HouseWithId } from "@/lib/types";

// Fix for default icon path issue with webpack
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

interface MapComponentProps {
  houses: HouseWithId[];
  onSelectHouse: (house: HouseWithId) => void;
}

const defaultCircleStyle = {
  color: 'hsl(231 48% 48%)',
  fillColor: 'hsl(231 48% 48%)',
  fillOpacity: 0.2,
  radius: 20,
  weight: 2,
};

const hoverCircleStyle = {
  ...defaultCircleStyle,
  fillOpacity: 0.6,
  radius: 25,
};


export default function MapComponent({
  houses,
  onSelectHouse,
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const layersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    // Initialize map only if the ref is available and map hasn't been initialized yet
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([57.626, 39.897], 13); // Yaroslavl coordinates
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance.current);
      layersRef.current = L.layerGroup().addTo(mapInstance.current);
    }

    // Cleanup function to destroy the map instance
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount and unmount

  useEffect(() => {
    const layers = layersRef.current;
    if (!layers) return;

    // Clear existing layers
    layers.clearLayers();

    // Add new circles for each house
    houses.forEach(house => {
        const circle = L.circle(house.coordinates, defaultCircleStyle);

        circle.on('mouseover', function (e) {
            this.setStyle(hoverCircleStyle);
            this.bringToFront();
        });

        circle.on('mouseout', function (e) {
            this.setStyle(defaultCircleStyle);
        });
        
        circle.on('click', () => {
            onSelectHouse(house);
        });

        layers.addLayer(circle);
    });

    // Fit bounds if houses are available
    if (houses.length > 0) {
        const bounds = new L.LatLngBounds(houses.map(h => h.coordinates));
        if (mapInstance.current && !mapInstance.current.getBounds().contains(bounds)) {
            mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
        }
    }

  }, [houses, onSelectHouse]);
  
  return <div ref={mapRef} className="h-full w-full z-0" />;
}

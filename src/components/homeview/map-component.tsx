
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

const isPolygon = (coords: any): coords is [number, number][] => {
    // A valid polygon is an array of arrays, and the first inner array contains two numbers.
    return Array.isArray(coords) && Array.isArray(coords[0]) && Array.isArray(coords[0]) && typeof coords[0][0] === 'number';
}

export default function MapComponent({
  houses,
  onSelectHouse,
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const layersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([57.626, 39.897], 13);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      }).addTo(mapInstance.current);
      layersRef.current = L.layerGroup().addTo(mapInstance.current);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const layers = layersRef.current;
    if (!layers) return;

    layers.clearLayers();

    const allBounds: L.LatLng[] = [];

    houses.forEach(house => {
        let layer: L.Layer | null = null;

        if (isPolygon(house.coordinates)) {
            const latLngs = house.coordinates as L.LatLngExpression[];
            layer = L.polygon(latLngs, {
                color: "hsl(231 48% 48%)", // primary
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.2
            });
            latLngs.forEach(coord => {
              if (Array.isArray(coord) && typeof coord[0] === 'number' && typeof coord[1] === 'number') {
                 allBounds.push(L.latLng(coord[0], coord[1]))
              }
            });
        } else if (Array.isArray(house.coordinates) && typeof house.coordinates[0] === 'number' && typeof house.coordinates[1] === 'number') {
            const latLng = house.coordinates as L.LatLngExpression;
            layer = L.circleMarker(latLng, {
                radius: 6, // Fixed radius in pixels
                fillColor: "hsl(231 48% 48%)",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
             allBounds.push(L.latLng(house.coordinates[0], house.coordinates[1]));
        }
      
      if (layer) {
        layer.on('click', () => {
            onSelectHouse(house);
        });
        layers.addLayer(layer);
      }
    });

    if (allBounds.length > 0 && mapInstance.current) {
        const bounds = new L.LatLngBounds(allBounds);
        // Check if bounds are valid to prevent errors
        if (bounds.isValid()) {
            mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
        }
    }

  }, [houses, onSelectHouse]);
  
  return <div ref={mapRef} className="h-full w-full z-0" />;
}

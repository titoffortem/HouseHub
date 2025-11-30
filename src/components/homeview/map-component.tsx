
"use client";

import React, { useEffect, useRef } from 'react';
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { HouseWithId, GeoPoint } from "@/lib/types";

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
      L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
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
        
        const { coordinates } = house;

        if (coordinates.type === 'Polygon' && coordinates.points.length > 0) {
            const latLngs = coordinates.points.map(p => [p.lat, p.lng] as [number, number]);
            layer = L.polygon(latLngs, {
                color: "hsl(var(--primary))",
                weight: 2,
                opacity: 0.9,
                fillColor: "hsl(var(--primary))",
                fillOpacity: 0.4
            });
            latLngs.forEach(coord => {
              allBounds.push(L.latLng(coord[0], coord[1]))
            });
        } else if (coordinates.type === 'Point' && coordinates.points.length > 0) {
            const point = coordinates.points[0];
            const latLng = [point.lat, point.lng] as [number, number];
            layer = L.circleMarker(latLng, {
                radius: 6, // Fixed radius in pixels
                fillColor: "hsl(var(--primary))",
                color: "#FFF",
                weight: 1.5,
                opacity: 1,
                fillOpacity: 0.8
            });
            allBounds.push(L.latLng(point.lat, point.lng));
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

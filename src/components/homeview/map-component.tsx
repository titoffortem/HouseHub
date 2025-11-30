
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
  highlightedHouses: HouseWithId[] | null;
  onSelectHouse: (house: HouseWithId) => void;
}

const defaultStyle = {
  color: "hsl(var(--primary))",
  weight: 1.5,
  opacity: 0.8,
  fillColor: "hsl(var(--primary))",
  fillOpacity: 0.2,
};

const highlightedStyle = {
  color: "#FFFFFF",
  weight: 2,
  opacity: 1,
  fillColor: "#FFFFFF",
  fillOpacity: 0.3,
};

export default function MapComponent({
  houses,
  highlightedHouses,
  onSelectHouse,
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const layersRef = useRef<L.LayerGroup | null>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([57.626, 39.897], 13);
       L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20,
        }
      ).addTo(mapInstance.current);
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
    if (!layers || !mapInstance.current) return;

    layers.clearLayers();

    const allBounds: L.LatLng[] = [];
    const highlightedIds = highlightedHouses ? new Set(highlightedHouses.map(h => h.id)) : null;

    houses.forEach(house => {
        let layer: L.Layer | null = null;
        const isHighlighted = highlightedHouses === null || (highlightedIds && highlightedIds.has(house.id));
        
        const style = isHighlighted ? highlightedStyle : defaultStyle;

        const { coordinates } = house;

        if (coordinates.type === 'Polygon' && coordinates.points.length > 0) {
            const latLngs = coordinates.points.map(p => [p.lat, p.lng] as [number, number]);
            layer = L.polygon(latLngs, style);
            if (isHighlighted) {
              latLngs.forEach(coord => allBounds.push(L.latLng(coord[0], coord[1])));
            }
        } else if (coordinates.type === 'Point' && coordinates.points.length > 0) {
            const point = coordinates.points[0];
            const latLng = [point.lat, point.lng] as [number, number];
            layer = L.circleMarker(latLng, {
                radius: 6,
                fillColor: style.fillColor,
                color: style.color === 'hsl(var(--primary))' ? "#FFF" : style.color,
                weight: style.weight,
                opacity: style.opacity,
                fillOpacity: style.fillOpacity
            });
            if (isHighlighted) {
              allBounds.push(L.latLng(point.lat, point.lng));
            }
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
        if (bounds.isValid()) {
            mapInstance.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
        }
    } else if (isInitialLoad.current && houses.length > 0 && mapInstance.current) {
        // On initial load, fit all houses if no specific filter is active
        const allHousesBounds: L.LatLng[] = [];
        houses.forEach(house => {
            house.coordinates.points.forEach(p => {
                allHousesBounds.push(L.latLng(p.lat, p.lng));
            });
        });
        const bounds = new L.LatLngBounds(allHousesBounds);
        if (bounds.isValid()) {
            mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
        }
        isInitialLoad.current = false;
    }


  }, [houses, highlightedHouses, onSelectHouse]);
  
  return <div ref={mapRef} className="h-full w-full z-0" />;
}

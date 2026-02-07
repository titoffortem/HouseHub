
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
  highlightedHouses: HouseWithId[] | null;
  onSelectHouse: (house: HouseWithId) => void;
  onMapClick?: (latlng: { lat: number; lng: number }) => void;
  markerPosition?: [number, number] | null;
  isPickingLocation?: boolean;
}

const defaultStyle = {
  color: "black",
  weight: 1.5,
  opacity: 0.8,
  fillColor: "black",
  fillOpacity: 0.2,
};

const highlightedStyle = {
  color: "hsl(var(--accent))",
  weight: 3,
  opacity: 1,
  fillColor: "hsl(var(--accent))",
  fillOpacity: 0.4,
};

export default function MapComponent({
  houses,
  highlightedHouses,
  onSelectHouse,
  onMapClick,
  markerPosition,
  isPickingLocation,
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const layersRef = useRef<L.LayerGroup | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([57.626, 39.897], 13);

      L.tileLayer('https://core-renderer-tiles.maps.yandex.net/tiles?l=map&v=22.07.20-0&x={x}&y={y}&z={z}&scale=1&lang=ru_RU', {
        // No official attribution for these tiles
      }).addTo(mapInstance.current);
      
      layersRef.current = L.layerGroup().addTo(mapInstance.current);
    }
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    const clickHandler = (e: L.LeafletMouseEvent) => {
        if (isPickingLocation && onMapClick) {
            onMapClick(e.latlng);
        }
    };
    
    map.on('click', clickHandler);
    
    return () => {
        map.off('click', clickHandler);
    };
  }, [isPickingLocation, onMapClick]);

  useEffect(() => {
    if (mapRef.current) {
        mapRef.current.style.cursor = isPickingLocation ? 'crosshair' : '';
    }
  }, [isPickingLocation]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Remove previous marker
    if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
    }

    // Add new marker and bring it to front
    if (markerPosition) {
        markerRef.current = L.marker(markerPosition).addTo(map);
        markerRef.current.bringToFront();
        map.panTo(markerPosition);
    }
  }, [markerPosition]);


  useEffect(() => {
    const layers = layersRef.current;
    if (!layers || !mapInstance.current) return;

    layers.clearLayers();

    const highlightedIds = highlightedHouses ? new Set(highlightedHouses.map(h => h.id)) : null;

    houses.forEach(house => {
        let layer: L.Layer & { bringToFront?: () => void } | null = null;
        const isHighlighted = highlightedIds ? highlightedIds.has(house.id) : false;
        
        const style = isHighlighted ? highlightedStyle : defaultStyle;

        const { coordinates } = house;
        
        const options = { ...style };

        if (coordinates.type === 'Polygon' && coordinates.points.length > 0) {
            const latLngs = coordinates.points.map(p => [p.lat, p.lng] as [number, number]);
            layer = L.polygon(latLngs, options);
        } else if (coordinates.type === 'Point' && coordinates.points.length > 0) {
            const point = coordinates.points[0];
            const latLng = [point.lat, point.lng] as [number, number];
            layer = L.circleMarker(latLng, {
                ...options,
                radius: 6,
            });
        }
      
      if (layer) {
        layer.on('click', (e) => {
            if (!isPickingLocation) {
              L.DomEvent.stopPropagation(e);
              onSelectHouse(house);
            }
        });
        layers.addLayer(layer);
        // This is the important part: ensure each polygon/circle is on top.
        if (layer.bringToFront) {
            layer.bringToFront();
        }
      }
    });
    
    if (highlightedHouses && highlightedHouses.length > 0 && mapInstance.current) {
        const boundsPoints: L.LatLng[] = [];
        highlightedHouses.forEach(house => {
             house.coordinates.points.forEach(p => {
                boundsPoints.push(L.latLng(p.lat, p.lng));
            });
        });
        const bounds = new L.LatLngBounds(boundsPoints);
        if (bounds.isValid()) {
            mapInstance.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
        }
    }


  }, [houses, highlightedHouses, onSelectHouse, isPickingLocation]);
  
  return <div ref={mapRef} className="h-full w-full z-0" />;
}

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
  selectedHouse: HouseWithId | null;
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
  selectedHouse,
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
      let initialView: [number, number] = [57.626, 39.897];
      let initialZoom = 13;

      try {
        const savedLocation = localStorage.getItem('lastHouseLocation');
        if (savedLocation) {
          const { lat, lng, zoom } = JSON.parse(savedLocation);
          if (lat && lng) {
            initialView = [lat, lng];
            initialZoom = zoom || 13;
          }
        }
      } catch (error) {
        console.error("Failed to parse last location from localStorage", error);
        // Fallback to default view
      }

      const map = L.map(mapRef.current).setView(initialView, initialZoom);
      mapInstance.current = map;

      // Create panes to control layer stacking
      map.createPane('tilePane');
      map.getPane('tilePane')!.style.zIndex = '100';

      map.createPane('polygonsPane');
      map.getPane('polygonsPane')!.style.zIndex = '200';
      
      map.createPane('topMarkerPane');
      map.getPane('topMarkerPane')!.style.zIndex = '300';

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        pane: 'tilePane'
      }).addTo(map);
      
      layersRef.current = L.layerGroup([], { pane: 'polygonsPane' }).addTo(map);
    }
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    const clickHandler = (e: L.LeafletMouseEvent) => {
        if (isPickingLocation && onMapClick) {
            onMapClick(e.latlng);
        } else if (!isPickingLocation) {
            const target = e.originalEvent.target as HTMLElement;
            // Hide search panel if click is on map canvas directly
            if (target.classList.contains('leaflet-container')) {
                 const event = new CustomEvent('map-clicked');
                 window.dispatchEvent(event);
            }
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

    // Add new marker and assign it to the top-most pane.
    if (markerPosition) {
        markerRef.current = L.marker(markerPosition, { pane: 'topMarkerPane' }).addTo(map);
        map.panTo(markerPosition);
    }
  }, [markerPosition]);

  // This effect pans and zooms the map to the selected house.
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !selectedHouse) return;

    const { coordinates } = selectedHouse;

    if (coordinates.points.length > 0) {
      if (coordinates.type === 'Point') {
        const point = coordinates.points[0];
        // For a single point, we can zoom in quite close.
        map.setView([point.lat, point.lng], 17);
      } else { // 'Polygon'
        const latLngs = coordinates.points.map(p => [p.lat, p.lng] as [number, number]);
        const bounds = L.latLngBounds(latLngs);
        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
        }
      }
    }
  }, [selectedHouse]);


  useEffect(() => {
    const layers = layersRef.current;
    if (!layers || !mapInstance.current) return;

    layers.clearLayers();

    const highlightedIds = highlightedHouses ? new Set(highlightedHouses.map(h => h.id)) : null;

    houses.forEach(house => {
        let layer: (L.Layer & { bringToFront?: () => void }) | null = null;
        const isHighlighted = highlightedIds ? highlightedIds.has(house.id) : false;
        
        const style = isHighlighted ? highlightedStyle : defaultStyle;

        const { coordinates } = house;
        
        // The pane is already set on the layersRef group, so individual layers inherit it.
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
        
        if (isHighlighted && layer.bringToFront) {
            layer.bringToFront();
        }
      }
    });
    
    if (highlightedHouses && highlightedHouses.length > 0 && !selectedHouse && mapInstance.current) {
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


  }, [houses, highlightedHouses, onSelectHouse, isPickingLocation, selectedHouse]);
  
  return <div ref={mapRef} className="h-full w-full z-0" />;
}

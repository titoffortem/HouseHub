"use client";

import React, { useEffect, useRef, useState } from 'react';
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { House } from "@/lib/types";
import { Button } from "../ui/button";

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
  houses: House[];
  onSelectHouse: (house: House) => void;
}

const customIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="hsl(231 48% 48%)" width="32" height="32"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" fill="white" /></svg>'),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

export default function MapComponent({
  houses,
  onSelectHouse,
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    // Initialize map only if the ref is available and map hasn't been initialized yet
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([40.7128, -74.006], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance.current);
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
    const map = mapInstance.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    houses.forEach(house => {
      const marker = L.marker(house.coordinates, { icon: customIcon }).addTo(map);
      
      const popupContent = document.createElement('div');
      popupContent.className = "p-1";

      popupContent.innerHTML = `
        <h3 class="font-bold text-md font-headline">${house.address}</h3>
        <p class="text-sm text-muted-foreground">${house.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
      `;

      const button = document.createElement('button');
      button.className = "mt-2 w-full text-white bg-accent hover:bg-accent/90 focus:ring-4 focus:outline-none focus:ring-ring font-medium rounded-lg text-sm px-4 py-2 text-center";
      button.innerText = 'View Details';
      button.onclick = () => onSelectHouse(house);

      popupContent.appendChild(button);
      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
    });

    // Fit bounds if houses are available
    if (houses.length > 0) {
        const bounds = new L.LatLngBounds(houses.map(h => h.coordinates));
        map.fitBounds(bounds, { padding: [50, 50] });
    }

  }, [houses, onSelectHouse]);
  
  return <div ref={mapRef} className="h-full w-full z-0" />;
}

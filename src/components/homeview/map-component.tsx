"use client";

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
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

function MapUpdater({ houses }: { houses: House[] }) {
  const map = useMap();
  useEffect(() => {
    if (houses.length > 0) {
      const bounds = new L.LatLngBounds(houses.map(h => h.coordinates));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [houses, map]);
  return null;
}

export default function MapComponent({
  houses,
  onSelectHouse,
}: MapComponentProps) {
  const position: [number, number] = [40.7128, -74.006]; 

  return (
    <div className="h-full w-full z-0">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {houses.map((house) => (
          <Marker key={house.id} position={house.coordinates} icon={customIcon}>
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-md font-headline">{house.address}</h3>
                <p className="text-sm text-muted-foreground">{house.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                <Button size="sm" className="mt-2 w-full" variant="accent" onClick={() => onSelectHouse(house)}>
                  View Details
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
        <MapUpdater houses={houses} />
      </MapContainer>
    </div>
  );
}
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './leaflet.css';
import L from 'leaflet';
import { Card } from "@/components/ui/card";

// Fix marker icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface SimpleMapProps {
  className?: string;
}

export default function SimpleMap({ className = '' }: SimpleMapProps) {
  // Default to Casablanca
  const position: [number, number] = [33.5731, -7.5898];
  
  return (
    <Card className={`${className} overflow-hidden h-72 rounded-lg`}>
      <MapContainer 
        center={position} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            Casablanca, Morocco
          </Popup>
        </Marker>
      </MapContainer>
    </Card>
  );
}
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './leaflet.css';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Navigation, Plus, Minus } from "lucide-react";
import { useTranslation } from "../lib/i18n";

// Fix marker icon issues
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
}

// Custom icons for user and treasure
const userIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const treasureIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map location changes
function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
}

interface Treasure {
  id: string;
  amount: number;
  location: {
    latitude: number;
    longitude: number;
  };
  radius: number;
  status: 'LOCKED' | 'UNLOCKING' | 'UNLOCKED' | 'EXPIRED';
}

interface TreasureMapProps {
  treasures: Treasure[];
  onTreasureSelect?: (treasure: Treasure) => void;
  className?: string;
}

export default function TreasureMap({ 
  treasures, 
  onTreasureSelect,
  className = ''
}: TreasureMapProps) {
  const { t } = useTranslation();
  const [userLocation, setUserLocation] = useState<[number, number]>([33.5731, -7.5898]); // Default to Casablanca
  const [loading, setLoading] = useState(true);
  const [selectedTreasure, setSelectedTreasure] = useState<Treasure | null>(null);
  const [mapZoom, setMapZoom] = useState(14);

  useEffect(() => {
    // Get user's location if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          setLoading(false);
        },
        () => {
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  }, []);

  const handleTreasureClick = (treasure: Treasure) => {
    setSelectedTreasure(treasure);
    if (onTreasureSelect) {
      onTreasureSelect(treasure);
    }
  };

  const handleUserLocationClick = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          setMapZoom(16);
          setLoading(false);
        },
        () => {
          setLoading(false);
        }
      );
    }
  };

  if (loading) {
    return (
      <Card className={`${className} h-72`}>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="h-72 rounded-lg overflow-hidden">
        <MapContainer 
          center={userLocation}
          zoom={mapZoom}
          zoomControl={false}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapController center={userLocation} zoom={mapZoom} />
          
          {/* User location marker */}
          <Marker 
            position={userLocation}
            icon={userIcon}
          >
            <Popup>
              <div className="text-center">
                <strong>{t("maps.yourLocation")}</strong>
              </div>
            </Popup>
          </Marker>
          
          {/* Treasure markers with radius circles */}
          {treasures.map((treasure) => (
            <div key={treasure.id}>
              <Circle
                center={[treasure.location.latitude, treasure.location.longitude]}
                radius={treasure.radius}
                pathOptions={{
                  color: treasure.status === 'LOCKED' ? '#FFD700' : '#4CAF50',
                  fillColor: treasure.status === 'LOCKED' ? '#FFD700' : '#4CAF50',
                  fillOpacity: 0.2
                }}
              />
              <Marker 
                position={[treasure.location.latitude, treasure.location.longitude]}
                icon={treasureIcon}
                eventHandlers={{
                  click: () => handleTreasureClick(treasure),
                }}
              >
                <Popup>
                  <div className="p-1 max-w-xs">
                    <h3 className="font-medium text-sm">
                      {t("treasure.amount")}: {treasure.amount} MAD
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t(`treasure.status.${treasure.status.toLowerCase()}`)}
                    </p>
                    <div className="mt-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {treasure.radius}m {t("treasure.radius")}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </div>
          ))}
        </MapContainer>
      </div>
      
      {/* Map controls */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-2 z-[1000]">
        <Button 
          variant="secondary" 
          size="icon" 
          className="rounded-full shadow-lg"
          onClick={() => setMapZoom(prev => Math.min(prev + 1, 18))}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          className="rounded-full shadow-lg"
          onClick={() => setMapZoom(prev => Math.max(prev - 1, 5))}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          className="rounded-full shadow-lg"
          onClick={handleUserLocationClick}
        >
          <Navigation className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 
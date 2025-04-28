import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './leaflet.css'; // Import our custom Leaflet styles
import { Card, CardContent } from "@/components/ui/card";
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

// Fix Leaflet icon issues with webpack
// Default marker icons in Leaflet don't work well with bundlers like webpack/vite by default
// We need to manually set the proper path for marker icons
const defaultIconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const defaultShadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';
const blueIconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const redIconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png';

// Apply icon fix on client-side only
if (typeof window !== 'undefined') {
  L.Icon.Default.mergeOptions({
    iconUrl: defaultIconUrl,
    shadowUrl: defaultShadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
}

// Custom icon definitions
const blueIcon = new L.Icon({
  iconUrl: blueIconUrl,
  shadowUrl: defaultShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = new L.Icon({
  iconUrl: redIconUrl,
  shadowUrl: defaultShadowUrl,
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

interface Agent {
  id: string;
  name: string;
  distance: number;
  openUntil: string;
  services: string[];
  location: {
    lat: number;
    lng: number;
  };
}

interface LeafletMapProps {
  agents: Agent[];
  onAgentSelect?: (agent: Agent) => void;
  className?: string;
}

export default function LeafletMap({ 
  agents, 
  onAgentSelect, 
  className = ''
}: LeafletMapProps) {
  const { t } = useTranslation();
  const [userLocation, setUserLocation] = useState<[number, number]>([33.5731, -7.5898]); // Default to Casablanca
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
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
          // If location access is denied, just use default and continue
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  }, []);

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent);
    if (onAgentSelect) {
      onAgentSelect(agent);
    }
  };
  
  const handleUserLocationClick = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          setMapZoom(16); // Zoom in more when locating user
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
        <CardContent className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // We'll use the predefined blueIcon for user location

  return (
    <div className={`relative ${className}`}>
      <div className="h-72 rounded-lg overflow-hidden">
        <MapContainer 
          center={[userLocation[0], userLocation[1]]}
          zoom={mapZoom}
          zoomControl={false}
          scrollWheelZoom={true}
          attributionControl={true}
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
            icon={blueIcon}
          >
            <Popup>
              <div className="text-center">
                <strong>{t("maps.yourLocation")}</strong>
              </div>
            </Popup>
          </Marker>
          
          {/* Agent markers */}
          {agents.map((agent) => (
            <Marker 
              key={agent.id}
              position={[agent.location.lat, agent.location.lng]}
              icon={redIcon}
              eventHandlers={{
                click: () => handleAgentClick(agent),
              }}
            >
              <Popup>
                <div className="p-1 max-w-xs">
                  <h3 className="font-medium text-sm">{agent.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {agent.distance} km • {t("agents.openUntil")} {agent.openUntil}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {agent.services.map((service, index) => (
                      <span 
                        key={index} 
                        className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
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
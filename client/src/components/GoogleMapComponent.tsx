import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Navigation, Plus, Minus } from "lucide-react";
import { useTranslation } from "../lib/i18n";

// API key will be injected from environment variables
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

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

interface GoogleMapComponentProps {
  agents: Agent[];
  onAgentSelect?: (agent: Agent) => void;
}

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem'
};

// Casablanca coordinates as default center
const defaultCenter = {
  lat: 33.5731,
  lng: -7.5898
};

export default function GoogleMapComponent({ agents, onAgentSelect }: GoogleMapComponentProps) {
  const { t } = useTranslation();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    setIsLoading(false);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleZoomIn = () => {
    if (map) {
      map.setZoom((map.getZoom() || 10) + 1);
    }
  };

  const handleZoomOut = () => {
    if (map) {
      map.setZoom((map.getZoom() || 10) - 1);
    }
  };

  const locateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(userPos);
          
          if (map) {
            map.panTo(userPos);
            map.setZoom(15);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser');
    }
  };

  useEffect(() => {
    // Try to get user's location when component mounts
    locateUser();
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-72 bg-muted rounded-lg">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  // Check if Google Maps API key is missing
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex items-center justify-center h-72 bg-muted rounded-lg">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t("maps.apiKeyMissing")}</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {t("maps.apiKeyDescription")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative h-72 bg-muted rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/80">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userLocation || defaultCenter}
        zoom={14}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          zoomControl: false,
        }}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 7,
              fillColor: "#3b82f6",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            }}
          />
        )}
        
        {/* Agent markers */}
        {agents.map((agent) => (
          <Marker
            key={agent.id}
            position={agent.location}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            }}
            onClick={() => {
              setSelectedAgent(agent);
              if (onAgentSelect) onAgentSelect(agent);
            }}
          />
        ))}
        
        {/* Info window for selected agent */}
        {selectedAgent && (
          <InfoWindow
            position={selectedAgent.location}
            onCloseClick={() => setSelectedAgent(null)}
          >
            <div className="p-2 max-w-xs">
              <h3 className="font-medium text-sm">{selectedAgent.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedAgent.distance} km • {t("agents.openUntil")} {selectedAgent.openUntil}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedAgent.services.map((service, index) => (
                  <span 
                    key={index} 
                    className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
      
      {/* Map controls */}
      <div className="absolute bottom-3 right-3 flex flex-col space-y-2">
        <Button 
          variant="secondary" 
          size="icon" 
          className="rounded-full shadow-lg"
          onClick={handleZoomIn}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          className="rounded-full shadow-lg"
          onClick={handleZoomOut}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          className="rounded-full shadow-lg"
          onClick={locateUser}
        >
          <Navigation className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
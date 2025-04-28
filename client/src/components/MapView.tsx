import { useState } from 'react';
import GoogleMapsView from './GoogleMapComponent';
import OpenStreetMapView from './LeafletMap';
import { Agent } from '../types/agent';

interface MapViewProps {
  agents: Agent[];
  onAgentSelect: (agent: Agent) => void;
}

export default function MapView({ agents, onAgentSelect }: MapViewProps) {
  const [mapProvider, setMapProvider] = useState<'google' | 'openstreetmap'>('google');

  return (
    <div className="w-full h-full">
      <div className="absolute top-4 right-4 z-10 bg-white p-2 rounded-lg shadow-md">
        <select
          value={mapProvider}
          onChange={(e) => setMapProvider(e.target.value as 'google' | 'openstreetmap')}
          className="p-2 border rounded-md"
        >
          <option value="google">Google Maps</option>
          <option value="openstreetmap">OpenStreetMap</option>
        </select>
      </div>

      {mapProvider === 'google' ? (
        <GoogleMapsView agents={agents} onAgentSelect={onAgentSelect} />
      ) : (
        <OpenStreetMapView agents={agents} onAgentSelect={onAgentSelect} />
      )}
    </div>
  );
} 
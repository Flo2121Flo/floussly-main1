import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "../lib/i18n";
import { ArrowLeft, CreditCard, Headset, PlusCircle, ArrowDownCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AgentItem, { Agent } from "@/components/AgentItem";
import ServiceItem from "@/components/ServiceItem";

import { useAgents } from "@/hooks/use-agents";

export default function AgentMap() {
  const [_, setLocation] = useLocation();
  const { t } = useTranslation();
  const { nearestAgents, services } = useAgents();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // Add location info to agents for OpenStreetMap with Leaflet
  const agentsWithLocation = nearestAgents.map((agent: Agent) => ({
    ...agent,
    location: {
      lat: 33.57 + (Math.random() * 0.1 - 0.05),  // Random positions around Casablanca
      lng: -7.59 + (Math.random() * 0.1 - 0.05)
    }
  }));

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent.id);
  };

  return (
    <div className="p-6 pt-12 pb-20">
      <Button 
        variant="ghost" 
        className="mb-8 flex items-center text-muted-foreground p-0"
        onClick={() => setLocation("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("nav.back")}
      </Button>
      
      <h1 className="font-poppins font-bold text-3xl mb-3">{t("agents.network")}</h1>
      <p className="text-muted-foreground mb-6">{t("agents.findNear")}</p>
      
      {/* Map Implementation */}
      <div className="mb-6">
        <Card className="h-72 overflow-hidden">
          <CardContent className="p-0 h-full relative">
            <iframe 
              src="https://www.openstreetmap.org/export/embed.html?bbox=-7.6697,33.5008,-7.4997,33.6454&layer=mapnik&marker=33.5731,-7.5898" 
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Map of Casablanca"
            ></iframe>
            
            {/* Map Controls */}
            <div className="absolute bottom-3 right-3 flex gap-2 z-[1000]">
              <Button 
                variant="secondary" 
                className="h-8 w-8 p-0 rounded-full shadow-lg text-sm font-bold"
              >
                +
              </Button>
              <Button 
                variant="secondary" 
                className="h-8 w-8 p-0 rounded-full shadow-lg text-sm font-bold"
              >
                -
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <h3 className="font-medium mb-4">{t("agents.nearest")}</h3>
          
          {nearestAgents.map((agent: Agent) => (
            <AgentItem 
              key={agent.id} 
              agent={agent}
            />
          ))}
          
          <Button 
            variant="link" 
            className="w-full py-2 text-sm text-primary font-medium mt-2 p-0"
          >
            {t("agents.viewAll")}
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-4">{t("agents.servicesAvailable")}</h3>
          
          <div className="grid grid-cols-2 gap-3">
            {services.map((service) => (
              <ServiceItem 
                key={service.id}
                icon={serviceIconMap[service.icon]}
                label={service.name}
                color={service.color}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Map the icon strings to Lucide components
const serviceIconMap: Record<string, any> = {
  "plus": PlusCircle,
  "arrow-down": ArrowDownCircle,
  "credit-card": CreditCard,
  "headset": Headset
};

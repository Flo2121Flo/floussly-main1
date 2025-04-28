import { useTranslation } from "../lib/i18n";
import { Store, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface Agent {
  id: string;
  name: string;
  distance: number;
  openUntil: string;
  services: string[];
}

interface AgentItemProps {
  agent: Agent;
}

export default function AgentItem({ agent }: AgentItemProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const { name, distance, openUntil } = agent;
  
  const handleClick = () => {
    toast({
      title: t("agents.viewAgentTitle"),
      description: t("agents.viewAgentDescription", { name }),
    });
  };
  
  return (
    <div className="flex items-center py-3 border-b border-border">
      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mr-3">
        <Store className="text-primary" size={20} />
      </div>
      <div className="flex-1">
        <p className="font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">
          {t("agents.distanceAndHours", { distance, openUntil })}
        </p>
      </div>
      <button 
        className="w-8 h-8 bg-muted rounded-full flex items-center justify-center"
        onClick={handleClick}
      >
        <ChevronRight className="text-muted-foreground" size={16} />
      </button>
    </div>
  );
}

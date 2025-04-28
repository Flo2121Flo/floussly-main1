import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Agent } from "@/components/AgentItem";
import { useAuth } from "@/context/AuthContext";

interface AgentService {
  id: string;
  name: string;
  icon: string;
  color: "blue" | "green" | "purple" | "orange";
}

export function useAgents() {
  const { isAuthenticated } = useAuth();
  
  // Mock agents for demo
  const [localAgents, setLocalAgents] = useState<Agent[]>([
    {
      id: "agent-1",
      name: "Marjane Agent",
      distance: 0.5,
      openUntil: "8:00 PM",
      services: ["top_up", "withdraw", "bill_payment"]
    },
    {
      id: "agent-2",
      name: "Carrefour Agent",
      distance: 1.2,
      openUntil: "10:00 PM",
      services: ["top_up", "withdraw", "bill_payment", "support"]
    },
    {
      id: "agent-3",
      name: "Aswak Assalam Agent",
      distance: 1.8,
      openUntil: "9:00 PM",
      services: ["top_up", "withdraw"]
    }
  ]);
  
  // Mock services for demo
  const [localServices] = useState<AgentService[]>([
    {
      id: "service-1",
      name: "Top Up",
      icon: "plus",
      color: "blue"
    },
    {
      id: "service-2",
      name: "Withdraw",
      icon: "arrow-down",
      color: "green"
    },
    {
      id: "service-3",
      name: "Bill Payment",
      icon: "credit-card",
      color: "purple"
    },
    {
      id: "service-4",
      name: "Support",
      icon: "headset",
      color: "orange"
    }
  ]);
  
  const { data: agents, isLoading: isLoadingAgents, error: agentsError } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
    enabled: isAuthenticated,
    // If API fails, use local state
    onError: () => {
      return localAgents;
    }
  });
  
  // Update local agents when query data changes
  useEffect(() => {
    if (agents) {
      setLocalAgents(agents);
    }
  }, [agents]);
  
  return {
    agents: agents || localAgents,
    nearestAgents: (agents || localAgents).slice(0, 3),
    services: localServices,
    isLoading: isLoadingAgents,
    error: agentsError
  };
}

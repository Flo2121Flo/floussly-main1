import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tontine } from "@/components/TontineCard";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CreateTontineData {
  name: string;
  amount: number;
  totalMembers: number;
  startDate: string;
}

export function useTontines() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Mock tontines for demo
  const [localTontines, setLocalTontines] = useState<Tontine[]>([
    {
      id: "tontine-1",
      name: "Family Daret",
      amount: 1000,
      currency: "MAD",
      totalMembers: 10,
      currentCycle: 4,
      status: "active",
      nextPaymentDate: "25 Oct"
    },
    {
      id: "tontine-2",
      name: "Office Colleagues",
      amount: 2000,
      currency: "MAD",
      totalMembers: 8,
      currentCycle: 2,
      status: "payment_due",
      nextPaymentDate: "Today"
    },
    {
      id: "tontine-3",
      name: "Neighborhood",
      amount: 500,
      currency: "MAD",
      totalMembers: 6,
      currentCycle: 6,
      status: "completed",
      endDate: "10 Sep 2025"
    }
  ]);
  
  const { data: tontines, isLoading, error } = useQuery<Tontine[]>({
    queryKey: ["/api/tontines"],
    enabled: isAuthenticated,
    // If API fails, use local state
    onError: () => {
      return localTontines;
    }
  });
  
  // Update local tontines when query data changes
  useEffect(() => {
    if (tontines) {
      setLocalTontines(tontines);
    }
  }, [tontines]);
  
  const createTontineMutation = useMutation({
    mutationFn: async (data: CreateTontineData) => {
      const response = await apiRequest("POST", "/api/tontines", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tontines"] });
      
      toast({
        title: "Tontine Created",
        description: "Your tontine has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to Create Tontine",
        description: "Unable to create tontine. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const joinTontineMutation = useMutation({
    mutationFn: async (tontineId: string) => {
      const response = await apiRequest("POST", `/api/tontines/${tontineId}/join`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tontines"] });
      
      toast({
        title: "Joined Tontine",
        description: "You have successfully joined the tontine.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to Join Tontine",
        description: "Unable to join tontine. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  return {
    tontines: tontines || localTontines,
    activeTontines: (tontines || localTontines).filter(t => t.status !== "completed"),
    pastTontines: (tontines || localTontines).filter(t => t.status === "completed"),
    isLoading,
    error,
    createTontine: (data: CreateTontineData) => createTontineMutation.mutate(data),
    joinTontine: (tontineId: string) => joinTontineMutation.mutate(tontineId)
  };
}

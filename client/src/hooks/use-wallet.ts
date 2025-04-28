import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  updatedAt: string;
}

interface TopUpData {
  amount: number;
  method: "bank_transfer" | "credit_card" | "cash_agent";
}

interface WithdrawData {
  amount: number;
  method: "bank_transfer" | "cash_agent";
}

export function useWallet() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // For demo purposes, use a local state as fallback while query loads
  const [localWallet, setLocalWallet] = useState<Wallet>({
    id: "wallet-1",
    userId: "user-1",
    balance: 5241.50,
    currency: "MAD",
    updatedAt: new Date().toISOString()
  });
  
  // Disable the API query for now and just use mock data
  // const { data: wallet, isLoading, error } = useQuery<Wallet>({
  //   queryKey: ["/api/wallet"],
  //   // If API fails, use local state
  //   onError: () => {
  //     return localWallet;
  //   }
  // });
  
  // Use mock data always for testing
  const wallet = localWallet;
  const isLoading = false;
  const error = null;
  
  // Update local wallet when query data changes
  useEffect(() => {
    if (wallet) {
      setLocalWallet(wallet);
    }
  }, [wallet]);
  
  const topUpMutation = useMutation({
    mutationFn: async (data: TopUpData) => {
      const response = await apiRequest("POST", "/api/wallet/top-up", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      // For demo, update local state
      setLocalWallet({
        ...localWallet,
        balance: localWallet.balance + 1000, // Default amount
        updatedAt: new Date().toISOString()
      });
      
      toast({
        title: "Top Up Successful",
        description: "Your wallet has been topped up.",
      });
    },
    onError: () => {
      toast({
        title: "Top Up Failed",
        description: "Unable to top up your wallet. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const withdrawMutation = useMutation({
    mutationFn: async (data: WithdrawData) => {
      const response = await apiRequest("POST", "/api/wallet/withdraw", data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      // For demo, update local state
      setLocalWallet({
        ...localWallet,
        balance: localWallet.balance - variables.amount,
        updatedAt: new Date().toISOString()
      });
      
      toast({
        title: "Withdrawal Successful",
        description: "Your withdrawal has been processed.",
      });
    },
    onError: () => {
      toast({
        title: "Withdrawal Failed",
        description: "Unable to process your withdrawal. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  return {
    wallet: wallet || localWallet,
    isLoading,
    error,
    topUp: (data: TopUpData) => topUpMutation.mutate(data),
    withdraw: (data: WithdrawData) => withdrawMutation.mutate(data)
  };
}

import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Daret, DaretMember, User, InsertDaret } from "@shared/schema";
import { useTranslation } from "@/lib/i18n";

export interface DaretWithMembers extends Daret {
  members: (DaretMember & { user: User })[];
}

export interface CreateDaretData {
  name: string;
  amount: number;
  totalMembers: number;
  startDate: Date | string;
  currency?: string;
}

export function useDarets() {
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const { data: darets, isLoading, error } = useQuery<DaretWithMembers[]>({
    queryKey: ['/api/darets'],
    queryFn: getQueryFn(),
  });
  
  const createDaretMutation = useMutation({
    mutationFn: async (data: CreateDaretData) => {
      const response = await apiRequest("POST", "/api/darets", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/darets'] });
      
      toast({
        title: t("daret.createdTitle"),
        description: t("daret.createdDescription"),
      });
    },
    onError: () => {
      toast({
        title: t("daret.createFailedTitle"),
        description: t("daret.createFailedDescription"),
        variant: "destructive",
      });
    }
  });
  
  const joinDaretMutation = useMutation({
    mutationFn: async (daretId: number) => {
      const response = await apiRequest("POST", `/api/darets/${daretId}/join`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/darets'] });
      
      toast({
        title: t("daret.joinedTitle"),
        description: t("daret.joinedDescription"),
      });
    },
    onError: () => {
      toast({
        title: t("daret.joinFailedTitle"),
        description: t("daret.joinFailedDescription"),
        variant: "destructive",
      });
    }
  });
  
  return {
    darets: darets || [],
    activeDarets: (darets || []).filter(d => d.status !== "completed"),
    completedDarets: (darets || []).filter(d => d.status === "completed"),
    paymentDueDarets: (darets || []).filter(d => d.status === "payment_due"),
    isLoading,
    error,
    createDaret: (data: CreateDaretData) => createDaretMutation.mutate(data),
    joinDaret: (daretId: number) => joinDaretMutation.mutate(daretId)
  };
}
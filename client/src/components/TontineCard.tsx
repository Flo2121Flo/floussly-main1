import { useTranslation } from "../lib/i18n";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

export interface Tontine {
  id: string | number;
  name: string;
  amount: number;
  currency?: string;
  totalMembers: number;
  currentCycle?: number;
  activeMembers?: number;
  status: string;
  creatorId?: string | number;
  nextPaymentDate?: string;
  endDate?: string;
  startDate?: string;
  totalContributed?: number;
  isCreator?: boolean;
  position?: number;
}

interface TontineCardProps {
  tontine: Tontine;
}

export default function TontineCard({ tontine }: TontineCardProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const { 
    name, 
    amount, 
    currency, 
    totalMembers, 
    currentCycle, 
    status, 
    nextPaymentDate, 
    endDate 
  } = tontine;
  
  const progressPercentage = ((currentCycle || 0) / totalMembers) * 100;
  
  const getStatusBadgeClass = () => {
    switch (status) {
      case "active":
        return "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300";
      case "payment_due":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300";
      case "completed":
        return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300";
    }
  };
  
  const handleViewDetails = () => {
    toast({
      title: t("tontine.viewDetailsTitle"),
      description: t("tontine.viewDetailsDescription", { name }),
    });
  };
  
  return (
    <div className="bg-card rounded-lg p-4 mb-4 card-shadow">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-poppins font-medium">{name}</h4>
        <span className={`${getStatusBadgeClass()} text-xs px-2 py-1 rounded`}>
          {t(`tontine.status.${status}`)}
        </span>
      </div>
      
      <div className="flex justify-between text-sm text-muted-foreground mb-3">
        <span>{t("tontine.monthly", { currency: currency || "MAD", amount })}</span>
        <span>{t("tontine.members", { count: totalMembers })}</span>
      </div>
      
      <Progress value={progressPercentage} className="h-2 mb-2" />
      
      <div className="flex justify-between text-xs text-muted-foreground mb-4">
        <span>
          {t("tontine.cyclesCompleted", { current: currentCycle || 0, total: totalMembers })}
        </span>
        <span>
          {status === "completed" 
            ? t("tontine.ended", { date: endDate || t("common.unknown") }) 
            : t("tontine.nextPayment", { date: nextPaymentDate || t("common.upcoming") })}
        </span>
      </div>
      
      <button 
        className="w-full py-2 text-sm text-primary font-medium"
        onClick={handleViewDetails}
      >
        {status === "completed" 
          ? t("tontine.viewHistory") 
          : t("tontine.viewDetails")}
      </button>
    </div>
  );
}

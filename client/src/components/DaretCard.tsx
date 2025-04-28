import { useTranslation } from "../lib/i18n";
import { useLocation } from "wouter";
import { Calendar, ChevronRight, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Daret } from "@shared/schema";

interface DaretCardProps {
  daret: Daret;
  members: any[]; // Replace with proper type when available
}

export default function DaretCard({ daret, members }: DaretCardProps) {
  const { t } = useTranslation();
  const [_, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Extract daret details
  const { 
    id, 
    name, 
    amount, 
    currency, 
    totalMembers, 
    currentCycle, 
    status,
    startDate,
    endDate,
    nextPaymentDate
  } = daret;
  
  // Format dates using current locale
  const formatDate = (date: string | Date | null) => {
    const { i18n } = useTranslation();
    if (!date) return t("common.dataUnavailable");
    return new Date(date).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' });
  };
  
  // Status badge style
  const getStatusClass = () => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'payment_due': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  const handleViewDaretDetails = () => {
    setIsDialogOpen(true);
  };
  
  return (
    <>
      <Card className="mb-4 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-semibold text-lg">{name}</h3>
              <Badge className={`mt-1 ${getStatusClass()}`}>
                {t(`daret.status.${status}`)}
              </Badge>
            </div>
            <div className="flex">
              {members.slice(0, 3).map((member, idx) => (
                <Avatar key={member.userId} className={`h-8 w-8 ${idx > 0 ? '-ml-3' : ''} border-2 border-background`}>
                  <AvatarImage src={member.user?.profileImage} alt={member.user?.name} />
                  <AvatarFallback>{member.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              ))}
              {members.length > 3 && (
                <Avatar className="h-8 w-8 -ml-3 border-2 border-background">
                  <AvatarFallback>+{members.length - 3}</AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
          
          <div className="space-y-1 text-sm text-muted-foreground mb-6">
            <div className="flex justify-between">
              <span>{t("daret.monthly", { currency, amount })}</span>
              <span>{t("daret.members", { count: totalMembers })}</span>
            </div>
            
            <div className="flex justify-between">
              <div className="flex items-center">
                <Users className="h-3.5 w-3.5 mr-1" />
                {t("daret.cyclesCompleted", { current: currentCycle, total: totalMembers })}
              </div>
              <div className="flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                {status === 'completed' 
                  ? t("daret.ended", { date: formatDate(endDate) }) 
                  : t("daret.nextPayment", { date: formatDate(nextPaymentDate) })}
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full flex justify-between" 
            onClick={handleViewDaretDetails}
          >
            {status === 'completed' 
              ? t("daret.viewHistory") 
              : t("daret.viewDetails")}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("daret.viewDetailsTitle")}</DialogTitle>
            <DialogDescription>
              {t("daret.viewDetailsDescription", { name })}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">{t("daret.details")}</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">{t("daret.amount")}</span>
                  <span>{currency} {amount}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">{t("daret.totalCycles")}</span>
                  <span>{totalMembers}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">{t("daret.currentCycle")}</span>
                  <span>{currentCycle} / {totalMembers}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">{t("daret.startDate")}</span>
                  <span>{formatDate(startDate)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">{t("daret.nextPayment")}</span>
                  <span>{formatDate(nextPaymentDate)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">{t("daret.status.label")}</span>
                  <Badge className={getStatusClass()}>
                    {t(`daret.status.${status}`)}
                  </Badge>
                </li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">{t("daret.members")} ({members.length}/{totalMembers})</h4>
              <div className="space-y-2">
                {members.map((member, index) => (
                  <div key={member.userId} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={member.user?.profileImage} alt={member.user?.name} />
                        <AvatarFallback>{member.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <span>{member.user?.name || `${t("daret.members")} ${index + 1}`}</span>
                    </div>
                    <Badge variant={member.order === currentCycle ? "default" : "outline"}>
                      {member.order === currentCycle ? t("daret.current") : `${t("daret.cycle")} ${member.order}`}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
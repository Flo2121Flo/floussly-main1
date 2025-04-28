import { useTranslation } from "../lib/i18n";
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowRight, 
  PiggyBank, 
  BarChart3, 
  BarChart4, 
  CalendarRange, 
  CreditCard,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

interface FinancialData {
  income: number;
  expenses: number;
  savings: number;
  currency: string;
  timePeriod: string;
  chartData: number[];
}

export default function FinancialSummary() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [timePeriod, setTimePeriod] = useState("month");
  const [_, setLocation] = useLocation();
  
  // Financial data - in a real app this would come from an API
  const financialData: FinancialData = {
    income: 4500,
    expenses: 2345,
    savings: 2155,
    currency: t("common.currency"),
    timePeriod: "month",
    chartData: [50, 75, 33, 80, 66, 50, 25]
  };
  
  const handleViewAnalytics = () => {
    setLocation("/finance-overview");
  };
  
  const calculateSavingsPercentage = () => {
    if (financialData.income === 0) return 0;
    return Math.round((financialData.savings / financialData.income) * 100);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="mb-12"
    >
      <Card className="bg-card/50 backdrop-blur-sm border border-border/40 shadow-sm overflow-hidden">
        <CardHeader className="px-6 pb-4 pt-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <BarChart4 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-medium">{t("finance.summary")}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  {t("finance.financialOverview")}
                </CardDescription>
              </div>
            </div>
            
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="h-8 text-xs bg-muted/50 border-border/30 w-[120px]">
                <CalendarRange className="h-3 w-3 mr-1" />
                <SelectValue placeholder={t("finance.thisMonth")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">{t("finance.thisMonth")}</SelectItem>
                <SelectItem value="lastMonth">{t("finance.lastMonth")}</SelectItem>
                <SelectItem value="quarter">{t("finance.lastQuarter")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent className="px-6 pb-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-background/60 backdrop-blur-sm rounded-lg p-4 border border-border/30 shadow-sm">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <ArrowUp className="h-3 w-3 text-green-500" />
                </div>
                <p className="text-xs text-muted-foreground">{t("finance.income")}</p>
              </div>
              <p className="text-base font-medium">
                {financialData.currency} {new Intl.NumberFormat().format(financialData.income)}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-500">+12.5% </span>
                <span className="text-xs text-muted-foreground ml-1">{t("finance.vsLast", { period: t(`finance.${timePeriod}`) })}</span>
              </div>
            </div>
            
            <div className="bg-background/60 backdrop-blur-sm rounded-lg p-4 border border-border/30 shadow-sm">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="h-6 w-6 rounded-full bg-red-500/20 flex items-center justify-center">
                  <ArrowDown className="h-3 w-3 text-red-500" />
                </div>
                <p className="text-xs text-muted-foreground">{t("finance.expenses")}</p>
              </div>
              <p className="text-base font-medium">
                {financialData.currency} {new Intl.NumberFormat().format(financialData.expenses)}
              </p>
              <div className="flex items-center mt-2">
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                <span className="text-xs text-red-500">-3.2% </span>
                <span className="text-xs text-muted-foreground ml-1">{t("finance.vsLast", { period: t(`finance.${timePeriod}`) })}</span>
              </div>
            </div>
            
            <div className="bg-background/60 backdrop-blur-sm rounded-lg p-4 border border-border/30 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <PiggyBank className="h-3 w-3 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">{t("finance.savings")}</p>
              </div>
              <p className="text-base font-medium">
                {financialData.currency} {new Intl.NumberFormat().format(financialData.savings)}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-xs font-medium">{calculateSavingsPercentage()}% </span>
                <span className="text-xs text-muted-foreground ml-1">{t("finance.ofIncome")}</span>
              </div>
              
              {/* Visual indicator for savings percentage */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/40">
                <div 
                  className="h-full bg-primary/70" 
                  style={{ width: `${calculateSavingsPercentage()}%` }} 
                />
              </div>
            </div>
          </div>
          
          <div className="bg-muted/5 backdrop-blur-sm border border-border/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">{t("finance.spendingByCategory")}</h4>
              <Button variant="ghost" size="sm" className="h-7 text-xs px-2">
                <BarChart3 className="h-3 w-3 mr-1" />
                {t("finance.analyze")}
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="rounded-lg bg-background/70 p-3 flex items-center justify-between border border-border/30">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CreditCard className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t("budget.category.groceries")}</p>
                    <p className="text-xs text-muted-foreground">{financialData.currency} 850</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-xs font-medium mr-4">36%</span>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              
              <div className="rounded-lg bg-background/70 p-3 flex items-center justify-between border border-border/30">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <CreditCard className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t("budget.category.rent")}</p>
                    <p className="text-xs text-muted-foreground">{financialData.currency} 650</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-xs font-medium mr-4">28%</span>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              
              <div className="rounded-lg bg-background/70 p-3 flex items-center justify-between border border-border/30">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <CreditCard className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t("budget.category.transport")}</p>
                    <p className="text-xs text-muted-foreground">{financialData.currency} 420</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-xs font-medium mr-4">18%</span>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="px-6 py-3 border-t border-border/20 flex justify-center">
          <Button 
            variant="link" 
            size="sm"
            className="text-xs text-muted-foreground hover:text-primary"
            onClick={handleViewAnalytics}
          >
            {t("finance.viewDetailedAnalytics")}
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useTranslation } from "../lib/i18n";
import { ArrowLeft, Clock, AlertCircle, CheckCircle, CreditCard, Download, Share2, ArrowUpRight, ArrowDownLeft, Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useTransactions } from "@/hooks/use-transactions";
import { Transaction } from "@/components/TransactionItem";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function TransactionDetail() {
  const [_, setLocation] = useLocation();
  const [match, params] = useRoute<{ id: string }>("/transaction/:id");
  const { t } = useTranslation();
  
  // Get transaction ID from URL
  const searchParams = new URLSearchParams(window.location.search);
  const type = searchParams.get("type") || "";
  const amount = searchParams.get("amount") ? Number(searchParams.get("amount")) : 0;
  const title = searchParams.get("title") || "";
  
  const { transactions } = useTransactions();
  const [transaction, setTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    if (params?.id) {
      // Find transaction by ID
      const found = transactions.find(tx => tx.id === params.id);
      if (found) {
        setTransaction(found);
      } else {
        // If not found but we have parameters, create a temporary transaction object
        if (type && amount && title) {
          setTransaction({
            id: params.id,
            type: type as "send" | "receive" | "topup" | "withdraw",
            title: decodeURIComponent(title),
            amount: amount,
            currency: t("common.currency"),
            date: "tx_today_1430",
            status: "completed",
            category: type === "topup" ? "wallet" : "transfer"
          });
        }
      }
    }
  }, [params, transactions, type, amount, title]);

  if (!transaction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-xl font-semibold mb-2">{t("transaction.notFound")}</h1>
        <p className="text-muted-foreground mb-6 text-center">
          {t("transaction.transactionNotFound")}
        </p>
        <Button onClick={() => setLocation("/transactions")}>
          {t("transaction.backToTransactions")}
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "pending":
        return "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400";
      case "failed":
        return "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5" />;
      case "pending":
        return <Clock className="h-5 w-5" />;
      case "failed":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "send":
        return <ArrowUpRight className="h-10 w-10" />;
      case "receive":
        return <ArrowDownLeft className="h-10 w-10" />;
      case "topup":
        return <Plus className="h-10 w-10" />;
      case "withdraw":
        return <Download className="h-10 w-10" />;
      default:
        return <CreditCard className="h-10 w-10" />;
    }
  };
  
  const getBackgroundColor = (type: string) => {
    switch (type) {
      case "send":
        return "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 text-blue-500 dark:text-blue-300";
      case "receive":
        return "from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/30 text-emerald-500 dark:text-emerald-300";
      case "topup":
        return "from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/30 text-amber-500 dark:text-amber-300";
      case "withdraw":
        return "from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/30 text-rose-500 dark:text-rose-300";
      default:
        return "from-muted/30 to-muted/50 text-foreground";
    }
  };
  
  const getAmountColor = (type: string) => {
    return type === "send" || type === "withdraw" 
      ? "text-rose-500 dark:text-rose-400" 
      : "text-emerald-600 dark:text-emerald-400";
  };
  
  const getAmountPrefix = (type: string) => {
    return type === "send" || type === "withdraw" ? "-" : "+";
  };
  
  // Format the date string
  const formatTransactionDate = (dateStr: string) => {
    if (dateStr === "tx_today_1430") {
      return `${t('common.today')}, 14:30`;
    }
    
    if (dateStr === "tx_yesterday_0915") {
      return `${t('common.yesterday')}, 09:15`;
    }
    
    if (dateStr === "tx_date_1645") {
      const monthIndex = 9; // Oct
      const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const monthKey = monthKeys[monthIndex];
      const translatedMonth = t(`common.months.${monthKey}`);
      
      return `20 ${translatedMonth}, 16:45`;
    }
    
    return dateStr;
  };

  // Transaction type localization
  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case "send":
        return t("transaction.sentTo");
      case "receive":
        return t("transaction.receivedFrom");
      case "topup":
        return t("transaction.topUp");
      case "withdraw":
        return t("transaction.withdrawal");
      default:
        return t("transaction.transaction");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-6 pt-12 pb-20"
    >
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="mb-4 flex items-center text-muted-foreground p-0"
          onClick={() => setLocation("/transactions")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("nav.back")}
        </Button>
        
        <h1 className="text-2xl font-bold mb-1">
          {getTransactionTypeLabel(transaction.type)}
        </h1>
        <p className="text-muted-foreground">
          {formatTransactionDate(transaction.date)}
        </p>
      </div>
      
      {/* Transaction Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            {/* Transaction icon */}
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getBackgroundColor(transaction.type)} flex items-center justify-center shadow-sm`}>
              {getTypeIcon(transaction.type)}
            </div>
            
            {/* Amount */}
            <div className="text-right">
              <p className={`text-3xl font-bold ${getAmountColor(transaction.type)}`}>
                {getAmountPrefix(transaction.type)}{transaction.currency} {new Intl.NumberFormat().format(transaction.amount)}
              </p>
              <Badge className={cn("mt-2", getStatusColor(transaction.status))}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(transaction.status)}
                  <span className="uppercase text-xs tracking-wide">
                    {t(`transaction.status.${transaction.status}`)}
                  </span>
                </span>
              </Badge>
            </div>
          </div>
          
          {/* Details */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">{t("transaction.reference")}</p>
              <p className="font-medium">{transaction.id}</p>
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">{t("transaction.title")}</p>
              <p className="font-medium">{transaction.title}</p>
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">{t("transaction.category")}</p>
              <p className="font-medium capitalize">{transaction.category || "transfer"}</p>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          {/* Transaction Service */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`https://avatar.vercel.sh/${transaction.id}`} alt="Service" />
                <AvatarFallback><Wallet className="h-5 w-5" /></AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{t("wallet.title")}</p>
                <p className="text-xs text-muted-foreground">{t("wallet.service")}</p>
              </div>
            </div>
            <div>
              <Button variant="outline" size="sm" className="w-8 h-8 p-0 rounded-full">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Actions */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        <Button 
          variant="outline" 
          className="flex flex-col items-center justify-center py-6"
          onClick={() => window.print()}
        >
          <Download className="h-6 w-6 mb-2" />
          <span>{t("common.download")}</span>
        </Button>
        
        <Button 
          className="flex flex-col items-center justify-center py-6 bg-primary text-primary-foreground"
          onClick={() => setLocation("/send-money")}
        >
          <ArrowUpRight className="h-6 w-6 mb-2" />
          <span>{t("actions.send")}</span>
        </Button>
      </div>
    </motion.div>
  );
}
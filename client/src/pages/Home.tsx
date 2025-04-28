import { useLocation } from "wouter";
import { useTranslation } from "../lib/i18n";
import { useAuth } from "@/context/AuthContext";
import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import WalletCard from "@/components/WalletCard";
import QuickActions from "@/components/QuickActions";
import TransactionItem from "@/components/TransactionItem";
import FinancialSummary from "@/components/FinancialSummary";
import MonthlyTransactionChart from "@/components/MonthlyTransactionChart";
import SavingsChallenges from "@/components/SavingsChallenges";
import { useTransactions } from "@/hooks/use-transactions";
import { useNotifications } from "@/hooks/use-notifications";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [_, setLocation] = useLocation();
  const { t } = useTranslation();
  // Try to use authenticated user, or fall back to a mock user for testing
  let { user } = useAuth();
  const { recentTransactions } = useTransactions();
  const { unreadCount } = useNotifications();

  // Create a mock user for testing if no user is found
  if (!user) {
    user = {
      id: 1,
      username: "mohammed",
      password: "password",
      name: "Mohammed Alami", 
      phone: "+212600000000",
      email: "mohammed@floussly.ma",
      profileImage: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=200&ixid=MnwxfDB8MXxyYW5kb218MHx8cGVyc29ufHx8fHx8MTY5OTUzMjQ1Ng&ixlib=rb-4.0.3&q=80",
      isVerified: true,
      role: "user",
      language: "en",
      createdAt: new Date()
    };
  }

  return (
    <div className="pb-24 max-w-7xl mx-auto">
      {/* Enhanced Header with More Visual Appeal */}
      <div className="relative overflow-hidden rounded-b-[2.5rem] shadow-md border-x border-b border-border/30">
        {/* Moroccan-inspired background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48cGF0aCBkPSJNMzAgNDVsMTUtMTVIMTVsMTUgMTV6IiBmaWxsPSJjdXJyZW50Q29sb3IiIGZpbGwtb3BhY2l0eT0iMC4wMyIvPjwvc3ZnPg==')] opacity-5"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-secondary/10 rounded-full blur-3xl translate-y-1/2"></div>
      
        <div className="p-6 pt-14 pb-10 flex flex-col space-y-4 relative z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="mr-4 relative group">
                <Avatar 
                  className="w-14 h-14 border-2 border-background shadow-lg cursor-pointer transition-all duration-300 group-hover:shadow-primary/20 group-hover:scale-105"
                  onClick={() => setLocation("/profile")}
                >
                  <AvatarImage src={user.profileImage || ''} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-semibold">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-background rounded-full"></div>
                
                {/* Hover hint */}
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 translate-y-full mt-1 px-2 py-1 bg-background/80 backdrop-blur-sm text-xs rounded-md border border-border/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-sm">
                  {t("profile.viewProfile")}
                </span>
              </div>
              <div 
                className="cursor-pointer transition-all duration-300 hover:translate-x-1"
                onClick={() => setLocation("/profile")}
              >
                <p className="text-sm font-medium text-muted-foreground">{t("home.welcomeBack")}</p>
                <h2 className="text-xl font-bold tracking-tight">{user.name}</h2>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon"
                className="relative bg-muted/50 hover:bg-muted rounded-xl transition-all duration-300 hover:shadow-md"
                onClick={() => setLocation("/notifications")}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-primary text-white shadow-sm animate-pulse-fast">
                    {unreadCount}
                  </Badge>
                )}
                <span className="sr-only">{t("notifications.title")}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="bg-muted/50 hover:bg-muted rounded-xl transition-all duration-300 hover:shadow-md hover:rotate-12"
                onClick={() => setLocation("/settings")}
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">{t("settings.title")}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Card */}
      <div className="px-6 mb-6">
        <WalletCard />
      </div>
      
      {/* Quick Actions */}
      <div className="px-6 mb-8">
        <QuickActions />
      </div>
      
      {/* Recent Transactions */}
      <div className="px-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 4L21 9M3 9V17L12 22M3 9L12 13M12 22L21 17V9M12 22V13M21 9L12 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="font-medium text-lg tracking-tight">{t("home.recentTransactions")}</h3>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-xs font-medium text-primary/80 hover:text-primary hover:bg-primary/5 rounded-lg flex items-center gap-1 px-3 h-8 transition-colors group" 
            onClick={() => setLocation("/transactions")}
          >
            <span>{t("home.seeAll")}</span>
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="transition-transform group-hover:translate-x-0.5"
            >
              <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Button>
        </div>
        
        <div className="space-y-1 bg-muted/10 backdrop-blur-sm rounded-xl p-3 border border-border/40">
          {recentTransactions.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 mb-4 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shadow-sm">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary/70">
                  <path d="M12 8V16M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{t("transaction.noTransactions")}</p>
              <p className="text-xs text-muted-foreground/70 max-w-[200px] mb-3">{t("transaction.startTransactingDesc")}</p>
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs font-medium px-4 py-2 h-auto bg-primary/5 border-primary/20 text-primary hover:bg-primary/10 hover:text-primary transition-all" 
                onClick={() => setLocation("/send-money")}
              >
                {t("transaction.sendMoney")}
              </Button>
            </div>
          ) : (
            recentTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))
          )}
          
          <div className="pt-2 text-center">
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs w-full bg-gradient-to-r from-background/80 to-background/60 border-dashed border-primary/30 shadow-sm hover:shadow-md hover:border-primary/40 transition-all group relative overflow-hidden" 
              onClick={() => setLocation("/send-money")}
            >
              {/* Button shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <div className="w-5 h-5 rounded-full mr-2 bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-medium">{t("transaction.newTransaction")}</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Monthly Transaction Chart */}
      <div className="px-6 mb-8">
        <MonthlyTransactionChart 
          height={350} 
          showProjection={true}
          mainColor="hsl(var(--primary))"
          secondaryColor="hsl(52, 98%, 50%)"
          simpleMode={true}
          chartType="line"
        />
      </div>
      
      {/* Savings Challenges */}
      <div className="px-6 mb-8">
        <SavingsChallenges />
      </div>
      
      {/* Financial Summary */}
      <div className="px-6">
        <FinancialSummary />
      </div>
    </div>
  );
}

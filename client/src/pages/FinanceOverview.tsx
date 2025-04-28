import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "../lib/i18n";
import { 
  ArrowLeft, FileDown, File, Plus, ActivitySquare, Heart, 
  Wallet, ArrowUpRight, ArrowDownRight, CalendarDays, 
  BarChart3, PieChart, TrendingUp, Banknote, DollarSign,
  ArrowRightLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BudgetItem, { Budget } from "@/components/BudgetItem";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DailySpendingChart from "@/components/DailySpendingChart";
import MonthlyTransactionChart from "@/components/MonthlyTransactionChart";
import SavingsComparisonChart from "@/components/SavingsComparisonChart";
import { motion } from "framer-motion";

export default function FinanceOverview() {
  const [_, setLocation] = useLocation();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [timePeriod, setTimePeriod] = useState("month");
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '12m'>('6m');
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);

  // Mock financial data
  const financialData = {
    income: 4500,
    expenses: 2345,
    savings: 2155,
    currency: t("common.currency"),
    chartData: [25, 50, 75, 33, 66, 50, 25]
  };

  // Mock budget data
  const budgets: Budget[] = [
    {
      id: "budget-1",
      category: "groceries",
      spent: 1055,
      limit: 1200,
      currency: t("common.currency"),
      percentage: 88
    },
    {
      id: "budget-2",
      category: "transport",
      spent: 586,
      limit: 800,
      currency: t("common.currency"),
      percentage: 73
    },
    {
      id: "budget-3",
      category: "entertainment",
      spent: 422,
      limit: 400,
      currency: t("common.currency"),
      percentage: 105
    }
  ];

  const handleExportCSV = () => {
    toast({
      title: t("common.exportStarted", "Export Started"),
      description: t("common.exportCSVDescription", "Your financial data is being exported as CSV")
    });
  };

  const handleExportPDF = () => {
    toast({
      title: t("common.exportStarted", "Export Started"),
      description: t("common.exportPDFDescription", "Your financial data is being exported as PDF")
    });
  };

  const handleAddBudget = () => {
    toast({
      title: t("common.budgetAdded", "Budget Added"),
      description: t("common.budgetAddedDescription", "Your new budget has been created")
    });
    setIsAddBudgetOpen(false);
  };

  const categoryColors: Record<string, string> = {
    "groceries": "bg-primary",
    "transport": "bg-blue-500",
    "entertainment": "bg-yellow-500",
    "other": "bg-gray-400"
  };

  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  // Custom stats card colors for income, expenses, and savings
  const statsCardColors = {
    income: {
      bgLight: "bg-gradient-to-br from-green-50 to-emerald-50",
      bgDark: "dark:bg-gradient-to-br dark:from-green-900/30 dark:to-emerald-900/20",
      iconBgLight: "bg-green-100",
      iconBgDark: "dark:bg-green-800/30",
      iconColor: "text-green-600 dark:text-green-400",
      textColor: "text-green-700 dark:text-green-300"
    },
    expenses: {
      bgLight: "bg-gradient-to-br from-red-50 to-rose-50",
      bgDark: "dark:bg-gradient-to-br dark:from-red-900/30 dark:to-rose-900/20",
      iconBgLight: "bg-red-100",
      iconBgDark: "dark:bg-red-800/30",
      iconColor: "text-red-600 dark:text-red-400",
      textColor: "text-red-700 dark:text-red-300"
    },
    savings: {
      bgLight: "bg-gradient-to-br from-blue-50 to-indigo-50",
      bgDark: "dark:bg-gradient-to-br dark:from-blue-900/30 dark:to-indigo-900/20",
      iconBgLight: "bg-blue-100",
      iconBgDark: "dark:bg-blue-800/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      textColor: "text-blue-700 dark:text-blue-300"
    }
  };

  // Period savings projection (for the Financial Health card)
  const [projectedSavings, setProjectedSavings] = useState(financialData.income - financialData.expenses);
  
  // Currency formatter
  const formatCurrency = (amount: number) => {
    return `${t("transaction.currencySymbol")} ${new Intl.NumberFormat().format(amount)}`;
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Page header with background gradient */}
      <div className="bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pt-12 pb-6 px-6 mb-4">
        <Button 
          variant="ghost" 
          className="mb-6 flex items-center text-muted-foreground p-0"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("nav.back")}
        </Button>
        
        <h1 className="font-bold text-3xl mb-2">{t("finance.dashboard")}</h1>
        <p className="text-muted-foreground mb-4">{t("finance.trackSpending")}</p>
        
        {/* Period selector */}
        <div className="flex justify-between items-center mb-2">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-[180px] bg-white/80 dark:bg-black/20 backdrop-blur-sm">
              <CalendarDays className="mr-2 h-4 w-4 text-primary" />
              <SelectValue placeholder={t("finance.thisMonth")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">{t("finance.thisMonth")}</SelectItem>
              <SelectItem value="lastMonth">{t("finance.lastMonth")}</SelectItem>
              <SelectItem value="quarter">{t("finance.lastQuarter")}</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            className="flex items-center justify-center bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/50 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
            onClick={() => setLocation("/financial-health")}
          >
            <Heart className="mr-2 h-4 w-4" />
            {t("financialHealth.title")}
          </Button>
        </div>
      </div>
      
      <motion.div 
        className="px-6 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Key financial stats cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
          {/* Income Card */}
          <Card className={`border-0 shadow-sm overflow-hidden ${statsCardColors.income.bgLight} ${statsCardColors.income.bgDark}`}>
            <CardContent className="p-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${statsCardColors.income.iconBgLight} ${statsCardColors.income.iconBgDark}`}>
                <ArrowDownRight className={`h-4 w-4 ${statsCardColors.income.iconColor}`} />
              </div>
              <p className="text-xs text-muted-foreground mb-1">{t("finance.income")}</p>
              <p className={`font-semibold ${statsCardColors.income.textColor}`}>
                {formatCurrency(financialData.income)}
              </p>
            </CardContent>
          </Card>
          
          {/* Expenses Card */}
          <Card className={`border-0 shadow-sm overflow-hidden ${statsCardColors.expenses.bgLight} ${statsCardColors.expenses.bgDark}`}>
            <CardContent className="p-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${statsCardColors.expenses.iconBgLight} ${statsCardColors.expenses.iconBgDark}`}>
                <ArrowUpRight className={`h-4 w-4 ${statsCardColors.expenses.iconColor}`} />
              </div>
              <p className="text-xs text-muted-foreground mb-1">{t("finance.expenses")}</p>
              <p className={`font-semibold ${statsCardColors.expenses.textColor}`}>
                {formatCurrency(financialData.expenses)}
              </p>
            </CardContent>
          </Card>
          
          {/* Savings Card */}
          <Card className={`border-0 shadow-sm overflow-hidden ${statsCardColors.savings.bgLight} ${statsCardColors.savings.bgDark}`}>
            <CardContent className="p-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${statsCardColors.savings.iconBgLight} ${statsCardColors.savings.iconBgDark}`}>
                <Wallet className={`h-4 w-4 ${statsCardColors.savings.iconColor}`} />
              </div>
              <p className="text-xs text-muted-foreground mb-1">{t("finance.savings")}</p>
              <p className={`font-semibold ${statsCardColors.savings.textColor}`}>
                {formatCurrency(financialData.savings)}
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Charts and Analysis Section */}
        <motion.div variants={itemVariants}>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full mb-4 bg-muted/30 p-1">
              <TabsTrigger value="overview" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
                <BarChart3 className="h-4 w-4 mr-2" />
                {t("finance.overview")}
              </TabsTrigger>
              <TabsTrigger value="spending" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
                <PieChart className="h-4 w-4 mr-2" />
                {t("finance.spending")}
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
                <TrendingUp className="h-4 w-4 mr-2" />
                {t("finance.trends")}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="border-none p-0 mt-0">
              {/* Money Movement Chart - Enhanced to match the screenshot */}
              <Card className="border bg-card dark:bg-gray-900/70 mb-5 overflow-hidden">
                <CardHeader className="py-3 px-4 border-b dark:border-gray-800">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mr-3">
                      <ArrowRightLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-medium flex items-center">
                        {t("finance.moneyMovement")}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {t("finance.lastTwelveMonths")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex flex-wrap justify-between mb-4">
                    <div className="mb-4 md:mb-0">
                      <div className="text-xs text-muted-foreground mb-1">{t("finance.totalIncome")}</div>
                      <div className="text-xl font-bold">{t("transaction.currencySymbol")} 65,450</div>
                    </div>
                    <div className="mb-4 md:mb-0">
                      <div className="text-xs text-muted-foreground mb-1">{t("finance.totalExpenses")}</div>
                      <div className="text-xl font-bold">{t("transaction.currencySymbol")} 43,280</div>
                    </div>
                    <div className="mb-4 md:mb-0">
                      <div className="text-xs text-muted-foreground mb-1">{t("finance.avgMonthly")}</div>
                      <div className="text-xl font-bold">{t("transaction.currencySymbol")} 5,454</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">{t("finance.savings")}</div>
                      <div className="text-xl font-bold text-green-600 dark:text-green-400">+33.9%</div>
                    </div>
                  </div>
                  
                  {/* Income vs. Expenses with Savings Rate */}
                  <div className="flex items-center justify-between mb-4 mt-6">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-xs">{t("finance.income")}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-xs">{t("finance.expenses")}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <span className="text-xs">{t("finance.savingsRateLabel")}</span>
                      </div>
                    </div>
                    
                    <select 
                      className="text-xs bg-transparent border rounded-md px-2 py-1"
                      onChange={(e) => setTimeRange(e.target.value as '3m' | '6m' | '12m')}
                      value={timeRange}
                    >
                      <option value="3m">{t("finance.threeMonthsPeriod")}</option>
                      <option value="6m">{t("finance.sixMonthsPeriod")}</option>
                      <option value="12m">{t("finance.twelveMonthsPeriod")}</option>
                    </select>
                  </div>
                  
                  <div className="h-[300px]">
                    <SavingsComparisonChart 
                      height={300} 
                      timeRange={timeRange}
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Daily Spending Chart */}
              <Card className="border bg-card">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-base font-medium flex items-center">
                    <Banknote className="h-4 w-4 mr-2 text-primary" />
                    {t("finance.dailySpending")}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {t("finance.avgDaily")}: {formatCurrency(financialData.expenses / 30)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 pt-2">
                  <DailySpendingChart height={180} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="spending" className="border-none p-0 mt-0">
              <Card className="border mb-5">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-base font-medium flex items-center">
                    <PieChart className="h-4 w-4 mr-2 text-primary" />
                    {t("finance.spendingByCategory")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex mb-4">
                    <div className="w-32 h-32 relative">
                      {/* Enhanced pie chart with glass effect */}
                      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                        <defs>
                          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                          </filter>
                        </defs>
                        
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                        
                        {/* Groceries segment with animation */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="20"
                          strokeDasharray={`${45 * 2.51} ${100 * 2.51 - 45 * 2.51}`}
                          strokeDashoffset="0"
                          className="origin-center -rotate-90"
                          filter="url(#glow)"
                        >
                          <animate attributeName="stroke-dashoffset" from={`${100 * 2.51}`} to="0" dur="1s" />
                        </circle>
                        
                        {/* Transport segment with animation */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="20"
                          strokeDasharray={`${25 * 2.51} ${100 * 2.51 - 25 * 2.51}`}
                          strokeDashoffset={`${-(45) * 2.51}`}
                          className="origin-center -rotate-90"
                          filter="url(#glow)"
                        >
                          <animate attributeName="stroke-dashoffset" from={`${100 * 2.51}`} to={`${-(45) * 2.51}`} dur="1s" />
                        </circle>
                        
                        {/* Entertainment segment with animation */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#eab308"
                          strokeWidth="20"
                          strokeDasharray={`${15 * 2.51} ${100 * 2.51 - 15 * 2.51}`}
                          strokeDashoffset={`${-(45 + 25) * 2.51}`}
                          className="origin-center -rotate-90"
                          filter="url(#glow)"
                        >
                          <animate attributeName="stroke-dashoffset" from={`${100 * 2.51}`} to={`${-(45 + 25) * 2.51}`} dur="1s" />
                        </circle>
                        
                        {/* Others segment with animation */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#9ca3af"
                          strokeWidth="20"
                          strokeDasharray={`${15 * 2.51} ${100 * 2.51 - 15 * 2.51}`}
                          strokeDashoffset={`${-(45 + 25 + 15) * 2.51}`}
                          className="origin-center -rotate-90"
                          filter="url(#glow)"
                        >
                          <animate attributeName="stroke-dashoffset" from={`${100 * 2.51}`} to={`${-(45 + 25 + 15) * 2.51}`} dur="1s" />
                        </circle>
                        
                        {/* Central content with improved styling */}
                        <g className="drop-shadow-sm">
                          <circle cx="50" cy="50" r="25" fill="white" className="dark:fill-gray-800" />
                          <text x="50" y="45" textAnchor="middle" dominantBaseline="middle" className="text-[4px] font-medium fill-muted-foreground">
                            {t("finance.expenses")}
                          </text>
                          <text x="50" y="55" textAnchor="middle" dominantBaseline="middle" className="text-[5px] font-bold fill-foreground">
                            {formatCurrency(financialData.expenses)}
                          </text>
                        </g>
                      </svg>
                    </div>
                    
                    <div className="flex-1 ml-4 flex flex-col justify-center">
                      {Object.entries({
                        groceries: 45,
                        transport: 25,
                        entertainment: 15,
                        other: 15
                      }).map(([category, percentage]) => (
                        <div key={category} className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 ${categoryColors[category]} rounded-full mr-2`}></div>
                            <span className="text-sm">
                              {t(`budget.category.${category}`)}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium">
                              {percentage}%
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {formatCurrency((financialData.expenses * percentage) / 100)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Budget Status Card */}
              <Card className="border">
                <CardHeader className="py-3 px-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base font-medium flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-primary" />
                      {t("finance.budgetStatus")}
                    </CardTitle>
                    <Dialog open={isAddBudgetOpen} onOpenChange={setIsAddBudgetOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                          <Plus className="h-4 w-4 mr-1" />
                          {t("common.add")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t("finance.addNewBudget")}</DialogTitle>
                          <DialogDescription>
                            {t("common.createBudgetDescription", "Create a new budget to track your spending in a specific category.")}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="category">{t("budget.category", "Category")}</Label>
                            <Select defaultValue="groceries">
                              <SelectTrigger id="category">
                                <SelectValue placeholder={t("common.selectCategory", "Select category")} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="groceries">{t("budget.category.groceries")}</SelectItem>
                                <SelectItem value="transport">{t("budget.category.transport")}</SelectItem>
                                <SelectItem value="entertainment">{t("budget.category.entertainment")}</SelectItem>
                                <SelectItem value="utilities">{t("budget.category.utilities")}</SelectItem>
                                <SelectItem value="rent">{t("budget.category.rent")}</SelectItem>
                                <SelectItem value="health">{t("budget.category.health")}</SelectItem>
                                <SelectItem value="education">{t("budget.category.education")}</SelectItem>
                                <SelectItem value="other">{t("budget.category.other")}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="limit">{t("budget.monthlyLimit", "Monthly Limit")} ({t("common.currency")})</Label>
                            <Input id="limit" type="number" placeholder={t("common.amountPlaceholder", "e.g. 1000")} />
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button onClick={handleAddBudget}>
                            {t("common.save")}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-4">
                    {budgets.map((budget) => (
                      <motion.div 
                        key={budget.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <BudgetItem budget={budget} />
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="trends" className="border-none p-0 mt-0">
              <Card className="border bg-card">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-base font-medium flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                    {t("finance.twelveMonths")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-2">
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground text-center p-6">
                      {t("finance.viewAnalyticsDescription")}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="px-4 py-3 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => toast({
                      title: t("common.feature.premium"),
                      description: t("common.feature.premiumDescription")
                    })}
                  >
                    {t("finance.viewDetailedAnalytics")}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
        
        {/* Export options */}
        <motion.div variants={itemVariants} className="flex">
          <Button 
            variant="outline" 
            className="flex-1 mr-2 flex items-center justify-center bg-card"
            onClick={handleExportCSV}
          >
            <FileDown className="mr-2 h-4 w-4" />
            {t("finance.export.csv")}
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 ml-2 flex items-center justify-center bg-card"
            onClick={handleExportPDF}
          >
            <File className="mr-2 h-4 w-4" />
            {t("finance.export.pdf")}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

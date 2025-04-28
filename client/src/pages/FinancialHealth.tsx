import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, Smile, Meh, Frown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import BalanceGraph from "@/components/BalanceGraph";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Color themes based on financial mood
const colorThemes = {
  great: {
    primary: "#10b981", // Emerald green
    secondary: "#d1fae5", // Light green
    accent: "#059669", // Dark green
    text: "#064e3b" // Darker green
  },
  good: {
    primary: "#3b82f6", // Blue
    secondary: "#dbeafe", // Light blue
    accent: "#2563eb", // Dark blue
    text: "#1e40af" // Darker blue
  },
  neutral: {
    primary: "#8b5cf6", // Purple
    secondary: "#ede9fe", // Light purple
    accent: "#7c3aed", // Dark purple
    text: "#5b21b6" // Darker purple
  },
  concerning: {
    primary: "#f59e0b", // Amber
    secondary: "#fef3c7", // Light amber
    accent: "#d97706", // Dark amber
    text: "#92400e" // Darker amber
  },
  critical: {
    primary: "#ef4444", // Red
    secondary: "#fee2e2", // Light red
    accent: "#dc2626", // Dark red
    text: "#b91c1c" // Darker red
  }
};

type MoodType = "great" | "good" | "neutral" | "concerning" | "critical";

// Sample financial health metrics
interface FinancialHealthMetrics {
  savingsRate: number;
  debtToIncome: number;
  emergencyFundMonths: number;
  budgetAdherence: number;
  investmentGrowth: number;
  overallScore: number;
  mood: MoodType;
}

export default function FinancialHealth() {
  const [_, setLocation] = useLocation();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<FinancialHealthMetrics | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Calculate financial mood based on overall score
  const calculateMood = (score: number): MoodType => {
    if (score >= 90) return "great";
    if (score >= 75) return "good";
    if (score >= 60) return "neutral";
    if (score >= 40) return "concerning";
    return "critical";
  };

  // Get mock financial health data
  useEffect(() => {
    // This would typically come from an API
    const fetchData = () => {
      // Mock data
      const mockMetrics: FinancialHealthMetrics = {
        savingsRate: 23, // Percentage of income saved
        debtToIncome: 28, // Percentage of income going to debt
        emergencyFundMonths: 4.5, // Months of expenses covered by emergency fund
        budgetAdherence: 85, // Percentage adherence to budget
        investmentGrowth: 7.2, // Percentage growth of investments
        overallScore: 76, // Overall financial health score
        mood: "good" // Will be calculated
      };
      
      // Calculate mood based on overall score
      mockMetrics.mood = calculateMood(mockMetrics.overallScore);
      
      setMetrics(mockMetrics);
    };
    
    fetchData();
  }, []);

  // Get mood icon based on mood
  const getMoodIcon = (mood: MoodType) => {
    switch (mood) {
      case "great":
      case "good":
        return <Smile className="h-8 w-8" style={{ color: colorThemes[mood].primary }} />;
      case "neutral":
        return <Meh className="h-8 w-8" style={{ color: colorThemes[mood].primary }} />;
      case "concerning":
      case "critical":
        return <Frown className="h-8 w-8" style={{ color: colorThemes[mood].primary }} />;
    }
  };

  // Function to get health text based on mood
  const getHealthText = (mood: MoodType) => {
    switch (mood) {
      case "great": return t("financialHealth.status.great");
      case "good": return t("financialHealth.status.good");
      case "neutral": return t("financialHealth.status.neutral");
      case "concerning": return t("financialHealth.status.concerning");
      case "critical": return t("financialHealth.status.critical");
    }
  };

  // Handle recommendation button click
  const handleRecommendationClick = () => {
    toast({
      title: t("financialHealth.recommendations"),
      description: t("financialHealth.recommendationsDescription")
    });
  };

  if (!metrics) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="p-6 pt-12 pb-20">
      <Button 
        variant="ghost" 
        className="mb-8 flex items-center text-muted-foreground p-0"
        onClick={() => setLocation("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("nav.back")}
      </Button>
      
      <h1 className="font-poppins font-bold text-3xl mb-6">{t("financialHealth.title")}</h1>
      
      {/* Score overview */}
      <Card className="mb-6" style={{ 
        borderColor: colorThemes[metrics.mood].primary,
        boxShadow: `0 4px 6px -1px ${colorThemes[metrics.mood].secondary}`
      }}>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-semibold">{t("financialHealth.overallScore")}</h2>
              <p className="text-muted-foreground">{t("financialHealth.scoreDescription")}</p>
            </div>
            {getMoodIcon(metrics.mood)}
          </div>
          
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex justify-between">
              <span>{t("financialHealth.poor")}</span>
              <span>{t("financialHealth.excellent")}</span>
            </div>
            <Progress 
              value={metrics.overallScore} 
              className="h-3"
              style={{ 
                backgroundColor: colorThemes[metrics.mood].secondary,
                "--progress-background": colorThemes[metrics.mood].primary
              } as React.CSSProperties}
            />
          </div>
          
          <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: colorThemes[metrics.mood].secondary }}>
            <p style={{ color: colorThemes[metrics.mood].text }}>
              <span className="font-semibold">{t("financialHealth.status.label")}: </span>
              {getHealthText(metrics.mood)}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="mb-6" onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="overview">{t("financialHealth.tabs.overview")}</TabsTrigger>
          <TabsTrigger value="metrics">{t("financialHealth.tabs.metrics")}</TabsTrigger>
          <TabsTrigger value="trends">{t("financialHealth.tabs.trends")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{t("financialHealth.savingsRate")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
                  <span className="text-2xl font-bold">{metrics.savingsRate}%</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("financialHealth.savingsRateDescription")}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{t("financialHealth.debtToIncome")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <TrendingDown className="mr-2 h-5 w-5 text-amber-500" />
                  <span className="text-2xl font-bold">{metrics.debtToIncome}%</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("financialHealth.debtToIncomeDescription")}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>{t("financialHealth.emergencyFund")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-2">
                <span className="text-2xl font-bold mr-2">{metrics.emergencyFundMonths}</span>
                <span>{t("financialHealth.months")}</span>
              </div>
              <Progress 
                value={(metrics.emergencyFundMonths / 6) * 100} 
                className="h-2 mb-2"
                style={{ 
                  backgroundColor: colorThemes[metrics.mood].secondary,
                  "--progress-background": colorThemes[metrics.mood].primary
                } as React.CSSProperties}
              />
              <p className="text-sm text-muted-foreground">
                {t("financialHealth.emergencyFundDescription")}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="metrics" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{t("financialHealth.budgetAdherence")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-2">
                  <span className="text-2xl font-bold">{metrics.budgetAdherence}%</span>
                </div>
                <Progress 
                  value={metrics.budgetAdherence} 
                  className="h-2 mb-2"
                  style={{ 
                    backgroundColor: colorThemes[metrics.mood].secondary,
                    "--progress-background": colorThemes[metrics.mood].primary
                  } as React.CSSProperties}
                />
                <p className="text-sm text-muted-foreground">
                  {t("financialHealth.budgetAdherenceDescription")}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{t("financialHealth.investmentGrowth")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
                  <span className="text-2xl font-bold">{metrics.investmentGrowth}%</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("financialHealth.investmentGrowthDescription")}
                </p>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{t("financialHealth.recommendations")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("financialHealth.recommendationsDescription")}
                </p>
                <Button 
                  style={{ 
                    backgroundColor: colorThemes[metrics.mood].primary,
                    color: 'white'
                  }}
                  onClick={handleRecommendationClick}
                >
                  {t("financialHealth.getPersonalizedAdvice")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="trends" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("financialHealth.balanceTrend")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <BalanceGraph height={300} color={colorThemes[metrics.mood].primary} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Financial tips based on mood */}
      <Card className="mb-6" style={{ 
        borderColor: colorThemes[metrics.mood].primary,
        backgroundColor: colorThemes[metrics.mood].secondary
      }}>
        <CardHeader>
          <CardTitle style={{ color: colorThemes[metrics.mood].text }}>
            {t("financialHealth.personalizedTips")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2" style={{ color: colorThemes[metrics.mood].text }}>
            <li className="flex items-start">
              <DollarSign className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{t(`financialHealth.tips.${metrics.mood}.1`)}</span>
            </li>
            <li className="flex items-start">
              <DollarSign className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{t(`financialHealth.tips.${metrics.mood}.2`)}</span>
            </li>
            <li className="flex items-start">
              <DollarSign className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{t(`financialHealth.tips.${metrics.mood}.3`)}</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
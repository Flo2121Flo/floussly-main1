import { Card, CardContent } from "@/components/ui/card";
import { 
  AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid, Legend, ReferenceDot 
} from "recharts";
import { useTranslation } from "../lib/i18n";
import { 
  ChevronDown, TrendingUp, CalendarDays, 
  ArrowUpFromLine, ArrowDownToLine, LineChart as LineChartIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useBalanceTrends } from "@/hooks/use-balance-trends";

interface MonthlyTransactionChartProps {
  className?: string;
  height?: number;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showTooltip?: boolean;
  showCartesianGrid?: boolean;
  mainColor?: string;
  secondaryColor?: string;
  showProjection?: boolean;
  simpleMode?: boolean;
  chartType?: 'area' | 'line';
}

export default function MonthlyTransactionChart({
  className = '',
  height = 250,
  showXAxis = true,
  showYAxis = true,
  showTooltip = true,
  showCartesianGrid = true,
  mainColor = "hsl(var(--primary))",
  secondaryColor = "hsl(52, 98%, 50%)",
  showProjection = false,
  simpleMode = false,
  chartType = 'line'
}: MonthlyTransactionChartProps) {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState("12m");
  const [chartView, setChartView] = useState("amount");
  const [_, setLocation] = useLocation();
  
  // Use the hooks with the selected range and type
  const { monthlyTrend, isLoading, error } = useBalanceTrends();
  
  // Calculate domain for Y axis
  const yDomain = useMemo(() => {
    if (!monthlyTrend || monthlyTrend.length === 0) return [0, 10000];
    
    let maxValue = 0;
    monthlyTrend.forEach(item => {
      const amount = item.amount || 0;
      if (amount > maxValue) maxValue = amount;
      
      const projected = item.projected || 0;
      if (projected > maxValue) maxValue = projected;
    });
    
    // Add 10% padding to the top
    const topPadding = maxValue * 0.1;
    return [0, maxValue + topPadding];
  }, [monthlyTrend]);
  
  // Custom tooltip formatter
  const formatTooltip = (value: number, name: string) => {
    // Translate the name if needed
    const translatedName = name === t("finance.actual") || name === t("finance.projected") 
      ? name 
      : t(`finance.${name.toLowerCase()}`);
      
    return [`${t("common.currency")} ${value.toLocaleString()}`, translatedName];
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <Card className={`${className} bg-card/50 backdrop-blur-sm border border-border/40 shadow-sm overflow-hidden`}>
        <CardContent className="p-6 flex flex-col items-center justify-center" style={{ height }}>
          <div className="animate-spin h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full"></div>
          <p className="text-sm text-muted-foreground mt-4 font-medium">{t("common.loading")}</p>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error || !monthlyTrend || monthlyTrend.length === 0) {
    return (
      <Card className={`${className} bg-card/50 backdrop-blur-sm border border-border/40 shadow-sm overflow-hidden`}>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-base font-medium">{t("finance.moneyMovement")}</h3>
                <p className="text-xs text-muted-foreground">{t("common.dataUnavailable")}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>
              <CalendarDays className="h-4 w-4 mr-1" />
              {t("finance.twelveMonths")}
            </Button>
          </div>
          <div className="bg-muted/20 rounded-lg flex items-center justify-center h-[160px]">
            <div className="text-center p-6">
              <div className="bg-muted/30 h-10 w-10 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-5 w-5 text-muted-foreground/70" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{t("common.dataUnavailable")}</p>
              <p className="text-xs text-muted-foreground/70">{t("finance.noTransactionData")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // If in simple mode (for Home page), show a more compact view
  if (simpleMode) {
    return (
      <Card className={`${className} border border-border/40 shadow-sm overflow-hidden`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-medium">{t("finance.moneyMovement")}</h3>
              <p className="text-xs text-muted-foreground">{t("finance.twelveMonths")}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 text-xs"
              onClick={() => setLocation("/finance-overview")}
            >
              {t("common.viewMore")}
            </Button>
          </div>
          
          <div style={{ width: '100%', height: height - 80 }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart
                  data={monthlyTrend}
                  margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
                >
                  {showCartesianGrid && (
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  )}
                  
                  {showXAxis && (
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 11 }} 
                      tickLine={false}
                      axisLine={false}
                    />
                  )}
                  
                  {showYAxis && (
                    <YAxis 
                      tick={{ fontSize: 11 }} 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                      domain={yDomain}
                    />
                  )}
                  
                  {showTooltip && (
                    <Tooltip 
                      formatter={formatTooltip}
                      contentStyle={{ 
                        borderRadius: '8px', 
                        border: '1px solid hsl(var(--border))',
                        backgroundColor: 'hsl(var(--card))',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  )}
                  
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke={mainColor} 
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0, fill: mainColor }}
                    name={t("finance.actual")}
                  />
                  
                  {showProjection && (
                    <Line 
                      type="monotone" 
                      dataKey="projected" 
                      stroke={secondaryColor} 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 0, fill: secondaryColor }}
                      name={t("finance.projected")}
                    />
                  )}
                </LineChart>
              ) : (
                <AreaChart
                  data={monthlyTrend}
                  margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
                >
                  {showCartesianGrid && (
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  )}
                  
                  {showXAxis && (
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 11 }} 
                      tickLine={false}
                      axisLine={false}
                    />
                  )}
                  
                  {showYAxis && (
                    <YAxis 
                      tick={{ fontSize: 11 }} 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                      domain={yDomain}
                    />
                  )}
                  
                  {showTooltip && (
                    <Tooltip 
                      formatter={formatTooltip}
                      contentStyle={{ 
                        borderRadius: '8px', 
                        border: '1px solid hsl(var(--border))',
                        backgroundColor: 'hsl(var(--card))',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  )}
                  
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={mainColor} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={mainColor} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={secondaryColor} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke={mainColor} 
                    fill="url(#colorAmount)"
                    fillOpacity={1}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0, fill: mainColor }}
                    name={t("finance.actual")}
                  />
                  
                  {showProjection && (
                    <Area 
                      type="monotone" 
                      dataKey="projected" 
                      stroke={secondaryColor} 
                      fill="url(#colorProjected)"
                      fillOpacity={1}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 0, fill: secondaryColor }}
                      name={t("finance.projected")}
                    />
                  )}
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
          
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-border/30">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: mainColor }}></div>
                <span className="text-xs">{t("finance.actual")}</span>
              </div>
              {showProjection && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: secondaryColor }}></div>
                  <span className="text-xs">{t("finance.projected")}</span>
                </div>
              )}
            </div>
            <div className="text-sm font-medium">
              +33.9% <span className="text-xs text-muted-foreground">{t("finance.savings")}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="bg-card/50 backdrop-blur-sm border border-border/40 shadow-sm overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          {/* Header with money movement title */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium">{t("finance.moneyMovement")}</h3>
                <p className="text-sm text-muted-foreground">{t("finance.lastSixMonths")}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[130px] h-9 text-sm bg-muted/50">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3m">{t("finance.lastQuarter")}</SelectItem>
                  <SelectItem value="6m">{t("finance.lastSixMonths")}</SelectItem>
                  <SelectItem value="12m">{t("finance.twelveMonths")}</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center bg-muted/50 rounded-md p-0.5">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={cn(
                    "h-9 text-sm px-3",
                    chartType === 'line' && "bg-background shadow-sm font-medium"
                  )}
                  onClick={() => setChartView(chartView)}
                >
                  <LineChartIcon className="h-4 w-4 mr-1.5" />
                  {t("common.lineChart")}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Financial statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-7">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("finance.totalIncome")}</p>
              <p className="text-2xl font-bold">
                {t("common.currency")} {(65450).toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("finance.totalExpenses")}</p>
              <p className="text-2xl font-bold">
                {t("common.currency")} {(43280).toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("finance.avgMonthlyIncome")}</p>
              <p className="text-2xl font-bold">
                {t("common.currency")} {(5454).toLocaleString()}
              </p>
            </div>
          </div>
          
          {/* Savings rate */}
          <div className="mb-5">
            <p className="text-sm text-muted-foreground mb-1">{t("finance.savingsRate")}</p>
            <p className="text-xl font-bold text-emerald-500">
              +33.9%
            </p>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-4 mb-5">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: mainColor }}></div>
              <span className="text-sm">{t("finance.actual")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: secondaryColor }}></div>
              <span className="text-sm">{t("finance.projected")}</span>
            </div>
          </div>
          
          {/* Chart */}
          <div className="bg-muted/5 border border-border/30 rounded-lg p-4 mb-5">
            <div style={{ width: '100%', height: height - 120 }}>
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart
                    data={monthlyTrend}
                    margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                  >
                    {showCartesianGrid && (
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    )}
                    
                    {showXAxis && (
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }} 
                        tickLine={false}
                        axisLine={false}
                      />
                    )}
                    
                    {showYAxis && (
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                        domain={yDomain}
                      />
                    )}
                    
                    {showTooltip && (
                      <Tooltip 
                        formatter={formatTooltip}
                        contentStyle={{ 
                          borderRadius: '8px', 
                          border: '1px solid hsl(var(--border))',
                          backgroundColor: 'hsl(var(--card))',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }}
                        labelStyle={{
                          fontWeight: 'bold',
                          marginBottom: '4px',
                          borderBottom: '1px solid hsl(var(--border))',
                          paddingBottom: '4px'
                        }}
                      />
                    )}
                    
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke={mainColor} 
                      strokeWidth={3}
                      dot={(props) => {
                        const { cx, cy, index } = props;
                        // Only show dots for the first and last points
                        if (index === 0 || index === monthlyTrend.length - 1) {
                          return <circle cx={cx} cy={cy} r={4} fill={mainColor} />;
                        }
                        return null;
                      }}
                      activeDot={{ r: 6, strokeWidth: 0, fill: mainColor }}
                      name={t("finance.actual")}
                    />
                    
                    {showProjection && (
                      <Line 
                        type="monotone" 
                        dataKey="projected" 
                        stroke={secondaryColor} 
                        strokeWidth={2.5}
                        strokeDasharray="5 5"
                        dot={(props) => {
                          const { cx, cy, index } = props;
                          // Only show dots for the first and last points
                          if (index === 0 || index === monthlyTrend.length - 1) {
                            return <circle cx={cx} cy={cy} r={4} fill={secondaryColor} stroke="none" />;
                          }
                          return null;
                        }}
                        activeDot={{ r: 5, strokeWidth: 0, fill: secondaryColor }}
                        name={t("finance.projected")}
                      />
                    )}
                  </LineChart>
                ) : (
                  <AreaChart
                    data={monthlyTrend}
                    margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                  >
                    {showCartesianGrid && (
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    )}
                    
                    {showXAxis && (
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }} 
                        tickLine={false}
                        axisLine={false}
                      />
                    )}
                    
                    {showYAxis && (
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                        domain={yDomain}
                      />
                    )}
                    
                    {showTooltip && (
                      <Tooltip 
                        formatter={formatTooltip}
                        contentStyle={{ 
                          borderRadius: '8px', 
                          border: '1px solid hsl(var(--border))',
                          backgroundColor: 'hsl(var(--card))',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }}
                        labelStyle={{
                          fontWeight: 'bold',
                          marginBottom: '4px',
                          borderBottom: '1px solid hsl(var(--border))',
                          paddingBottom: '4px'
                        }}
                      />
                    )}
                    
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={mainColor} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={mainColor} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.2}/>
                        <stop offset="95%" stopColor={secondaryColor} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke={mainColor} 
                      fill="url(#colorAmount)"
                      fillOpacity={1}
                      strokeWidth={2}
                      dot={(props) => {
                        const { cx, cy, index } = props;
                        // Only show dots for the first and last points
                        if (index === 0 || index === monthlyTrend.length - 1) {
                          return <circle cx={cx} cy={cy} r={4} fill={mainColor} />;
                        }
                        return null;
                      }}
                      activeDot={{ r: 6, strokeWidth: 0, fill: mainColor }}
                      name={t("finance.actual")}
                    />
                    
                    {showProjection && (
                      <Area 
                        type="monotone" 
                        dataKey="projected" 
                        stroke={secondaryColor} 
                        fill="url(#colorProjected)"
                        fillOpacity={1}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={(props) => {
                          const { cx, cy, index } = props;
                          // Only show dots for the first and last points
                          if (index === 0 || index === monthlyTrend.length - 1) {
                            return <circle cx={cx} cy={cy} r={4} fill={secondaryColor} stroke="none" />;
                          }
                          return null;
                        }}
                        activeDot={{ r: 5, strokeWidth: 0, fill: secondaryColor }}
                        name={t("finance.projected")}
                      />
                    )}
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="text-center">
            <Button 
              variant="link" 
              size="sm"
              className="text-sm text-muted-foreground hover:text-primary"
              onClick={() => setLocation("/finance-overview")}
            >
              {t("finance.viewDetailedAnalytics")}
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
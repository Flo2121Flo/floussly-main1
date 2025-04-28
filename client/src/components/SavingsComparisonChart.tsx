import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, 
  CartesianGrid, Tooltip, ReferenceLine, Legend
} from "recharts";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";
import { formatCurrency } from "../lib/formatters";
import { useSavingsComparison, SavingsDataPoint } from "../hooks/use-savings-comparison";

interface SavingsComparisonChartProps {
  className?: string;
  height?: number;
  width?: number;
  mainColor?: string;
  secondaryColor?: string;
  timeRange?: '3m' | '6m' | '12m';
}

export default function SavingsComparisonChart({
  className,
  height = 300,
  width,
  mainColor = "hsl(var(--primary))",
  secondaryColor = "#ef4444",
  timeRange = '6m'
}: SavingsComparisonChartProps) {
  const { t } = useTranslation();
  const { savingsData, isLoading, error } = useSavingsComparison({ timeRange });

  // Custom tooltip formatter
  const formatTooltip = (value: number, name: string) => {
    if (name === "savingsRate") {
      return [`${value.toFixed(1)}%`, t("finance.savingsRateLabel")];
    }
    return [formatCurrency(value), t(`finance.${name}`)];
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className={cn("w-full flex items-center justify-center", className)} style={{ height }}>
        <div className="flex flex-col items-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full mb-3"></div>
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !savingsData || savingsData.length === 0) {
    return (
      <div className={cn("w-full flex items-center justify-center", className)} style={{ height }}>
        <div className="text-center p-6 max-w-md">
          <div className="bg-muted/30 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-base font-medium text-foreground mb-1">{t("common.dataUnavailable")}</p>
          <p className="text-sm text-muted-foreground">{t("finance.noFinancialData")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={savingsData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            yAxisId="money"
            orientation="left"
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${value / 1000}k`}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            yAxisId="percentage"
            orientation="right"
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 50]}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={formatTooltip}
            contentStyle={{ 
              borderRadius: '8px', 
              border: '1px solid hsl(var(--border))',
              backgroundColor: 'hsl(var(--card))',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend 
            formatter={(value) => t(`finance.${value}`)} 
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingTop: 10, fontSize: 12 }}
          />
          
          {/* Income bars */}
          <Bar 
            yAxisId="money"
            dataKey="income" 
            fill="rgba(16, 185, 129, 0.7)" // Green
            radius={[4, 4, 0, 0]}
            barSize={20}
            name="income"
          />
          
          {/* Expense bars */}
          <Bar 
            yAxisId="money"
            dataKey="expenses" 
            fill="rgba(239, 68, 68, 0.7)" // Red
            radius={[4, 4, 0, 0]}
            barSize={20}
            name="expenses"
          />
          
          {/* Savings rate line */}
          <Bar
            yAxisId="percentage"
            dataKey="savingsRate"
            fill="rgba(234, 179, 8, 0.8)" // Yellow
            radius={[4, 4, 0, 0]}
            barSize={6}
            name="savingsRate"
          />
          
          {/* Target savings rate line (20%) */}
          <ReferenceLine 
            yAxisId="percentage" 
            y={20} 
            stroke="#66B2FF" 
            strokeDasharray="3 3"
            strokeWidth={2}
            label={{ 
              value: t("finance.targetSavings"), 
              position: 'insideTopRight', 
              fontSize: 12,
              fill: "#66B2FF" 
            }} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslation } from "@/lib/i18n";

export interface BalanceGraphProps {
  className?: string;
  height?: number;
  width?: number;
  color?: string;
}

export default function BalanceGraph({
  className,
  height = 300,
  width,
  color = "#3b82f6",
}: BalanceGraphProps) {
  const { t } = useTranslation();
  
  // Sample data for the graph with translated months
  const data = [
    { month: t("common.months.jan"), balance: 3800 },
    { month: t("common.months.feb"), balance: 4200 },
    { month: t("common.months.mar"), balance: 3900 },
    { month: t("common.months.apr"), balance: 4000 },
    { month: t("common.months.may"), balance: 4500 },
    { month: t("common.months.jun"), balance: 4300 },
    { month: t("common.months.jul"), balance: 4800 },
    { month: t("common.months.aug"), balance: 5000 },
    { month: t("common.months.sep"), balance: 5200 },
    { month: t("common.months.oct"), balance: 5500 },
    { month: t("common.months.nov"), balance: 5300 },
    { month: t("common.months.dec"), balance: 5800 },
  ];

  return (
    <div className={className} style={{ width: width || "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={(value) => `${value} ${t("common.currency")}`}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value) => [`${value} ${t("common.currency")}`, t("wallet.availableBalance")]}
            contentStyle={{ 
              background: 'rgba(17, 24, 39, 0.8)', 
              borderRadius: '8px',
              color: 'white',
              border: 'none'
            }}
          />
          <Line
            type="monotone"
            dataKey="balance"
            stroke={color}
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: "white", stroke: color }}
            activeDot={{ r: 6, strokeWidth: 0, fill: color }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
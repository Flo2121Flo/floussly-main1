import { useState, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "../lib/i18n";

interface DailySpendingProps {
  className?: string;
  height?: number;
}

export default function DailySpendingChart({ className, height }: DailySpendingProps) {
  const { t } = useTranslation();
  const [selectedMonth, setSelectedMonth] = useState<string>("current");
  const [viewMode, setViewMode] = useState<string>("daily");

  // Generate data for each day of the month
  const generateDailyData = (month: string) => {
    const daysInMonth = month === "current" ? 30 : 31;
    const isCurrent = month === "current";
    
    const result = [];
    let runningTotal = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      // Generate different patterns based on the selected month
      let spending;
      if (isCurrent) {
        // Current month - spending increases on weekends
        spending = day % 7 === 0 || day % 7 === 6 
          ? Math.floor(Math.random() * 300) + 300  // Higher on weekends (300-600)
          : Math.floor(Math.random() * 200) + 100;  // Lower on weekdays (100-300)
      } else if (month === "previous") {
        // Previous month - more sporadic spending pattern
        spending = day % 10 === 0
          ? Math.floor(Math.random() * 500) + 400  // Spikes on every 10th day (400-900)
          : Math.floor(Math.random() * 150) + 50;  // Lower normally (50-200)
      } else {
        // Two months ago - more consistent spending
        spending = Math.floor(Math.random() * 120) + 180; // Relatively consistent (180-300)
      }
      
      // Add some randomness to make the chart look more natural
      spending += Math.floor(Math.random() * 50) - 25;
      
      // Ensure spending is always positive
      spending = Math.max(1, spending);
      
      // Calculate running total for cumulative view
      runningTotal += spending;
      
      result.push({
        day: `${day}`,
        spending,
        cumulativeSpending: runningTotal,
      });
    }
    
    return result;
  };

  // Memoize the data generation to avoid recalculating on every render
  const currentMonthData = useMemo(() => generateDailyData("current"), []);
  const previousMonthData = useMemo(() => generateDailyData("previous"), []);
  const twoMonthsAgoData = useMemo(() => generateDailyData("twoMonthsAgo"), []);
  
  // Get data based on selected month
  const selectedData = useMemo(() => {
    switch (selectedMonth) {
      case "current":
        return currentMonthData;
      case "previous":
        return previousMonthData;
      case "twoMonthsAgo":
        return twoMonthsAgoData;
      default:
        return currentMonthData;
    }
  }, [selectedMonth, currentMonthData, previousMonthData, twoMonthsAgoData]);
  
  // Calculate average spending
  const averageSpending = useMemo(() => {
    const totalSpending = selectedData.reduce((total, day) => total + day.spending, 0);
    return totalSpending / selectedData.length;
  }, [selectedData]);

  // Get month name for display, using i18n locale
  const getMonthName = (month: string) => {
    const { i18n } = useTranslation();
    const currentDate = new Date();
    let date = new Date();
    
    if (month === "previous") {
      date.setMonth(currentDate.getMonth() - 1);
    } else if (month === "twoMonthsAgo") {
      date.setMonth(currentDate.getMonth() - 2);
    }
    
    // Use the current language code for proper month localization
    return date.toLocaleString(i18n.language, { month: 'long' });
  };
  
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">
          {t("finance.dailySpending")}
        </CardTitle>
        <div className="flex space-x-2">
          <Select
            value={selectedMonth}
            onValueChange={setSelectedMonth}
          >
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue placeholder={t("finance.thisMonth")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">{getMonthName("current")}</SelectItem>
              <SelectItem value="previous">{getMonthName("previous")}</SelectItem>
              <SelectItem value="twoMonthsAgo">{getMonthName("twoMonthsAgo")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="pt-3">
        <Tabs 
          defaultValue="daily" 
          className="mb-4"
          value={viewMode}
          onValueChange={setViewMode}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="daily">{t("finance.dailyView")}</TabsTrigger>
            <TabsTrigger value="cumulative">{t("finance.cumulativeView")}</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <ResponsiveContainer width="100%" height={height || 250}>
          <LineChart
            data={selectedData}
            margin={{
              top: 10,
              right: 0,
              left: 0,
              bottom: 30,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
            <XAxis 
              dataKey="day"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ strokeOpacity: 0.2 }}
              interval="preserveStartEnd"
              padding={{ left: 10, right: 10 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value} ${t("common.currency")}`}
              domain={viewMode === 'daily' ? ['auto', 'auto'] : [0, 'auto']}
            />
            <Tooltip 
              formatter={(value) => [`${value} ${t("common.currency")}`, viewMode === 'daily' ? t('finance.spending') : t('finance.totalSpending')]}
              labelFormatter={(label) => `${t('finance.day')} ${label}`}
            />
            <Legend />
            
            {viewMode === 'daily' && (
              <>
                <Line 
                  type="monotone" 
                  dataKey="spending" 
                  name={t("finance.dailySpending")}
                  stroke="#FF5722" 
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                <ReferenceLine 
                  y={averageSpending} 
                  stroke="#10B981" 
                  strokeDasharray="3 3"
                  label={{ 
                    value: `${t("finance.average")}: ${Math.round(averageSpending)} ${t("common.currency")}`, 
                    position: 'insideBottomRight',
                    fill: '#10B981',
                    fontSize: 11
                  }}
                />
              </>
            )}
            
            {viewMode === 'cumulative' && (
              <Line 
                type="monotone" 
                dataKey="cumulativeSpending" 
                name={t("finance.totalSpending")}
                stroke="#3B82F6" 
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
        
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <div>
            {viewMode === 'daily' ? (
              <span>{t("finance.avgDaily")}: <span className="font-medium text-green-600">{Math.round(averageSpending)} {t("common.currency")}</span></span>
            ) : (
              <span>{t("finance.totalMonth")}: <span className="font-medium text-blue-600">{Math.round(selectedData[selectedData.length - 1].cumulativeSpending)} {t("common.currency")}</span></span>
            )}
          </div>
          <div className="text-right">
            {selectedData.length} {t("finance.days")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
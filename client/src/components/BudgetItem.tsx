import { useTranslation } from "../lib/i18n";
import { Progress } from "@/components/ui/progress";

export interface Budget {
  id: string;
  category: string;
  spent: number;
  limit: number;
  currency: string;
  percentage: number;
}

interface BudgetItemProps {
  budget: Budget;
}

export default function BudgetItem({ budget }: BudgetItemProps) {
  const { t } = useTranslation();
  const { category, spent, limit, currency, percentage } = budget;
  
  const isOverBudget = spent > limit;
  
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span>{t(`budget.category.${category}`)}</span>
        <span>
          <span className={`font-medium ${isOverBudget ? 'text-red-500' : ''}`}>
            {currency} {new Intl.NumberFormat().format(spent)}
          </span> / 
          <span className="text-muted-foreground">
            {currency} {new Intl.NumberFormat().format(limit)}
          </span>
        </span>
      </div>
      <Progress 
        value={percentage > 100 ? 100 : percentage} 
        className={`h-2 ${isOverBudget ? 'text-red-500' : ''}`}
      />
    </div>
  );
}

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@/components/TransactionItem";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

export function useTransactions() {
  // Use Auth context
  const auth = useAuth();
  const isAuthenticated = !!auth.user;
  const { t } = useTranslation();
  
  // Create transaction data with proper date objects
  const createMockTransactions = (): Transaction[] => {
    // Calculate dates
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastMonth = new Date(today);
    lastMonth.setDate(lastMonth.getDate() - 20);
    
    return [
      {
        id: "tx-1",
        type: "send",
        title: "Sent to Laila",
        amount: 250,
        currency: "MAD",
        date: "tx_today_1430", // Special format for translation
        rawDate: today,
        status: "completed",
        category: "transfer"
      },
      {
        id: "tx-2",
        type: "receive",
        title: "Received from Hassan",
        amount: 1000,
        currency: "MAD",
        date: "tx_yesterday_0915", // Special format for translation
        rawDate: yesterday,
        status: "completed",
        category: "transfer"
      },
      {
        id: "tx-3",
        type: "topup",
        title: "Top Up",
        amount: 2000,
        currency: "MAD",
        date: "tx_date_1645", // Special format for translation
        rawDate: lastMonth,
        status: "completed",
        category: "wallet"
      }
    ];
  };
  
  // Mock transactions for demo
  const [localTransactions, setLocalTransactions] = useState<Transaction[]>(createMockTransactions());
  
  // Disable the API query for now and just use mock data
  // const { data: transactions, isLoading, error } = useQuery<Transaction[]>({
  //   queryKey: ["/api/transactions"],
  //   enabled: isAuthenticated,
  //   // If API fails, use local state
  //   onError: () => {
  //     return localTransactions;
  //   }
  // });
  
  // Use mock data always for testing
  const transactions = localTransactions;
  const isLoading = false;
  const error = null;
  
  // Update local transactions when query data changes
  useEffect(() => {
    if (transactions) {
      setLocalTransactions(transactions);
    }
  }, [transactions]);
  
  // Calculate total amount - sum of all transactions for this month
  const calculateTotalAmount = (): number => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return (transactions || localTransactions).reduce((sum, tx) => {
      // Only include transactions from the current month
      const txDate = tx.rawDate || new Date();
      if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
        // For received amounts, add; for sent or withdrawn, subtract
        if (tx.type === 'receive' || tx.type === 'topup') {
          return sum + tx.amount;
        } else {
          return sum - tx.amount;
        }
      }
      return sum;
    }, 0);
  };
  
  // Cache the calculated total
  const totalAmount = calculateTotalAmount();

  return {
    transactions: transactions || localTransactions,
    recentTransactions: (transactions || localTransactions).slice(0, 3),
    totalAmount,
    isLoading,
    error
  };
}

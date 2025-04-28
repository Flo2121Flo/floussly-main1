import React from 'react';
import { AIAdvisor } from '../../server/services/aiAdvisor';
import { Transaction } from '../../server/types/transaction';
import { User } from '../../server/types/user';

interface AIAdviceProps {
  user: User;
  transactions: Transaction[];
}

export const AIAdvice: React.FC<AIAdviceProps> = ({ user, transactions }) => {
  const advice = AIAdvisor.analyzeTransactions(user, transactions);

  if (advice.length === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 p-4 rounded-lg mt-4">
      <h3 className="text-blue-800 font-medium mb-2">Financial Tips</h3>
      <ul className="space-y-2">
        {advice.map((tip, index) => (
          <li key={index} className="text-blue-700 text-sm flex items-start">
            <span className="mr-2">💡</span>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}; 
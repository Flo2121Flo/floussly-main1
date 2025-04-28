import React from 'react';
import { FeeCalculator } from '../../server/services/feeCalculator';
import { TransactionType } from '../../server/types/transaction';

interface FeePreviewProps {
  type: TransactionType;
  amount: number;
}

export const FeePreview: React.FC<FeePreviewProps> = ({ type, amount }) => {
  const fee = FeeCalculator.calculateFee(type, amount);
  const total = FeeCalculator.calculateTotal(amount, fee);

  if (fee === 0) {
    return (
      <div className="text-sm text-gray-600 mt-2">
        No fees apply to this transaction
      </div>
    );
  }

  return (
    <div className="text-sm text-gray-600 mt-2">
      <div className="flex justify-between">
        <span>Transaction Fee:</span>
        <span>{FeeCalculator.formatFee(fee)} MAD</span>
      </div>
      <div className="flex justify-between font-medium mt-1">
        <span>Total Amount:</span>
        <span>{FeeCalculator.formatFee(total)} MAD</span>
      </div>
    </div>
  );
}; 
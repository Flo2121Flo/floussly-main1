import { TransactionType } from '../types/transaction';

export function validateTransaction(data: any): string | null {
  // Validate required fields
  if (!data.type || !data.amount) {
    return 'Type and amount are required';
  }

  // Validate amount
  if (typeof data.amount !== 'number' || data.amount <= 0) {
    return 'Amount must be a positive number';
  }

  // Validate type
  if (!Object.values(TransactionType).includes(data.type)) {
    return 'Invalid transaction type';
  }

  // Validate recipient for wallet transfers
  if (data.type === TransactionType.WALLET_TO_WALLET && !data.recipientId) {
    return 'Recipient is required for wallet transfers';
  }

  // Validate bank details for withdrawals
  if (data.type === TransactionType.BANK_WITHDRAWAL) {
    if (!data.metadata?.bankAccount || !data.metadata?.bankName) {
      return 'Bank account details are required for withdrawals';
    }
  }

  // Validate agent details for agent transactions
  if (data.type === TransactionType.AGENT_CASHOUT || data.type === TransactionType.AGENT_TOPUP) {
    if (!data.metadata?.agentId) {
      return 'Agent ID is required for agent transactions';
    }
  }

  // Validate card details for card topup
  if (data.type === TransactionType.CARD_TOPUP) {
    if (!data.metadata?.cardNumber || !data.metadata?.cardExpiry || !data.metadata?.cardCvv) {
      return 'Card details are required for card topup';
    }
  }

  return null;
} 
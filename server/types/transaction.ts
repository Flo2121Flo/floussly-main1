export enum TransactionType {
  WALLET_TO_WALLET = 'WALLET_TO_WALLET',
  BANK_WITHDRAWAL = 'BANK_WITHDRAWAL',
  AGENT_CASHOUT = 'AGENT_CASHOUT',
  AGENT_TOPUP = 'AGENT_TOPUP',
  CARD_TOPUP = 'CARD_TOPUP',
  MERCHANT_PAYMENT = 'MERCHANT_PAYMENT'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  BLOCKED = 'blocked'
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  fee: number;
  totalAmount: number;
  recipientId?: string;
  status: TransactionStatus;
  date: string;
  metadata?: {
    bankAccount?: string;
    bankName?: string;
    agentId?: string;
    cardNumber?: string;
    cardExpiry?: string;
    cardCvv?: string;
    reference?: string;
    description?: string;
  };
} 
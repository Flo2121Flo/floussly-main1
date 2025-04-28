/**
 * Utility functions for financial calculations (Server-side version)
 */

/**
 * Floussly fee structure constants
 */
export const FLOUSSLY_FEE_STRUCTURE = {
  WALLET_TO_WALLET: {
    FEE: 0, // Free
  },
  WALLET_TO_MERCHANT: {
    FEE: 0, // Free
  },
  BANK_TRANSFER: {
    THRESHOLD: 1000, // MAD
    LOW_AMOUNT_FEE: 2.75, // Flat fee for transfers up to 1000 MAD
    HIGH_AMOUNT_FEE: 13, // Max fee for transfers above 1000 MAD
  },
  CASH_OUT: {
    PERCENTAGE: 0.01, // 1%
    MIN_FEE: 4, // Minimum 4 MAD
  },
  MERCHANT_FEE: {
    PERCENTAGE: 0.007, // 0.7%
    MIN_FEE: 0.4, // Minimum 0.4 MAD
  },
  TONTINE: {
    PERCENTAGE: 0.015, // 1.5%
    MIN_FEE: 20, // Minimum 20 MAD for small tontines (≤2,000 MAD)
    MAX_FEE: 750, // Maximum 750 MAD for large tontines (>50,000 MAD)
    SMALL_THRESHOLD: 2000, // Threshold for small tontines
    LARGE_THRESHOLD: 50000, // Threshold for large tontines
  }
};

/**
 * Floussly transaction types
 */
export enum FlousslyTransactionType {
  WALLET_TO_WALLET = 'wallet_to_wallet',
  WALLET_TO_MERCHANT = 'wallet_to_merchant',
  BANK_TRANSFER = 'bank_transfer',
  CASH_OUT = 'cash_out',
  MERCHANT_FEE = 'merchant_fee',
  TONTINE_FEE = 'tontine_fee'
}

/**
 * Calculate transaction fees for Floussly platform based on the updated fee structure
 * 
 * @param {FlousslyTransactionType | string} transactionType - Type of transaction
 * @param {number} amountInMAD - Transaction amount in Moroccan Dirhams (MAD)
 * @returns {number} - Calculated fee rounded to 2 decimal places
 */
export function calculateFlousslyFee(transactionType: FlousslyTransactionType | string, amountInMAD: number): number {
  // Validate inputs
  if (typeof amountInMAD !== 'number' || amountInMAD <= 0) {
    return 0; // Return 0 instead of throwing error for better UX
  }
  
  let fee = 0;
  
  switch (transactionType) {
    // Wallet to Wallet transfers are free
    case FlousslyTransactionType.WALLET_TO_WALLET:
      // No fee for wallet to wallet transfers
      fee = FLOUSSLY_FEE_STRUCTURE.WALLET_TO_WALLET.FEE;
      break;
      
    // Wallet to Merchant payments are free
    case FlousslyTransactionType.WALLET_TO_MERCHANT:
      // No fee for payments to Floussly-registered merchants
      fee = FLOUSSLY_FEE_STRUCTURE.WALLET_TO_MERCHANT.FEE;
      break;
      
    // Bank transfers have tiered flat fees
    case FlousslyTransactionType.BANK_TRANSFER:
      if (amountInMAD <= FLOUSSLY_FEE_STRUCTURE.BANK_TRANSFER.THRESHOLD) {
        // Flat fee for transfers up to 1000 MAD
        fee = FLOUSSLY_FEE_STRUCTURE.BANK_TRANSFER.LOW_AMOUNT_FEE;
      } else {
        // Maximum fee for transfers above 1000 MAD
        fee = FLOUSSLY_FEE_STRUCTURE.BANK_TRANSFER.HIGH_AMOUNT_FEE;
      }
      break;
      
    // Cash-out withdrawals have percentage fee with minimum
    case FlousslyTransactionType.CASH_OUT:
      // 1% of withdrawal amount
      fee = amountInMAD * FLOUSSLY_FEE_STRUCTURE.CASH_OUT.PERCENTAGE;
      
      // Enforce minimum fee of 4 MAD
      if (fee < FLOUSSLY_FEE_STRUCTURE.CASH_OUT.MIN_FEE) {
        fee = FLOUSSLY_FEE_STRUCTURE.CASH_OUT.MIN_FEE;
      }
      break;
      
    // Merchant receiving payments have percentage fee with minimum
    case FlousslyTransactionType.MERCHANT_FEE:
      // 0.7% of received amount
      fee = amountInMAD * FLOUSSLY_FEE_STRUCTURE.MERCHANT_FEE.PERCENTAGE;
      
      // Enforce minimum fee of 0.4 MAD
      if (fee < FLOUSSLY_FEE_STRUCTURE.MERCHANT_FEE.MIN_FEE) {
        fee = FLOUSSLY_FEE_STRUCTURE.MERCHANT_FEE.MIN_FEE;
      }
      break;

    // Tontine (Daret) creation fee
    case FlousslyTransactionType.TONTINE_FEE:
      // Calculate 1.5% fee for tontine
      fee = amountInMAD * FLOUSSLY_FEE_STRUCTURE.TONTINE.PERCENTAGE;
      
      // Apply minimum fee for small tontines (≤2,000 MAD)
      if (amountInMAD <= FLOUSSLY_FEE_STRUCTURE.TONTINE.SMALL_THRESHOLD) {
        fee = FLOUSSLY_FEE_STRUCTURE.TONTINE.MIN_FEE;
      }
      
      // Apply maximum fee cap for large tontines (>50,000 MAD)
      if (amountInMAD > FLOUSSLY_FEE_STRUCTURE.TONTINE.LARGE_THRESHOLD && fee > FLOUSSLY_FEE_STRUCTURE.TONTINE.MAX_FEE) {
        fee = FLOUSSLY_FEE_STRUCTURE.TONTINE.MAX_FEE;
      }
      break;
      
    default:
      throw new Error(`Unknown transaction type: ${transactionType}`);
  }
  
  // Round to 2 decimal places for monetary precision
  return Number(fee.toFixed(2));
}

/**
 * Gets the fee description based on transaction type and amount
 * @param {FlousslyTransactionType} transactionType - The transaction type 
 * @param {number} amountInMAD - The amount in Moroccan Dirhams
 * @returns {string} - Human-readable fee description
 */
/**
 * Calculate the service fee for creating a new Tontine (Daret)
 * 
 * @param {number} totalAmount - Total amount of the Tontine in MAD
 * @returns {number} - Calculated service fee
 */
export function calculateTontineFee(totalAmount: number): number {
  return calculateFlousslyFee(FlousslyTransactionType.TONTINE_FEE, totalAmount);
}

export function getFlousslyFeeDescription(transactionType: FlousslyTransactionType, amountInMAD: number): string {
  switch (transactionType) {
    case FlousslyTransactionType.WALLET_TO_WALLET:
      return 'Free';
      
    case FlousslyTransactionType.WALLET_TO_MERCHANT:
      return 'Free';
      
    case FlousslyTransactionType.BANK_TRANSFER:
      return amountInMAD <= FLOUSSLY_FEE_STRUCTURE.BANK_TRANSFER.THRESHOLD
        ? `Flat fee: ${FLOUSSLY_FEE_STRUCTURE.BANK_TRANSFER.LOW_AMOUNT_FEE} MAD`
        : `Maximum fee: ${FLOUSSLY_FEE_STRUCTURE.BANK_TRANSFER.HIGH_AMOUNT_FEE} MAD`;
        
    case FlousslyTransactionType.CASH_OUT:
      return `${FLOUSSLY_FEE_STRUCTURE.CASH_OUT.PERCENTAGE * 100}% (Minimum: ${FLOUSSLY_FEE_STRUCTURE.CASH_OUT.MIN_FEE} MAD)`;
      
    case FlousslyTransactionType.MERCHANT_FEE:
      return `${FLOUSSLY_FEE_STRUCTURE.MERCHANT_FEE.PERCENTAGE * 100}% (Minimum: ${FLOUSSLY_FEE_STRUCTURE.MERCHANT_FEE.MIN_FEE} MAD)`;
      
    case FlousslyTransactionType.TONTINE_FEE:
      if (amountInMAD <= FLOUSSLY_FEE_STRUCTURE.TONTINE.SMALL_THRESHOLD) {
        return `Minimum fee: ${FLOUSSLY_FEE_STRUCTURE.TONTINE.MIN_FEE} MAD`;
      } else if (amountInMAD > FLOUSSLY_FEE_STRUCTURE.TONTINE.LARGE_THRESHOLD) {
        return `Maximum fee: ${FLOUSSLY_FEE_STRUCTURE.TONTINE.MAX_FEE} MAD`;
      } else {
        return `${FLOUSSLY_FEE_STRUCTURE.TONTINE.PERCENTAGE * 100}% fee`;
      }
      
    default:
      return '';
  }
}
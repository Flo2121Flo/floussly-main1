import { 
  FlousslyTransactionType, 
  calculateFlousslyFee,
  FLOUSSLY_FEE_STRUCTURE
} from "@/lib/financial-utils";
import { useTranslation } from "@/lib/i18n";

interface FlousslyFeeDisplayProps {
  amount: number;
  currency: string;
  transactionType: FlousslyTransactionType;
  className?: string;
}

/**
 * Displays the fee breakdown for Floussly transactions using the new fee structure
 */
export const FlousslyFeeDisplay = ({
  amount,
  currency,
  transactionType,
  className = "",
}: FlousslyFeeDisplayProps) => {
  const { t } = useTranslation();
  
  // Ensure we have a valid positive amount to prevent calculation errors
  const isValidAmount = amount > 0;
  const fee = isValidAmount ? calculateFlousslyFee(transactionType, amount) : 0;
  const total = amount + fee;
  
  // Get fee description based on transaction type
  const getFeeDescription = () => {
    switch (transactionType) {
      case FlousslyTransactionType.WALLET_TO_WALLET:
        return t("transaction.freeTransfer");
        
      case FlousslyTransactionType.WALLET_TO_MERCHANT:
        return t("transaction.freePayment");
        
      case FlousslyTransactionType.BANK_TRANSFER:
        return amount <= FLOUSSLY_FEE_STRUCTURE.BANK_TRANSFER.THRESHOLD
          ? t("transaction.fixedFee")
          : t("transaction.maxFee");
          
      case FlousslyTransactionType.CASH_OUT:
        return `${FLOUSSLY_FEE_STRUCTURE.CASH_OUT.PERCENTAGE * 100}% (${t("transaction.min")} ${currency} ${FLOUSSLY_FEE_STRUCTURE.CASH_OUT.MIN_FEE})`;
        
      case FlousslyTransactionType.MERCHANT_FEE:
        return `${FLOUSSLY_FEE_STRUCTURE.MERCHANT_FEE.PERCENTAGE * 100}% (${t("transaction.min")} ${currency} ${FLOUSSLY_FEE_STRUCTURE.MERCHANT_FEE.MIN_FEE})`;
        
      default:
        return "";
    }
  };

  // Get translated transaction type label
  const getTransactionTypeLabel = () => {
    switch(transactionType) {
      case FlousslyTransactionType.WALLET_TO_WALLET:
        return t("transaction.transferFee");
      case FlousslyTransactionType.WALLET_TO_MERCHANT:
        return t("transaction.merchantPaymentFee");
      case FlousslyTransactionType.BANK_TRANSFER:
        return t("transaction.bankTransferFee");
      case FlousslyTransactionType.CASH_OUT:
        return t("transaction.withdrawalFee");
      case FlousslyTransactionType.MERCHANT_FEE:
        return t("transaction.merchantFee");
      default:
        return t("transaction.fee");
    }
  };

  return (
    <div className={`text-sm ${className}`}>
      <div className="flex justify-between items-center mb-1">
        <span>{t("transaction.amount")}</span>
        <span className="font-medium">
          {currency} {amount.toFixed(2)}
        </span>
      </div>
      
      <div className="flex justify-between items-center mb-1">
        <span className="flex items-center">
          {getTransactionTypeLabel()}
          <span className="ml-1 text-xs text-muted-foreground">
            ({getFeeDescription()})
          </span>
        </span>
        <span className="font-medium">{currency} {fee.toFixed(2)}</span>
      </div>
      
      <div className="border-t border-border mt-2 pt-2 flex justify-between items-center">
        <span className="font-medium">{t("transaction.total")}</span>
        <span className="font-bold">{currency} {total.toFixed(2)}</span>
      </div>
    </div>
  );
};
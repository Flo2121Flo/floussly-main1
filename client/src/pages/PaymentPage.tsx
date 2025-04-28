import { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import PaymentMethodSelector from '@/components/PaymentMethodSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { FlousslyFeeDisplay } from '@/components/FlousslyFeeDisplay';
import { FlousslyTransactionType } from '@/lib/financial-utils';

enum PaymentStatus {
  AMOUNT_INPUT,
  SELECTING_METHOD,
  PROCESSING,
  SUCCESS,
  FAILURE
}

export default function PaymentPage() {
  const [_, navigate] = useLocation();
  const [status, setStatus] = useState<PaymentStatus>(PaymentStatus.AMOUNT_INPUT);
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [amount, setAmount] = useState<number | null>(null);
  const [amountError, setAmountError] = useState<string>('');
  // Set default description based on URL path
  const [location] = useLocation();
  const { t } = useTranslation();
  const isWithdrawal = location.includes('withdraw');
  const [description, setDescription] = useState<string>(
    isWithdrawal ? t("payment.defaultWithdrawalDescription") : t("payment.defaultTopUpDescription")
  );

  const handleAmountSubmit = () => {
    if (!amount || amount <= 0) {
      setAmountError(t("payment.amountError"));
      return;
    }

    if (amount > 10000) {
      setAmountError(t("payment.amountTooLarge"));
      return;
    }

    setAmountError('');
    setStatus(PaymentStatus.SELECTING_METHOD);
  };

  const handlePaymentComplete = (success: boolean, reference?: string) => {
    if (success && reference) {
      setPaymentReference(reference);
      setStatus(PaymentStatus.SUCCESS);
    } else {
      setStatus(PaymentStatus.FAILURE);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="container max-w-md mx-auto p-4">
      <Button
        variant="ghost"
        className="mb-4 flex items-center"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("common.back")}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{isWithdrawal ? t("payment.withdrawTitle") : t("payment.title")}</CardTitle>
          <CardDescription>
            {isWithdrawal 
              ? t("wallet.withdrawDescription") 
              : t("wallet.topUpDescription")}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {status === PaymentStatus.AMOUNT_INPUT && (
            <div className="p-6 bg-card rounded-lg border border-border">
              <h3 className="text-xl font-semibold mb-4">{t("payment.enterAmount")}</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount" className="block mb-2">{t("payment.amount")}</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-muted-foreground">{t("common.currency")}</span>
                    </div>
                    <Input
                      id="amount"
                      type="number"
                      value={amount === null ? '' : amount}
                      onChange={(e) => {
                        const value = e.target.value;
                        setAmount(value === '' ? null : parseFloat(value));
                      }}
                      className="pl-14 text-lg font-medium"
                      min={1}
                      step={10}
                      placeholder="0"
                    />
                  </div>
                  {amountError && (
                    <p className="text-destructive mt-1 text-sm">{amountError}</p>
                  )}
                </div>
                
                {/* Transaction Fee Display */}
                {amount && amount > 0 && (
                  <div className="space-y-4">
                    {/* Floussly Fee Calculation */}
                    <div className="p-3 bg-muted/30 rounded-lg border border-primary/20">
                      <h3 className="text-sm font-medium mb-2 text-primary">{t("payment.feeStructure")}</h3>
                      <FlousslyFeeDisplay 
                        amount={amount}
                        currency={t("common.currency")}
                        transactionType={isWithdrawal ? FlousslyTransactionType.CASH_OUT : FlousslyTransactionType.BANK_TRANSFER}
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="description" className="block mb-2">{t("payment.description")}</Label>
                  <div className="relative">
                    <Input
                      id="description"
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t("payment.descriptionPlaceholder")}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-6">
                <Button variant="outline" onClick={handleCancel}>
                  {t("common.cancel")}
                </Button>
                <Button onClick={handleAmountSubmit}>
                  {t("common.continue")}
                </Button>
              </div>
            </div>
          )}

          {status === PaymentStatus.SELECTING_METHOD && (
            <PaymentMethodSelector
              amount={amount}
              description={description}
              onComplete={handlePaymentComplete}
              onCancel={() => setStatus(PaymentStatus.AMOUNT_INPUT)}
            />
          )}

          {status === PaymentStatus.PROCESSING && (
            <div className="flex flex-col items-center justify-center p-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-center text-muted-foreground">
                {t("payment.processing")}
              </p>
            </div>
          )}

          {status === PaymentStatus.SUCCESS && (
            <div className="flex flex-col items-center justify-center p-8">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-xl font-medium mb-2">{t("payment.successTitle")}</h3>
              <p className="text-center text-muted-foreground mb-4">
                {t("payment.successDescription", { amount: `${amount || 0} ${t("common.currency")}` })}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("payment.reference")}: {paymentReference}
              </p>
            </div>
          )}

          {status === PaymentStatus.FAILURE && (
            <div className="flex flex-col items-center justify-center p-8">
              <XCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-xl font-medium mb-2">{t("payment.failureTitle")}</h3>
              <p className="text-center text-muted-foreground mb-4">
                {t("payment.failureDescription")}
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-end">
          {(status === PaymentStatus.SUCCESS || status === PaymentStatus.FAILURE) && (
            <Button onClick={() => navigate('/')}>
              {t("common.returnHome")}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
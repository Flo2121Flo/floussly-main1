import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, CreditCard, User, QrCode, Camera, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FlousslyFeeDisplay } from "@/components/FlousslyFeeDisplay";
import { FlousslyTransactionType } from "@/lib/financial-utils";

interface PaymentMethodSelectorProps {
  amount: number | null;
  description: string;
  onComplete: (success: boolean, reference?: string) => void;
  onCancel: () => void;
}

// Simplify to two main payment methods
const PAYMENT_METHODS = [
  { id: 'credit_card', icon: CreditCard, enabled: true },
  { id: 'agent', icon: User, enabled: true },
  { id: 'bank_transfer', icon: Building2, enabled: true, withdrawalOnly: true }
];

export default function PaymentMethodSelector({ 
  amount, 
  description, 
  onComplete, 
  onCancel 
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('credit_card');
  const [isLoading, setIsLoading] = useState(false);
  const [isWithdrawal, setIsWithdrawal] = useState(false);
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Detect if this is a withdrawal or top-up based on description
  useEffect(() => {
    if (description.toLowerCase().includes('withdraw') || description.toLowerCase().includes('withdrawal')) {
      setIsWithdrawal(true);
    }
  }, [description]);

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast({
        title: t("common.error"),
        description: t("payment.selectMethodError"),
        variant: 'destructive',
      });
      return;
    }

    // For agent payments, route to the appropriate screen based on top-up or withdrawal
    if (selectedMethod === 'agent') {
      if (isWithdrawal) {
        // For withdrawal, open camera to scan agent QR
        navigate('/camera-scan');
      } else {
        // For top-up, show QR code for agent to scan
        navigate('/qr-code');
      }
      return;
    }
    
    // For bank transfers, navigate to bank accounts selection page
    if (selectedMethod === 'bank_transfer') {
      if (isWithdrawal) {
        // For withdrawal to bank account
        navigate('/bank-accounts?action=withdraw&amount=' + (amount || 0));
      }
      return;
    }

    // For credit card, proceed with payment processing
    setIsLoading(true);
    
    try {
      // Map credit_card to the appropriate provider for the backend
      const backendProvider = 'cmi'; // Using CMI for credit card payments
      
      const response = await apiRequest('POST', '/api/payments/create', {
        provider: backendProvider,
        amount,
        currency: t("common.currency"),
        description,
        redirectUrl: window.location.href,
      });
      
      const data = await response.json();
      
      if (data.success && data.paymentUrl) {
        // Open payment URL in a new window
        window.open(data.paymentUrl, '_blank');
        
        // Store reference for later verification
        localStorage.setItem('floussly-payment-reference', data.reference);
        localStorage.setItem('floussly-payment-provider', backendProvider);
        
        // Poll for payment completion
        checkPaymentStatus(data.reference, backendProvider);
      } else {
        toast({
          title: t("payment.failedTitle"),
          description: data.message || t("payment.initializationFailed"),
          variant: 'destructive',
        });
        onComplete(false);
      }
    } catch (error) {
      console.error('Payment creation failed:', error);
      toast({
        title: t("payment.failedTitle"),
        description: t("payment.processingFailed"),
        variant: 'destructive',
      });
      onComplete(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkPaymentStatus = async (reference: string, provider: string) => {
    try {
      const response = await apiRequest('GET', `/api/payments/${reference}?provider=${provider}`);
      const data = await response.json();
      
      if (data.success && data.status === 'completed') {
        toast({
          title: t("payment.successTitle"),
          description: t("payment.paymentCompleted"),
        });
        onComplete(true, reference);
      } else if (data.status === 'pending') {
        // Payment still processing, check again later
        setTimeout(() => checkPaymentStatus(reference, provider), 5000);
      } else {
        toast({
          title: t("payment.failedTitle"),
          description: data.message || t("payment.verificationFailed"),
          variant: 'destructive',
        });
        onComplete(false);
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
    }
  };

  return (
    <div className="p-6 bg-card rounded-lg border border-border">
      <h3 className="text-xl font-semibold mb-4">{t("payment.selectMethod")}</h3>
      
      <div className="mb-6 bg-muted/30 p-4 rounded-lg border border-border">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">{t("payment.amount")}</span>
          <span className="text-xl font-semibold text-primary">{amount || 0} {t("common.currency")}</span>
        </div>
        
        {/* Fee Display using the new FlousslyFeeDisplay component */}
        <div className="border-t border-border my-2 pt-2">
          {amount && amount > 0 && (
            <FlousslyFeeDisplay 
              amount={amount}
              currency={t("common.currency")}
              transactionType={isWithdrawal ? FlousslyTransactionType.CASH_OUT : FlousslyTransactionType.BANK_TRANSFER}
            />
          )}
        </div>
        
        <div className="flex justify-between items-center pt-2">
          <span className="text-sm font-medium">{t("payment.description")}</span>
          <span className="text-sm text-muted-foreground">{description}</span>
        </div>
      </div>
      
      <RadioGroup
        value={selectedMethod}
        onValueChange={setSelectedMethod}
        className="mb-6 space-y-4"
      >
        {PAYMENT_METHODS
          .filter(method => !method.withdrawalOnly || (method.withdrawalOnly && isWithdrawal))
          .map((method) => {
            // Use const declaration to avoid rendering errors
            // Building2 for bank transfer, CreditCard for credit card, User for agent
            let IconComponent;
            if (method.id === 'bank_transfer') {
              IconComponent = Building2;
            } else if (method.id === 'credit_card') {
              IconComponent = CreditCard;
            } else {
              IconComponent = User;
            }
            
            return (
              <div 
                key={method.id} 
                className={`flex items-center p-4 rounded-lg border ${
                  selectedMethod === method.id ? 'border-primary bg-primary/5' : 'border-border'
                } transition-colors cursor-pointer hover:bg-muted/20`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <RadioGroupItem value={method.id} id={method.id} className="mr-3" />
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mr-4">
                  <IconComponent className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <Label htmlFor={method.id} className="cursor-pointer font-medium block">
                    {t(`payment.${method.id}`)}
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {method.id === 'credit_card' 
                      ? t("payment.useCardToProcess") 
                      : method.id === 'bank_transfer'
                        ? t("payment.transferToBankAccount")
                        : isWithdrawal 
                          ? t("payment.scanQRToWithdraw") 
                          : t("payment.showQRToDeposit")}
                  </span>
                </div>
                
                {/* For agent method, show appropriate icon based on transaction type */}
                {method.id === 'agent' && (
                  <div className="ml-auto">
                    {isWithdrawal ? (
                      <Camera className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <QrCode className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                )}
              </div>
            );
        })}
      </RadioGroup>
      
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          {t("common.cancel")}
        </Button>
        <Button 
          onClick={handlePayment} 
          disabled={!selectedMethod || isLoading}
          className="min-w-[100px]"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {selectedMethod === 'agent' 
            ? t("common.continue")
            : t("payment.payNow")}
        </Button>
      </div>
    </div>
  );
}
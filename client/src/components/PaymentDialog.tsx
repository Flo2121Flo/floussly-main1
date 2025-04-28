import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";

enum PaymentStatus {
  SELECTING_METHOD,
  PROCESSING,
  SUCCESS,
  FAILURE
}

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  description: string;
  onSuccess?: (reference: string) => void;
  onFailure?: () => void;
}

export default function PaymentDialog({
  open,
  onOpenChange,
  amount,
  description,
  onSuccess,
  onFailure
}: PaymentDialogProps) {
  const [status, setStatus] = useState<PaymentStatus>(PaymentStatus.SELECTING_METHOD);
  const [paymentReference, setPaymentReference] = useState<string>('');

  const handlePaymentComplete = (success: boolean, reference?: string) => {
    if (success && reference) {
      setPaymentReference(reference);
      setStatus(PaymentStatus.SUCCESS);
      onSuccess?.(reference);
    } else {
      setStatus(PaymentStatus.FAILURE);
      onFailure?.();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state when dialog closes
    setTimeout(() => {
      setStatus(PaymentStatus.SELECTING_METHOD);
      setPaymentReference('');
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {status === PaymentStatus.SELECTING_METHOD && "Select Payment Method"}
            {status === PaymentStatus.PROCESSING && "Processing Payment"}
            {status === PaymentStatus.SUCCESS && "Payment Successful"}
            {status === PaymentStatus.FAILURE && "Payment Failed"}
          </DialogTitle>
          <DialogDescription>
            {status === PaymentStatus.SELECTING_METHOD && 
              `Complete your payment of ${amount} MAD`}
            {status === PaymentStatus.PROCESSING && 
              "Please wait while we process your payment..."}
            {status === PaymentStatus.SUCCESS && 
              "Your payment has been processed successfully"}
            {status === PaymentStatus.FAILURE && 
              "We encountered an issue processing your payment"}
          </DialogDescription>
        </DialogHeader>

        {status === PaymentStatus.SELECTING_METHOD && (
          <PaymentMethodSelector
            amount={amount}
            description={description}
            onComplete={handlePaymentComplete}
            onCancel={handleClose}
          />
        )}

        {status === PaymentStatus.PROCESSING && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          </div>
        )}

        {status === PaymentStatus.SUCCESS && (
          <div className="flex flex-col items-center justify-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground mt-2">
                Reference: {paymentReference}
              </p>
            </div>
          </div>
        )}

        {status === PaymentStatus.FAILURE && (
          <div className="flex flex-col items-center justify-center py-6">
            <XCircle className="h-12 w-12 text-red-500 mb-4" />
          </div>
        )}

        <DialogFooter className="sm:justify-end">
          {(status === PaymentStatus.SUCCESS || status === PaymentStatus.FAILURE) && (
            <Button type="button" variant="secondary" onClick={handleClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
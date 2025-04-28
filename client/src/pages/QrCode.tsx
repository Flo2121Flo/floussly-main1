import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "../lib/i18n";
import { ArrowLeft, ArrowRight, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TransactionItem, { Transaction } from "@/components/TransactionItem";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import UserQRCode from "@/components/UserQRCode";

export default function QrCode() {
  const [_, setLocation] = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showScanner, setShowScanner] = useState(false);

  // Mock QR transactions
  const qrTransactions: Transaction[] = [
    {
      id: "qr-1",
      type: "send",
      title: "Café Maroc",
      amount: 85,
      currency: "MAD",
      date: "Yesterday, 11:35",
      status: "completed"
    },
    {
      id: "qr-2",
      type: "send",
      title: "Ahmed Grocery",
      amount: 132.5,
      currency: "MAD",
      date: "18 Oct, 19:20",
      status: "completed"
    },
    {
      id: "qr-3",
      type: "receive",
      title: "From Hassan",
      amount: 1000,
      currency: "MAD",
      date: "15 Oct, 09:45",
      status: "completed"
    }
  ];

  const handleScanCode = () => {
    // Option 1: Use internal scanner
    setShowScanner(true);
    
    // Mock scanning functionality
    setTimeout(() => {
      setShowScanner(false);
      toast({
        title: t("qrCode.scanned"),
        description: t("qrCode.paymentCompleted", { amount: 50, currency: t("common.currency"), merchant: "Coffee Shop" }),
      });
      // Navigate to payment confirmation page
      setLocation("/payment?success=true&amount=50&merchant=CoffeeShop");
    }, 2000);
    
    // Option 2: Navigate to dedicated camera scan page
    // setLocation("/camera-scan");
  };

  // This function is no longer needed as UserQRCode has sharing built-in

  // Generate a unique ID for the user
  const qrCodeId = `FL-${user?.id || "000"}-${new Date().getFullYear().toString().substring(2)}${(user?.phone || "").substring(-4)}`;

  return (
    <div className="p-6 pt-12">
      <Button 
        variant="ghost" 
        className="mb-8 flex items-center text-muted-foreground p-0"
        onClick={() => setLocation("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("nav.back")}
      </Button>
      
      <h1 className="font-poppins font-bold text-3xl mb-3">{t("qrCode.payment")}</h1>
      <p className="text-muted-foreground mb-8">{t("qrCode.scanToSend")}</p>
      
      {showScanner ? (
        <Card className="bg-muted rounded-lg p-6 flex flex-col items-center mb-8">
          <div className="relative w-56 h-56 bg-black/90 flex items-center justify-center rounded-lg mb-4">
            <div className="absolute inset-0 border-2 border-primary/50 rounded-lg"></div>
            <div className="w-48 h-1 bg-primary/50 absolute animate-pulse"></div>
            <p className="text-white text-sm absolute bottom-4">{t("qrCode.scanning")}</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowScanner(false)}
          >
            {t("qrCode.cancelScan")}
          </Button>
        </Card>
      ) : (
        <div className="mb-8">
          <UserQRCode size={240} />
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">{t("qrCode.yourCode")}</p>
            <p className="font-medium text-lg">{qrCodeId}</p>
            <p className="text-sm mt-2 bg-primary/10 p-2 rounded text-primary-foreground">
              {t("qrCode.codeDescription", { userName: user?.name || t("common.defaultUserName") })}
            </p>
          </div>
        </div>
      )}
      
      <div className="flex justify-between mb-8">
        <Button 
          className="flex-1 mr-2 flex items-center justify-center"
          onClick={handleScanCode}
        >
          <Camera className="mr-2 h-4 w-4" />
          {t("qrCode.scanCode")}
        </Button>
        
        <Button 
          variant="outline"
          className="flex-1 flex items-center justify-center"
          onClick={() => setLocation("/finance-overview")}
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          {t("common.viewAll")}
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-4">{t("qrCode.history")}</h3>
          
          {qrTransactions.map((transaction, index) => (
            <div key={transaction.id} className={index < qrTransactions.length - 1 ? "border-b border-border pb-3 mb-3" : ""}>
              <TransactionItem transaction={transaction} showStatus={false} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

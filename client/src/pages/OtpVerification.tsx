import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useTranslation } from "../lib/i18n";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";

export default function OtpVerification() {
  const [_, setLocation] = useLocation();
  const { t } = useTranslation();
  const { verifyOtp, isLoading } = useAuth();
  const { toast } = useToast();
  const [value, setValue] = useState("");

  const handleVerify = async () => {
    if (value.length < 4) {
      toast({
        title: "Invalid Code",
        description: "Please enter the complete 4-digit code",
        variant: "destructive",
      });
      return;
    }
    
    await verifyOtp(value);
  };

  const handleResend = () => {
    toast({
      title: "OTP Resent",
      description: "A new verification code has been sent to your phone",
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 pt-12"
    >
      <Button 
        variant="ghost" 
        className="mb-8 flex items-center text-muted-foreground p-0"
        onClick={() => setLocation("/login")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("nav.back")}
      </Button>
      
      <h1 className="font-poppins font-bold text-3xl mb-3">{t("auth.verification")}</h1>
      <p className="text-muted-foreground mb-8">
        {t("auth.verificationMessage")} <span className="font-medium">+212 6XX XXX XXX</span>
      </p>
      
      <div className="mb-8">
        <InputOTP
          value={value}
          onChange={setValue}
          maxLength={4}
          pattern={REGEXP_ONLY_DIGITS}
          render={({ slots }) => (
            <InputOTPGroup className="flex justify-between">
              {slots.map((slot, index) => (
                <InputOTPSlot
                  key={index}
                  {...slot}
                  className="w-14 h-16 text-center text-2xl font-medium"
                />
              ))}
            </InputOTPGroup>
          )}
        />
      </div>
      
      <Button 
        className="w-full mb-6"
        disabled={isLoading || value.length < 4}
        onClick={handleVerify}
      >
        {isLoading ? "Verifying..." : t("auth.verify")}
      </Button>
      
      <div className="flex justify-center">
        <p className="text-muted-foreground text-sm">
          {t("auth.didntReceiveCode")}{" "}
          <Button 
            variant="link" 
            className="p-0 h-auto font-medium text-primary"
            onClick={handleResend}
          >
            {t("auth.resend")}
          </Button>
        </p>
      </div>
    </motion.div>
  );
}

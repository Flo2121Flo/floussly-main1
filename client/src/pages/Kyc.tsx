import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useTranslation } from "../lib/i18n";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Kyc() {
  const [_, setLocation] = useLocation();
  const { t } = useTranslation();
  const { submitKyc, isLoading } = useAuth();
  const [idUploaded, setIdUploaded] = useState(false);
  const [selfieUploaded, setSelfieUploaded] = useState(false);

  const handleIdUpload = () => {
    // In a real app, this would open a file picker or camera
    setIdUploaded(true);
  };

  const handleSelfieCapture = () => {
    // In a real app, this would open the camera
    setSelfieUploaded(true);
  };

  const handleSubmit = async () => {
    if (!idUploaded || !selfieUploaded) {
      return;
    }
    
    // Mock data for the demo
    const kycData = {
      idCard: "id_card_file",
      selfie: "selfie_file"
    };
    
    await submitKyc(kycData);
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
        onClick={() => setLocation("/otp-verification")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("nav.back")}
      </Button>
      
      <h1 className="font-poppins font-bold text-3xl mb-3">{t("auth.identity")}</h1>
      <p className="text-muted-foreground mb-8">{t("auth.identityMessage")}</p>
      
      <div className="space-y-6 mb-8">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-4">{t("auth.uploadId")}</h3>
            <div 
              className={`border-2 border-dashed ${
                idUploaded ? "border-primary bg-primary/5" : "border-input"
              } rounded-lg p-6 text-center cursor-pointer hover:bg-muted transition duration-200`}
              onClick={handleIdUpload}
            >
              {idUploaded ? (
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mb-2">
                    <Upload className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm text-primary">ID Card Uploaded</p>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground mb-2 mx-auto" />
                  <p className="text-sm text-muted-foreground">{t("auth.uploadIdMessage")}</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-4">{t("auth.takeSelfie")}</h3>
            <div 
              className={`border-2 border-dashed ${
                selfieUploaded ? "border-primary bg-primary/5" : "border-input"
              } rounded-lg p-6 text-center cursor-pointer hover:bg-muted transition duration-200`}
              onClick={handleSelfieCapture}
            >
              {selfieUploaded ? (
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mb-2">
                    <Camera className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm text-primary">Selfie Captured</p>
                </div>
              ) : (
                <>
                  <Camera className="h-10 w-10 text-muted-foreground mb-2 mx-auto" />
                  <p className="text-sm text-muted-foreground">{t("auth.takeSelfieMessage")}</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Button 
        className="w-full"
        disabled={isLoading || !idUploaded || !selfieUploaded}
        onClick={handleSubmit}
      >
        {isLoading ? "Processing..." : t("auth.submit")}
      </Button>
    </motion.div>
  );
}

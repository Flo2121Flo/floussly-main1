import { useState, useEffect, useRef } from "react";
import { useTranslation } from "../lib/i18n";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ScanLine, Camera, X } from "lucide-react";
import { motion } from "framer-motion";

export default function CameraScan() {
  const { t } = useTranslation();
  const [_, setLocation] = useLocation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(true);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [camError, setCamError] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        setHasPermission(true);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setHasPermission(false);
        if (err instanceof Error) {
          if (err.name === "NotAllowedError") {
            setCamError("permissionDenied");
          } else if (err.name === "NotFoundError") {
            setCamError("notSupported");
          } else {
            setCamError("error");
          }
        }
      }
    };

    startCamera();

    // Cleanup function to stop camera stream
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  // Mock function for scanning QR code
  // In production, you would implement a real QR code scanner
  const mockScanQRCode = () => {
    // Simulate finding a code after 2 seconds
    setTimeout(() => {
      const mockFlousslyCode = "FLSY-" + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      setScannedCode(mockFlousslyCode);
      setScanning(false);
    }, 2000);
  };

  const handleRetry = () => {
    setScannedCode(null);
    setScanning(true);
  };

  const handleGoBack = () => {
    setLocation("/transactions");
  };

  const handleUseCode = () => {
    // In a real app, you would use this code to find the user
    // For now, we'll just go back to transactions
    setLocation("/transactions");
  };

  useEffect(() => {
    if (scanning && hasPermission) {
      // Start the mock scanning process when page loads
      mockScanQRCode();
    }
  }, [scanning, hasPermission]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="relative bg-black text-white pt-8 pb-4 px-6">
        <Button 
          variant="ghost" 
          size="icon"
          className="h-9 w-9 rounded-full bg-white/10 mr-3 hover:bg-white/20 text-white absolute left-4 top-8"
          onClick={handleGoBack}
        >
          <ArrowLeftIcon size={18} />
        </Button>
        <h1 className="text-xl font-bold text-center">
          {t("qrCode.scanCode")}
        </h1>
      </div>

      {/* Camera view */}
      <div className="flex-1 flex flex-col">
        {hasPermission === false ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <Camera size={48} className="text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">{t(`camera.${camError || 'error'}`)}</h2>
            <p className="text-muted-foreground mb-6">{t("camera.permissionRequired")}</p>
            <Button onClick={() => window.location.reload()}>
              {t("camera.requestAccess")}
            </Button>
          </div>
        ) : (
          <div className="relative flex-1 flex flex-col items-center">
            {/* Video element for camera */}
            <div className="relative w-full h-full bg-black">
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {scanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {/* Scan area */}
                  <div className="relative w-64 h-64 mb-8">
                    <div className="absolute w-full h-full border-2 border-primary/70 rounded-lg"></div>
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-lg"></div>
                    
                    {/* Animated scan line */}
                    <motion.div 
                      className="absolute left-0 right-0 h-0.5 bg-primary"
                      initial={{ top: 0 }}
                      animate={{ top: '100%' }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "linear"
                      }}
                    />
                  </div>
                  
                  <p className="text-white text-center px-8 mb-4">
                    {t("qrCode.scanInstructions")}
                  </p>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleGoBack}
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    <X size={16} className="mr-2" />
                    {t("qrCode.cancelScan")}
                  </Button>
                </div>
              )}
              
              {!scanning && scannedCode && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 p-6">
                  <div className="bg-card rounded-xl p-6 shadow-lg max-w-sm w-full">
                    <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4">
                      <ScanLine size={28} />
                    </div>
                    
                    <h2 className="text-xl font-bold text-center mb-1">
                      {t("qrCode.scanned")}
                    </h2>
                    <p className="text-center text-muted-foreground mb-4">
                      Floussly Code: {scannedCode}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="outline" 
                        onClick={handleRetry}
                        className="w-full"
                      >
                        {t("common.retry")}
                      </Button>
                      <Button 
                        onClick={handleUseCode}
                        className="w-full"
                      >
                        {t("common.use")}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Hidden canvas used for capturing video frames and processing them */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}
      </div>
    </div>
  );
}
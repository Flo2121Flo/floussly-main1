import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from '../lib/i18n';
import { Share2, RefreshCw, Download } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface UserQRCodeProps {
  className?: string;
  size?: number;
}

export default function UserQRCode({ className = '', size = 240 }: UserQRCodeProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Generate a QR code for the current user
  const generateQRCode = async () => {
    setIsLoading(true);
    try {
      // The QR code will contain a JSON object with the user ID and a timestamp for uniqueness
      // In a production app, you would want to encrypt this or generate a secure token
      const qrData = JSON.stringify({
        userId: user?.id || 'guest',
        phone: user?.phone,
        username: user?.name,
        timestamp: new Date().toISOString(),
      });
      
      const dataUrl = await QRCode.toDataURL(qrData, {
        margin: 1,
        width: size,
        color: {
          dark: '#2563eb', // Primary color
          light: '#ffffff' // Background color
        }
      });
      
      setQrDataUrl(dataUrl);
      setIsLoading(false);
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError('Failed to generate QR code');
      setIsLoading(false);
    }
  };
  
  // Generate QR code on component mount
  useEffect(() => {
    generateQRCode();
  }, [user]); // Regenerate when user changes
  
  // Handle share functionality
  const handleShare = async () => {
    try {
      if (navigator.share && qrDataUrl) {
        // Convert data URL to a Blob
        const blob = await (await fetch(qrDataUrl)).blob();
        const file = new File([blob], 'floussly-qr-code.png', { type: 'image/png' });
        
        await navigator.share({
          title: t('qrCode.shareTitle'),
          text: t('qrCode.codeDescription', { 
            userName: user?.name || t('common.defaultUserName')
          }),
          files: [file]
        });
      } else {
        // Fallback if Web Share API is not available
        alert(t('qrCode.shareNotSupported'));
      }
    } catch (err) {
      console.error('Error sharing QR code:', err);
    }
  };
  
  // Handle download functionality
  const handleDownload = () => {
    try {
      // First attempt the actual download
      const link = document.createElement('a');
      link.href = qrDataUrl;
      link.download = 'floussly-qr-code.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success notification - using translation even for console logs for consistency
      // Note: In a real app, you might want to track this event or notify the server
      console.log(t("qrCode.download") + " " + t("common.success"));
    } catch (err) {
      console.error('Error downloading QR code:', err);
      // Handle download error
    }
  };
  
  if (isLoading) {
    return (
      <Card className={`${className} flex items-center justify-center`} style={{ height: size, width: size }}>
        <CardContent className="flex flex-col items-center justify-center p-0">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="text-sm text-muted-foreground mt-4">{t("common.generating")}</p>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className={`${className} flex items-center justify-center`} style={{ height: size, width: size }}>
        <CardContent className="flex flex-col items-center justify-center p-4 text-center">
          <p className="text-sm text-red-500">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={generateQRCode}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("common.tryAgain")}
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className={`${className} flex flex-col items-center`}>
      <Card className="mb-4">
        <CardContent className="flex items-center justify-center p-4">
          {qrDataUrl && <img src={qrDataUrl} alt={t("qrCode.yourCode")} width={size} height={size} />}
        </CardContent>
      </Card>
      
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4 mr-2" />
          {t("qrCode.download")}
        </Button>
        
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4 mr-2" />
          {t("qrCode.share")}
        </Button>
      </div>
    </div>
  );
}
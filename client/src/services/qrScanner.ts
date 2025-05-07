import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface QRScannerState {
  scanning: boolean;
  error: string | null;
  lastScannedCode: string | null;
}

export const useQRScanner = () => {
  const [state, setState] = useState<QRScannerState>({
    scanning: false,
    error: null,
    lastScannedCode: null,
  });
  const { t } = useTranslation();

  const startScanning = useCallback(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setState((prev) => ({
        ...prev,
        error: t('qr_scanner.errors.not_supported'),
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      scanning: true,
      error: null,
    }));
  }, [t]);

  const stopScanning = useCallback(() => {
    setState((prev) => ({
      ...prev,
      scanning: false,
    }));
  }, []);

  const onScanSuccess = useCallback((decodedText: string) => {
    try {
      // Validate the QR code format
      const data = JSON.parse(decodedText);
      
      // Check if it's a valid treasure QR code
      if (!data.type || data.type !== 'treasure' || !data.id) {
        throw new Error(t('qr_scanner.errors.invalid_format'));
      }

      setState((prev) => ({
        ...prev,
        lastScannedCode: decodedText,
      }));

      return data;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : t('qr_scanner.errors.invalid_format'),
      }));
      return null;
    }
  }, [t]);

  const onScanError = useCallback((error: Error) => {
    setState((prev) => ({
      ...prev,
      error: error.message || t('qr_scanner.errors.scan_failed'),
    }));
  }, [t]);

  const clearLastScannedCode = useCallback(() => {
    setState((prev) => ({
      ...prev,
      lastScannedCode: null,
    }));
  }, []);

  const generateQRCode = useCallback(async (data: any): Promise<string> => {
    try {
      const response = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(t('qr_scanner.errors.generation_failed'));
      }

      const { qrCodeUrl } = await response.json();
      return qrCodeUrl;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : t('qr_scanner.errors.unknown'),
      }));
      throw error;
    }
  }, [t]);

  return {
    ...state,
    startScanning,
    stopScanning,
    onScanSuccess,
    onScanError,
    clearLastScannedCode,
    generateQRCode,
  };
}; 
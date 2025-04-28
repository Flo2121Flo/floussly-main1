import { useEffect, useState } from 'react';

export class WalletService {
  private static instance: WalletService;
  private isAvailable = false;

  private constructor() {
    this.checkAvailability();
  }

  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  private async checkAvailability() {
    if ('getDigitalGoodsService' in window) {
      try {
        const service = await (window as any).getDigitalGoodsService('https://play.google.com/billing');
        this.isAvailable = true;
      } catch (error) {
        console.warn('Digital Goods Service not available:', error);
      }
    }
  }

  async isWalletAvailable(): Promise<boolean> {
    return this.isAvailable;
  }

  async addToWallet(cardData: {
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
    cardType: string;
  }): Promise<void> {
    if (!this.isAvailable) {
      throw new Error('Wallet service not available');
    }

    try {
      // Implementation for adding card to wallet
      console.log('Adding card to wallet:', cardData);
    } catch (error) {
      console.error('Error adding card to wallet:', error);
      throw error;
    }
  }

  async removeFromWallet(cardId: string): Promise<void> {
    if (!this.isAvailable) {
      throw new Error('Wallet service not available');
    }

    try {
      // Implementation for removing card from wallet
      console.log('Removing card from wallet:', cardId);
    } catch (error) {
      console.error('Error removing card from wallet:', error);
      throw error;
    }
  }

  async getWalletCards(): Promise<Array<{
    id: string;
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
    cardType: string;
  }>> {
    if (!this.isAvailable) {
      throw new Error('Wallet service not available');
    }

    try {
      // Implementation for getting wallet cards
      return [];
    } catch (error) {
      console.error('Error getting wallet cards:', error);
      throw error;
    }
  }
}

// React hook for wallet
export function useWallet() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const walletService = WalletService.getInstance();

    const checkAvailability = async () => {
      try {
        const available = await walletService.isWalletAvailable();
        setIsAvailable(available);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check wallet availability');
      } finally {
        setIsLoading(false);
      }
    };

    checkAvailability();
  }, []);

  return {
    isAvailable,
    isLoading,
    error,
    addToWallet: (cardData: {
      cardNumber: string;
      cardHolder: string;
      expiryDate: string;
      cardType: string;
    }) => WalletService.getInstance().addToWallet(cardData),
    removeFromWallet: (cardId: string) => WalletService.getInstance().removeFromWallet(cardId),
    getWalletCards: () => WalletService.getInstance().getWalletCards()
  };
}

// Types for wallet data
export interface WalletCard {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cardType: string;
}

export interface WalletError {
  code: string;
  message: string;
} 
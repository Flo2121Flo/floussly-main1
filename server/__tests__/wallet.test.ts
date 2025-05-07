import { WalletService } from '../services/wallet';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { config } from '../config';
import { AppError } from '../utils/errors';
import { decrypt } from '../utils/encryption';

describe('Wallet System', () => {
  let walletService: WalletService;
  let testUser: any;
  let testWallet: any;

  beforeEach(async () => {
    walletService = new WalletService();
    testUser = await prisma.user.create({
      data: {
        email: `test${Date.now()}@example.com`,
        phone: `+212${Math.floor(Math.random() * 1000000000)}`,
        password: 'hashedPassword',
        kycStatus: 'APPROVED',
      },
    });
    testWallet = await prisma.wallet.create({
      data: {
        userId: testUser.id,
        balance: '1000', // Encrypted balance
      },
    });
  });

  afterEach(async () => {
    await prisma.wallet.delete({ where: { id: testWallet.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
  });

  describe('Balance Operations', () => {
    it('should get wallet balance', async () => {
      const balance = await walletService.getBalance(testUser.id);
      expect(balance).toBe(1000);
    });

    it('should handle non-existent wallet', async () => {
      await expect(walletService.getBalance('non-existent-id'))
        .rejects
        .toThrow(new AppError(404, 'Wallet not found', 'WALLET_NOT_FOUND'));
    });
  });

  describe('Withdrawal Operations', () => {
    it('should process withdrawal with correct fee', async () => {
      const amount = 100;
      const fee = Math.min(amount * config.fees.withdrawalFeePercentage, config.fees.maxWithdrawalFee);
      
      await walletService.withdraw(testUser.id, amount, {
        accountNumber: '123456789',
        bankName: 'Test Bank',
      });

      const updatedWallet = await prisma.wallet.findUnique({
        where: { userId: testUser.id },
      });
      const newBalance = Number(decrypt(updatedWallet.balance));
      expect(newBalance).toBe(1000 - amount - fee);
    });

    it('should prevent withdrawal without KYC', async () => {
      await prisma.user.update({
        where: { id: testUser.id },
        data: { kycStatus: 'PENDING' },
      });

      await expect(walletService.withdraw(testUser.id, 100, {
        accountNumber: '123456789',
        bankName: 'Test Bank',
      })).rejects.toThrow(new AppError(403, 'KYC verification required', 'KYC_REQUIRED'));
    });

    it('should prevent withdrawal with insufficient funds', async () => {
      await expect(walletService.withdraw(testUser.id, 2000, {
        accountNumber: '123456789',
        bankName: 'Test Bank',
      })).rejects.toThrow(new AppError(400, 'Insufficient funds', 'INSUFFICIENT_FUNDS'));
    });
  });

  describe('Top-up Operations', () => {
    it('should process top-up correctly', async () => {
      const amount = 500;
      await walletService.topUp(testUser.id, amount, 'PAYDUNYA', 'payment-123');

      const updatedWallet = await prisma.wallet.findUnique({
        where: { userId: testUser.id },
      });
      const newBalance = Number(decrypt(updatedWallet.balance));
      expect(newBalance).toBe(1000 + amount);
    });

    it('should validate payment method', async () => {
      await expect(walletService.topUp(testUser.id, 100, 'INVALID_METHOD', 'payment-123'))
        .rejects
        .toThrow(new AppError(400, 'Invalid payment method', 'INVALID_PAYMENT_METHOD'));
    });
  });
}); 
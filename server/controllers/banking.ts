import { Request, Response } from 'express';
import { MoroccanBankingService } from '../services/moroccan-banking';
import { logError, logInfo } from '../utils/logger';

const bankingService = MoroccanBankingService.getInstance();

export const getAccountBalance = async (req: Request, res: Response) => {
  try {
    const { bankCode, accountNumber } = req.params;
    const balance = await bankingService.getAccountBalance(bankCode, accountNumber);
    logInfo(`Retrieved balance for account ${accountNumber} from bank ${bankCode}`, 'BankingController');
    res.json({ balance });
  } catch (error) {
    logError(error as Error, 'BankingController');
    res.status(500).json({ error: 'Failed to get account balance' });
  }
};

export const initiateTransfer = async (req: Request, res: Response) => {
  try {
    const { bankCode } = req.params;
    const transfer = req.body;
    const transactionId = await bankingService.initiateBankTransfer(bankCode, transfer);
    logInfo(`Initiated transfer with ID ${transactionId} from bank ${bankCode}`, 'BankingController');
    res.json({ transactionId });
  } catch (error) {
    logError(error as Error, 'BankingController');
    res.status(500).json({ error: 'Failed to initiate transfer' });
  }
};

export const getExchangeRate = async (req: Request, res: Response) => {
  try {
    const { fromCurrency, toCurrency } = req.query;
    if (!fromCurrency || !toCurrency) {
      return res.status(400).json({ error: 'Missing currency parameters' });
    }
    const rate = await bankingService.getExchangeRate(fromCurrency as string, toCurrency as string);
    logInfo(`Retrieved exchange rate from ${fromCurrency} to ${toCurrency}`, 'BankingController');
    res.json({ rate });
  } catch (error) {
    logError(error as Error, 'BankingController');
    res.status(500).json({ error: 'Failed to get exchange rate' });
  }
};

export const getBankHolidays = async (req: Request, res: Response) => {
  try {
    const { year } = req.params;
    const holidays = await bankingService.getBankHolidays(parseInt(year));
    logInfo(`Retrieved bank holidays for year ${year}`, 'BankingController');
    res.json({ holidays });
  } catch (error) {
    logError(error as Error, 'BankingController');
    res.status(500).json({ error: 'Failed to get bank holidays' });
  }
};

export const getSupportedBanks = async (req: Request, res: Response) => {
  try {
    const banks = bankingService.getSupportedBanks();
    logInfo('Retrieved list of supported banks', 'BankingController');
    res.json({ banks });
  } catch (error) {
    logError(error as Error, 'BankingController');
    res.status(500).json({ error: 'Failed to get supported banks' });
  }
}; 
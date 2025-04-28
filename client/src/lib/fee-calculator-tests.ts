/**
 * Test file for Floussly fee calculation
 * 
 * This file demonstrates the use of the new fee calculation function
 * and confirms that it produces the expected results.
 */

import { calculateFlousslyFee, FlousslyTransactionType } from './financial-utils';

/**
 * Run tests for the fee calculator
 */
function runFeeCalculatorTests() {
  // Test cases
  const testCases = [
    {
      description: "Test 1: User sending 200 MAD to another user",
      type: FlousslyTransactionType.WALLET_TO_WALLET,
      amount: 200,
      expectedFee: 0 // Free
    },
    {
      description: "Test 2: Paying a merchant 800 MAD",
      type: FlousslyTransactionType.WALLET_TO_MERCHANT,
      amount: 800,
      expectedFee: 0 // Free
    },
    {
      description: "Test 3: Withdrawing 500 MAD cash-out",
      type: FlousslyTransactionType.CASH_OUT,
      amount: 500,
      expectedFee: 5 // 1% of 500 = 5 MAD (above min fee of 4 MAD)
    },
    {
      description: "Test 4: Bank transfer of 1200 MAD",
      type: FlousslyTransactionType.BANK_TRANSFER,
      amount: 1200,
      expectedFee: 13 // Maximum fee for transfers above 1000 MAD
    },
    {
      description: "Test 5: Merchant receiving 3000 MAD",
      type: FlousslyTransactionType.MERCHANT_FEE,
      amount: 3000,
      expectedFee: 21 // 0.7% of 3000 = 21 MAD
    },
    {
      description: "Test 6: Cash-out with small amount (300 MAD)",
      type: FlousslyTransactionType.CASH_OUT,
      amount: 300,
      expectedFee: 4 // 1% of 300 = 3 MAD, min fee = 4 MAD applied
    },
    {
      description: "Test 7: Merchant fee with small amount (50 MAD)",
      type: FlousslyTransactionType.MERCHANT_FEE,
      amount: 50,
      expectedFee: 0.4 // 0.7% of 50 = 0.35 MAD, min fee = 0.4 MAD applied
    },
    {
      description: "Test 8: Bank transfer with small amount (500 MAD)",
      type: FlousslyTransactionType.BANK_TRANSFER,
      amount: 500,
      expectedFee: 2.75 // Flat fee for transfers up to 1000 MAD
    }
  ];

  // Run tests
  console.group('Floussly Fee Calculator Tests');
  
  testCases.forEach(test => {
    const calculatedFee = calculateFlousslyFee(test.type, test.amount);
    const passed = calculatedFee === test.expectedFee;
    
    console.log(
      `${test.description}\n` +
      `  Amount: ${test.amount} MAD\n` +
      `  Expected Fee: ${test.expectedFee} MAD\n` +
      `  Calculated Fee: ${calculatedFee} MAD\n` +
      `  Result: ${passed ? 'PASSED ✓' : 'FAILED ✗'}\n`
    );
    
    if (!passed) {
      console.warn(`Test failed for ${test.description}!`);
    }
  });
  
  console.groupEnd();
}

// Export the function to make it available to our application
export { runFeeCalculatorTests };
import { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Calculator } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FlousslyTransactionType,
  calculateFlousslyFee
} from '@/lib/financial-utils';
import { FlousslyFeeDisplay } from '@/components/FlousslyFeeDisplay';
import { runFeeCalculatorTests } from '@/lib/fee-calculator-tests';

export default function TestFeeCalculator() {
  const [_, navigate] = useLocation();
  const { t } = useTranslation();
  const [amount, setAmount] = useState<number>(1000);
  const [transactionType, setTransactionType] = useState<FlousslyTransactionType>(FlousslyTransactionType.WALLET_TO_WALLET);
  const [testResults, setTestResults] = useState<string[]>([]);

  const handleRunTests = () => {
    // Capture console output
    const originalConsoleLog = console.log;
    const logs: string[] = [];
    
    console.log = (...args) => {
      logs.push(args.join(' '));
      originalConsoleLog(...args);
    };
    
    // Run tests
    runFeeCalculatorTests();
    
    // Restore console
    console.log = originalConsoleLog;
    
    // Update state with test results
    setTestResults(logs);
  };

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <Button
        variant="ghost"
        className="mb-4 flex items-center"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Floussly Fee Calculator</CardTitle>
            <CardDescription>
              Test the new fee calculation system for Floussly
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount (MAD)</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-muted-foreground">MAD</span>
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="pl-14"
                    placeholder="Enter amount"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="transactionType">Transaction Type</Label>
                <Select 
                  onValueChange={(value) => setTransactionType(value as FlousslyTransactionType)}
                  defaultValue={transactionType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={FlousslyTransactionType.WALLET_TO_WALLET}>Wallet to Wallet</SelectItem>
                    <SelectItem value={FlousslyTransactionType.WALLET_TO_MERCHANT}>Wallet to Merchant</SelectItem>
                    <SelectItem value={FlousslyTransactionType.BANK_TRANSFER}>Bank Transfer</SelectItem>
                    <SelectItem value={FlousslyTransactionType.CASH_OUT}>Cash Out</SelectItem>
                    <SelectItem value={FlousslyTransactionType.MERCHANT_FEE}>Merchant Fee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg border">
                <h3 className="text-lg font-semibold mb-2">Fee Calculation Result</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Transaction Type:</p>
                    <p className="font-medium">{transactionType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Amount:</p>
                    <p className="font-medium">{amount.toFixed(2)} MAD</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Calculated Fee:</p>
                    <p className="font-medium text-primary">
                      {calculateFlousslyFee(transactionType, amount).toFixed(2)} MAD
                    </p>
                  </div>
                </div>
              </div>
              
              <FlousslyFeeDisplay 
                amount={amount}
                currency="MAD"
                transactionType={transactionType}
              />
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              className="w-full gap-2" 
              variant="outline"
              onClick={handleRunTests}
            >
              <Calculator className="h-4 w-4" />
              Run Test Suite
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              The results of running the Floussly fee calculator test suite
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {testResults.length > 0 ? (
              <div className="bg-muted/30 p-4 rounded-lg border border-border max-h-[400px] overflow-y-auto font-mono text-sm">
                {testResults.map((log, index) => (
                  <div key={index} className="mb-2">
                    {log.includes('PASSED') ? (
                      <div className="text-green-600 dark:text-green-400">{log}</div>
                    ) : log.includes('FAILED') ? (
                      <div className="text-red-600 dark:text-red-400">{log}</div>
                    ) : (
                      <div>{log}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Click "Run Test Suite" to see the test results here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
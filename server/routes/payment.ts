import express, { Request, Response } from 'express';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { v4 as uuidv4 } from 'uuid';
import { paymentService } from '../services/payment';
import { Payment } from '../types/payment';

const router = express.Router();

// Validation schemas
const createPaymentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3),
  description: z.string().optional(),
  provider: z.string(),
});

const updatePaymentSchema = z.object({
  status: z.enum(['pending', 'completed', 'failed']),
});

// Get all payments
router.get('/', async (_req: Request, res: Response) => {
  try {
    const payments = await paymentService.getAllPayments();
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments' });
  }
});

// Get payment by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payment = await paymentService.getPayment(id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment' });
  }
});

// Create payment
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = createPaymentSchema.parse(req.body);
    
    // Initialize payment with provider
    const reference = await paymentService.initializePayment(
      validatedData.provider,
      validatedData.amount,
      validatedData.currency
    );
    
    // Create payment record
    const payment = await paymentService.createPayment({
      amount: validatedData.amount,
      currency: validatedData.currency,
      description: validatedData.description,
    });
    
    res.status(201).json({ 
      message: 'Payment created',
      data: { ...payment, reference }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: fromZodError(error) });
    }
    res.status(500).json({ message: 'Error creating payment' });
  }
});

// Update payment
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updatePaymentSchema.parse(req.body);
    
    const payment = await paymentService.updatePayment(id, validatedData.status);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.json({ message: 'Payment updated', data: payment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: fromZodError(error) });
    }
    res.status(500).json({ message: 'Error updating payment' });
  }
});

// Cancel payment
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await paymentService.deletePayment(id);
    
    if (!success) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.json({ message: 'Payment cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling payment' });
  }
});

export default router;

export function setupPaymentRoutes(app: express.Express) {
  /**
   * Create a new payment
   * Creates a payment using one of the configured payment providers
   */
  app.post("/api/payments/create", async (req: Request, res: Response) => {
    try {
      const { provider, amount, currency, description, redirectUrl, customerInfo, metadata } = z.object({
        provider: z.string(),
        amount: z.number().positive(),
        currency: z.string().default("MAD"),
        description: z.string(),
        redirectUrl: z.string().optional(),
        customerInfo: z.object({
          name: z.string().optional(),
          email: z.string().email().optional(),
          phone: z.string().optional()
        }).optional(),
        metadata: z.record(z.any()).optional()
      }).parse(req.body);

      const reference = uuidv4();
      const callbackUrl = `${req.protocol}://${req.get('host')}/api/payments/callback/${provider}`;
      
      const paymentResponse = await paymentService.createPayment({
        provider,
        amount,
        currency,
        description,
        callbackUrl,
        reference,
        customerInfo,
        metadata
      });

      res.status(200).json({
        success: true,
        reference: paymentResponse.reference,
        paymentUrl: paymentResponse.paymentUrl,
        status: paymentResponse.status,
        message: "Payment created successfully"
      });
    } catch (error) {
      console.error('Payment creation error:', error);
      
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          success: false, 
          message: "Invalid input data", 
          errors: validationError.details 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to create payment" 
      });
    }
  });

  /**
   * Payment callback handler
   * Each payment provider will redirect back to this endpoint when payment is completed
   */
  app.post("/api/payments/callback/:provider", async (req: Request, res: Response) => {
    try {
      const { provider } = req.params;
      
      // Each provider sends different data in callbacks
      // Handle provider-specific logic here
      
      // For demo, we'll just respond with a success page
      res.status(200).send(`
        <html>
          <head>
            <title>Payment Processed</title>
            <style>
              body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; flex-direction: column; }
              .container { text-align: center; max-width: 500px; }
              .success { color: #10b981; }
              .button { background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="success">Payment Processed</h1>
              <p>Your payment has been processed. You can close this window and return to the application.</p>
              <button class="button" onclick="window.close()">Close Window</button>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Payment callback error:', error);
      res.status(500).send('Error processing payment callback');
    }
  });

  /**
   * Get payment status
   * Checks the status of a payment by its reference
   */
  app.get("/api/payments/:reference", async (req: Request, res: Response) => {
    try {
      const { reference } = req.params;
      const provider = req.query.provider as string;
      
      if (!provider) {
        return res.status(400).json({ 
          success: false, 
          message: "Provider is required" 
        });
      }
      
      const verificationResponse = await paymentService.verifyPayment(provider, reference);
      
      res.status(200).json({
        success: verificationResponse.success,
        reference: verificationResponse.reference,
        status: verificationResponse.status,
        amount: verificationResponse.amount,
        currency: verificationResponse.currency,
        message: verificationResponse.message
      });
    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to verify payment" 
      });
    }
  });

  /**
   * Get available payment methods
   */
  app.get("/api/payments/methods", (req: Request, res: Response) => {
    // Get payment methods from our payment bridge
    const { getAllPaymentMethods } = require('../services/payment-bridge');
    const methods = getAllPaymentMethods();
    res.status(200).json(methods);
  });
}
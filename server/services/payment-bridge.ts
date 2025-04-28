/**
 * Payment Bridge Service
 * 
 * This service bridges between our existing PaymentService interface and the
 * new PaymentProvider infrastructure we've created. This keeps backward compatibility
 * with existing code while adding support for the new provider architecture.
 */

import { 
  PaymentService, 
  PaymentProvider as LegacyProvider, 
  CreatePaymentRequest, 
  PaymentResponse, 
  VerificationResponse 
} from './payment';

import { 
  PaymentProvider as NewProvider,
  PaymentRequest,
  TransactionStatus
} from '../integrations/payment-providers/types';

import { 
  getPaymentProvider, 
  getAvailableProviders,
  isProviderAvailable
} from '../integrations/payment-providers';

/**
 * Adapter class that wraps the new PaymentProvider interface to be compatible
 * with the existing PaymentService
 */
export class ModernProviderAdapter implements LegacyProvider {
  name: string;
  private provider: NewProvider;
  
  constructor(provider: NewProvider, name: string) {
    this.provider = provider;
    this.name = name;
  }
  
  async createPayment(data: CreatePaymentRequest): Promise<PaymentResponse> {
    try {
      // Adapt old request format to new format
      const newRequest: PaymentRequest = {
        amount: data.amount,
        currency: data.currency,
        description: data.description,
        callbackUrl: data.callbackUrl,
        returnUrl: data.callbackUrl,
        reference: data.reference,
        customerName: data.customerInfo?.name,
        customerEmail: data.customerInfo?.email,
        customerPhone: data.customerInfo?.phone,
        metadata: data.metadata
      };
      
      const result = await this.provider.createPayment(newRequest);
      
      // Adapt new response format to old format
      return {
        success: result.success,
        reference: result.reference || data.reference || '',
        paymentUrl: result.paymentUrl,
        message: result.message,
        status: this.mapStatus(result.status),
        providerId: this.name,
        providerReference: result.providerReference
      };
    } catch (error: any) {
      return {
        success: false,
        reference: data.reference || '',
        message: error.message || `Payment creation failed with ${this.name}`,
        status: 'failed',
        providerId: this.name
      };
    }
  }
  
  async verifyPayment(reference: string): Promise<VerificationResponse> {
    try {
      const result = await this.provider.checkTransactionStatus(reference);
      
      // Adapt new transaction status to old verification response
      return {
        success: result.status === 'completed',
        reference: result.reference,
        status: this.mapStatus(result.status),
        amount: result.amount,
        currency: result.currency,
        metadata: result.metadata,
        message: result.message
      };
    } catch (error: any) {
      return {
        success: false,
        reference,
        status: 'failed',
        message: error.message || `Verification failed with ${this.name}`
      };
    }
  }
  
  // Map the status values between the two interfaces
  private mapStatus(status?: string): 'pending' | 'completed' | 'failed' {
    if (!status) return 'pending';
    
    switch(status) {
      case 'completed': return 'completed';
      case 'failed': return 'failed';
      case 'cancelled': return 'failed';
      case 'pending': 
      default:
        return 'pending';
    }
  }
}

/**
 * Register all available providers from the new infrastructure with the legacy payment service
 */
export function initializePaymentProviders(paymentService: PaymentService): void {
  // Get all available providers from our new infrastructure
  const providers = getAvailableProviders();
  
  for (const provider of providers) {
    const newProvider = getPaymentProvider(provider.id);
    if (newProvider) {
      // Create an adapter for each provider and register it with the payment service
      const adapter = new ModernProviderAdapter(newProvider, provider.id);
      paymentService.registerProvider(adapter);
      console.log(`Payment provider registered: ${provider.name}`);
    }
  }
}

/**
 * Get all available payment methods including both legacy and new providers
 */
export function getAllPaymentMethods() {
  const methods = [];
  
  // Add PayDunya if available
  methods.push({ 
    id: 'paydunya', 
    name: 'PayDunya', 
    enabled: isProviderAvailable('paydunya') 
  });
  
  // Add M2T if available
  methods.push({ 
    id: 'm2t', 
    name: 'M2T Money Transfer', 
    enabled: isProviderAvailable('m2t') 
  });
  
  // Add Credit Agricole du Maroc if available
  methods.push({ 
    id: 'cam', 
    name: 'Credit Agricole du Maroc', 
    enabled: isProviderAvailable('cam') 
  });
  
  // Add CMI (Controlled through the legacy system)
  methods.push({ 
    id: 'cmi', 
    name: 'CMI', 
    enabled: true 
  });
  
  // Add PayPal (Controlled through the legacy system)
  methods.push({ 
    id: 'paypal', 
    name: 'PayPal', 
    enabled: true 
  });
  
  return methods;
}
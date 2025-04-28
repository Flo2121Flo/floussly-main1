/**
 * Payment API integration infrastructure
 * 
 * This module provides integration with Moroccan payment providers:
 * - PayDunya
 * - M2T Money Transfer
 * - Credit Agricole du Maroc
 */

import { PaymentProvider } from './types';
import { PaydunyaProvider } from './paydunya';
import { M2TProvider } from './m2t';
import { CAMProvider } from './cam';

// Initialize payment providers based on available credentials
const providers: Record<string, PaymentProvider> = {};

// Check for PayDunya configuration and initialize if available
if (process.env.PAYDUNYA_MASTER_KEY && 
    process.env.PAYDUNYA_PRIVATE_KEY && 
    process.env.PAYDUNYA_PUBLIC_KEY && 
    process.env.PAYDUNYA_TOKEN) {
  providers.paydunya = new PaydunyaProvider({
    masterKey: process.env.PAYDUNYA_MASTER_KEY,
    privateKey: process.env.PAYDUNYA_PRIVATE_KEY,
    publicKey: process.env.PAYDUNYA_PUBLIC_KEY,
    token: process.env.PAYDUNYA_TOKEN
  });
}

// Check for M2T configuration and initialize if available
if (process.env.M2T_API_KEY && process.env.M2T_SECRET_KEY) {
  providers.m2t = new M2TProvider({
    apiKey: process.env.M2T_API_KEY,
    secretKey: process.env.M2T_SECRET_KEY
  });
}

// Check for Credit Agricole du Maroc configuration and initialize if available
if (process.env.CAM_API_KEY && process.env.CAM_SECRET_KEY) {
  providers.cam = new CAMProvider({
    apiKey: process.env.CAM_API_KEY,
    secretKey: process.env.CAM_SECRET_KEY
  });
}

/**
 * Get an initialized payment provider by name
 * 
 * @param providerName Name of the payment provider
 * @returns PaymentProvider instance or undefined if not configured
 */
export function getPaymentProvider(providerName: string): PaymentProvider | undefined {
  return providers[providerName.toLowerCase()];
}

/**
 * Get all available payment providers
 * 
 * @returns Array of available payment provider objects with id and name
 */
export function getAvailableProviders(): Array<{id: string, name: string}> {
  return Object.keys(providers).map(key => {
    return {
      id: key,
      name: providers[key].getName()
    };
  });
}

/**
 * Check if a specific payment provider is available
 * 
 * @param providerName Name of the payment provider to check
 * @returns true if provider is available, false otherwise
 */
export function isProviderAvailable(providerName: string): boolean {
  return !!providers[providerName.toLowerCase()];
}
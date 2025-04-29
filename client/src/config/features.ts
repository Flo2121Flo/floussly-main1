import { env } from "../lib/env";

export type FeatureConfig = {
  enabled: boolean;
  [key: string]: boolean | string | number;
};

export type Features = {
  crypto: FeatureConfig & {
    wallet: boolean;
    transactions: boolean;
    exchange: boolean;
    apiKey?: string;
  };
  analytics: FeatureConfig & {
    tracking: boolean;
    events: boolean;
  };
  notifications: FeatureConfig & {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
};

const defaultFeatures: Features = {
  crypto: {
    enabled: false,
    wallet: false,
    transactions: false,
    exchange: false,
    apiKey: env.NEXT_PUBLIC_CRYPTO_API_KEY,
  },
  analytics: {
    enabled: env.NODE_ENV === "production",
    tracking: true,
    events: true,
  },
  notifications: {
    enabled: true,
    push: true,
    email: true,
    sms: true,
  },
};

export const FEATURES: Features = defaultFeatures;

export type FeatureKey = keyof Features;

export function isFeatureEnabled(feature: FeatureKey): boolean {
  return FEATURES[feature].enabled;
}

export function getFeatureConfig<T extends FeatureKey>(feature: T): Features[T] {
  return FEATURES[feature];
}

export function isFeatureFlagEnabled(feature: FeatureKey, flag: string): boolean {
  const config = getFeatureConfig(feature);
  return config[flag] === true;
} 
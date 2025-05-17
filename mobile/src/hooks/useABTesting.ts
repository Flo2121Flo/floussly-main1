import { useEffect, useState } from 'react';
import { abTesting } from '../services/abTesting';

export const useABTesting = (experimentName: string) => {
  const [variant, setVariant] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        await abTesting.initialize();
        const assignedVariant = abTesting.getVariant(experimentName);
        setVariant(assignedVariant);
      } catch (error) {
        console.error('Failed to initialize A/B testing:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [experimentName]);

  const trackEvent = async (
    eventName: string,
    properties?: Record<string, any>
  ) => {
    try {
      await abTesting.trackEvent(experimentName, eventName, properties);
    } catch (error) {
      console.error('Failed to track A/B testing event:', error);
    }
  };

  const forceVariant = async (variantId: string) => {
    try {
      await abTesting.forceVariant(experimentName, variantId);
      setVariant(variantId);
    } catch (error) {
      console.error('Failed to force A/B testing variant:', error);
    }
  };

  return {
    variant,
    isLoading,
    trackEvent,
    forceVariant
  };
}; 
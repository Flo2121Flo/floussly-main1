import { useMemo } from "react";
import {
  isFeatureEnabled,
  getFeatureConfig,
  isFeatureFlagEnabled,
  FeatureKey,
} from "../config/features";

export function useFeature<T extends FeatureKey>(feature: T) {
  const enabled = useMemo(() => isFeatureEnabled(feature), [feature]);
  const config = useMemo(() => getFeatureConfig(feature), [feature]);

  const isFlagEnabled = (flag: string) => {
    if (process.env.NODE_ENV === "development" && !(flag in config)) {
      console.warn(
        `Feature flag "${flag}" not found in feature "${feature}". Available flags: ${Object.keys(
          config
        ).join(", ")}`
      );
    }
    return isFeatureFlagEnabled(feature, flag);
  };

  return {
    enabled,
    config,
    isFlagEnabled,
  };
} 
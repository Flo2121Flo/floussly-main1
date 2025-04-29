import { useState, useEffect, useCallback } from "react";
import { OfflineStorage } from "../lib/offline-storage";

export function useOfflineStorage<T>(key: string, initialData?: T) {
  const [data, setData] = useState<T | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const offlineStorage = OfflineStorage.getInstance();

  // Load data from offline storage
  useEffect(() => {
    try {
      const cachedData = offlineStorage.get<T>(key);
      if (cachedData) {
        setData(cachedData);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load cached data"));
    } finally {
      setIsLoading(false);
    }
  }, [key, offlineStorage]);

  // Save data to offline storage
  const saveData = useCallback(
    (newData: T) => {
      try {
        offlineStorage.set(key, newData);
        setData(newData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to save data"));
      }
    },
    [key, offlineStorage]
  );

  // Clear data from offline storage
  const clearData = useCallback(() => {
    try {
      offlineStorage.delete(key);
      setData(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to clear data"));
    }
  }, [key, offlineStorage]);

  return {
    data,
    isLoading,
    error,
    saveData,
    clearData,
  };
} 
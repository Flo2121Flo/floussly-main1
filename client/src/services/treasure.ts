import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useGeolocation } from './geolocation';

interface Treasure {
  id: string;
  amount: number;
  location: {
    latitude: number;
    longitude: number;
  };
  radius: number;
  status: 'LOCKED' | 'UNLOCKING' | 'UNLOCKED' | 'EXPIRED';
  createdAt: Date;
  expiresAt: Date;
  creatorId: string;
  claimerId?: string;
}

interface TreasureState {
  treasures: Treasure[];
  currentTreasure: Treasure | null;
  loading: boolean;
  error: string | null;
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
}

export const useTreasure = () => {
  const { t } = useTranslation();
  const { getCurrentPosition, calculateDistance } = useGeolocation();
  const [state, setState] = useState<TreasureState>({
    treasures: [],
    currentTreasure: null,
    loading: false,
    error: null,
    userLocation: null,
  });

  const updateUserLocation = useCallback(async () => {
    try {
      const location = await getCurrentPosition();
      setState(prev => ({
        ...prev,
        userLocation: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      }));
      return location;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : t('treasure.errors.location_failed'),
      }));
      throw error;
    }
  }, [getCurrentPosition, t]);

  const createTreasure = async (data: {
    amount: number;
    location: { latitude: number; longitude: number };
    radius: number;
    duration: number; // in minutes
  }) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/treasures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(t('treasure.errors.create_failed'));
      }

      const treasure = await response.json();
      setState((prev) => ({
        ...prev,
        treasures: [...prev.treasures, treasure],
        loading: false,
      }));

      return treasure;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : t('treasure.errors.unknown'),
      }));
      throw error;
    }
  };

  const unlockTreasure = async (treasureId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Get current location first
      const location = await updateUserLocation();
      const treasure = state.treasures.find(t => t.id === treasureId);

      if (!treasure) {
        throw new Error(t('treasure.errors.not_found'));
      }

      // Calculate distance to treasure
      const distance = calculateDistance(
        location,
        { latitude: treasure.location.latitude, longitude: treasure.location.longitude, accuracy: 0, timestamp: 0 }
      );

      // Check if user is within radius
      if (distance > treasure.radius) {
        throw new Error(t('treasure.errors.too_far'));
      }

      const response = await fetch(`/api/treasures/${treasureId}/unlock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location }),
      });

      if (!response.ok) {
        throw new Error(t('treasure.errors.unlock_failed'));
      }

      const updatedTreasure = await response.json();
      setState((prev) => ({
        ...prev,
        treasures: prev.treasures.map((t) => (t.id === treasureId ? updatedTreasure : t)),
        currentTreasure: updatedTreasure,
        loading: false,
      }));

      return updatedTreasure;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : t('treasure.errors.unknown'),
      }));
      throw error;
    }
  };

  const claimTreasure = async (treasureId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Get current location first
      const location = await updateUserLocation();
      const treasure = state.treasures.find(t => t.id === treasureId);

      if (!treasure) {
        throw new Error(t('treasure.errors.not_found'));
      }

      // Calculate distance to treasure
      const distance = calculateDistance(
        location,
        { latitude: treasure.location.latitude, longitude: treasure.location.longitude, accuracy: 0, timestamp: 0 }
      );

      // Check if user is within radius
      if (distance > treasure.radius) {
        throw new Error(t('treasure.errors.too_far'));
      }

      const response = await fetch(`/api/treasures/${treasureId}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location }),
      });

      if (!response.ok) {
        throw new Error(t('treasure.errors.claim_failed'));
      }

      const updatedTreasure = await response.json();
      setState((prev) => ({
        ...prev,
        treasures: prev.treasures.map((t) => (t.id === treasureId ? updatedTreasure : t)),
        currentTreasure: updatedTreasure,
        loading: false,
      }));

      return updatedTreasure;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : t('treasure.errors.unknown'),
      }));
      throw error;
    }
  };

  const fetchNearbyTreasures = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Get current location first
      const location = await updateUserLocation();
      
      const response = await fetch(
        `/api/treasures/nearby?lat=${location.latitude}&lng=${location.longitude}`
      );
      
      if (!response.ok) {
        throw new Error(t('treasure.errors.fetch_failed'));
      }

      const treasures = await response.json();
      setState((prev) => ({
        ...prev,
        treasures,
        loading: false,
      }));

      return treasures;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : t('treasure.errors.unknown'),
      }));
      throw error;
    }
  };

  const getDistanceToTreasure = useCallback((treasure: Treasure) => {
    if (!state.userLocation) return null;

    return calculateDistance(
      { ...state.userLocation, accuracy: 0, timestamp: 0 },
      { latitude: treasure.location.latitude, longitude: treasure.location.longitude, accuracy: 0, timestamp: 0 }
    );
  }, [state.userLocation, calculateDistance]);

  const isWithinTreasureRadius = useCallback((treasure: Treasure) => {
    const distance = getDistanceToTreasure(treasure);
    if (distance === null) return false;
    return distance <= treasure.radius;
  }, [getDistanceToTreasure]);

  return {
    ...state,
    createTreasure,
    unlockTreasure,
    claimTreasure,
    fetchNearbyTreasures,
    updateUserLocation,
    getDistanceToTreasure,
    isWithinTreasureRadius,
  };
}; 
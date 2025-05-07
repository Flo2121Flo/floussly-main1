import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface GeolocationState {
  location: Location | null;
  loading: boolean;
  error: string | null;
  watching: boolean;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: false,
    error: null,
    watching: false,
  });
  const { t } = useTranslation();

  const getCurrentPosition = (): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error(t('geolocation.errors.not_supported')));
        return;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };

          setState((prev) => ({
            ...prev,
            location,
            loading: false,
          }));

          resolve(location);
        },
        (error) => {
          let errorMessage = t('geolocation.errors.unknown');

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = t('geolocation.errors.permission_denied');
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = t('geolocation.errors.position_unavailable');
              break;
            case error.TIMEOUT:
              errorMessage = t('geolocation.errors.timeout');
              break;
          }

          setState((prev) => ({
            ...prev,
            loading: false,
            error: errorMessage,
          }));

          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    });
  };

  const startWatching = () => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: t('geolocation.errors.not_supported'),
      }));
      return;
    }

    setState((prev) => ({ ...prev, watching: true, error: null }));

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };

        setState((prev) => ({
          ...prev,
          location,
        }));
      },
      (error) => {
        let errorMessage = t('geolocation.errors.unknown');

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = t('geolocation.errors.permission_denied');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = t('geolocation.errors.position_unavailable');
            break;
          case error.TIMEOUT:
            errorMessage = t('geolocation.errors.timeout');
            break;
        }

        setState((prev) => ({
          ...prev,
          error: errorMessage,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setState((prev) => ({ ...prev, watching: false }));
    };
  };

  const calculateDistance = (location1: Location, location2: Location): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (location1.latitude * Math.PI) / 180;
    const φ2 = (location2.latitude * Math.PI) / 180;
    const Δφ = ((location2.latitude - location1.latitude) * Math.PI) / 180;
    const Δλ = ((location2.longitude - location1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const isWithinRadius = (location1: Location, location2: Location, radius: number): boolean => {
    const distance = calculateDistance(location1, location2);
    return distance <= radius;
  };

  return {
    ...state,
    getCurrentPosition,
    startWatching,
    calculateDistance,
    isWithinRadius,
  };
}; 
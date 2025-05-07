import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  language: string;
  createdAt: Date;
  lastLogin: Date;
  settings: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
  };
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });
  const { t } = useTranslation();

  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(t('auth.errors.invalid_credentials'));
      }

      const { user, token } = await response.json();
      localStorage.setItem('token', token);

      setState((prev) => ({
        ...prev,
        user,
        loading: false,
        isAuthenticated: true,
      }));

      return user;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : t('auth.errors.unknown'),
        isAuthenticated: false,
      }));
      throw error;
    }
  }, [t]);

  const signup = useCallback(async (data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    language?: string;
  }) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(t('auth.errors.signup_failed'));
      }

      const { user, token } = await response.json();
      localStorage.setItem('token', token);

      setState((prev) => ({
        ...prev,
        user,
        loading: false,
        isAuthenticated: true,
      }));

      return user;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : t('auth.errors.unknown'),
        isAuthenticated: false,
      }));
      throw error;
    }
  }, [t]);

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      localStorage.removeItem('token');

      setState((prev) => ({
        ...prev,
        user: null,
        loading: false,
        isAuthenticated: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : t('auth.errors.unknown'),
      }));
      throw error;
    }
  }, [t]);

  const resetPassword = useCallback(async (email: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(t('auth.errors.reset_failed'));
      }

      setState((prev) => ({
        ...prev,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : t('auth.errors.unknown'),
      }));
      throw error;
    }
  }, [t]);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(t('auth.errors.update_failed'));
      }

      const user = await response.json();

      setState((prev) => ({
        ...prev,
        user,
        loading: false,
      }));

      return user;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : t('auth.errors.unknown'),
      }));
      throw error;
    }
  }, [t]);

  const updateSettings = useCallback(async (settings: User['settings']) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/auth/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error(t('auth.errors.settings_update_failed'));
      }

      const user = await response.json();

      setState((prev) => ({
        ...prev,
        user,
        loading: false,
      }));

      return user;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : t('auth.errors.unknown'),
      }));
      throw error;
    }
  }, [t]);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setState((prev) => ({
        ...prev,
        loading: false,
        isAuthenticated: false,
      }));
      return;
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Invalid token');
      }

      const user = await response.json();

      setState((prev) => ({
        ...prev,
        user,
        loading: false,
        isAuthenticated: true,
      }));
    } catch (error) {
      localStorage.removeItem('token');
      setState((prev) => ({
        ...prev,
        user: null,
        loading: false,
        isAuthenticated: false,
      }));
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    ...state,
    login,
    signup,
    logout,
    resetPassword,
    updateProfile,
    updateSettings,
    checkAuth,
  };
}; 
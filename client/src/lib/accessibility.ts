import { useEffect, useState } from 'react';

// Minimum touch target size (44x44 pixels as per WCAG guidelines)
export const MIN_TOUCH_TARGET_SIZE = 44;

// Screen reader announcement utility
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('role', 'status');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => document.body.removeChild(announcement), 1000);
}

// Touch target size checker
export function ensureTouchTargetSize(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const isTooSmall = rect.width < MIN_TOUCH_TARGET_SIZE || rect.height < MIN_TOUCH_TARGET_SIZE;
  
  if (isTooSmall) {
    console.warn('Touch target is too small:', element);
    element.style.minWidth = `${MIN_TOUCH_TARGET_SIZE}px`;
    element.style.minHeight = `${MIN_TOUCH_TARGET_SIZE}px`;
  }
}

// Mobile accessibility hook
export function useMobileAccessibility() {
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Check for high contrast preference
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Adjust font size based on system settings
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    setFontSize(mediaQuery.matches ? 16 : 14);

    const handleChange = (e: MediaQueryListEvent) => {
      setFontSize(e.matches ? 16 : 14);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return {
    isReducedMotion,
    isHighContrast,
    fontSize,
    ensureTouchTargetSize,
    announceToScreenReader
  };
}

// Mobile-friendly focus management
export function useMobileFocus() {
  useEffect(() => {
    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (target && target.scrollIntoView) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    document.addEventListener('focus', handleFocus, true);
    return () => document.removeEventListener('focus', handleFocus, true);
  }, []);
}

// Mobile gesture handling
export function useMobileGestures() {
  useEffect(() => {
    const handleTouchStart = (event: TouchEvent) => {
      // Implement gesture handling logic here
      console.log('Touch started:', event);
    };

    document.addEventListener('touchstart', handleTouchStart);
    return () => document.removeEventListener('touchstart', handleTouchStart);
  }, []);
} 
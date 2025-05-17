import { logger } from './logger';

export interface TimezoneInfo {
  timezone: string;
  offset: string;
  isDST: boolean;
}

export function getCurrentTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function getTimezoneOffset(): string {
  const date = new Date();
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function isDST(): boolean {
  const date = new Date();
  const jan = new Date(date.getFullYear(), 0, 1);
  const jul = new Date(date.getFullYear(), 6, 1);
  return Math.min(jan.getTimezoneOffset(), jul.getTimezoneOffset()) === date.getTimezoneOffset();
}

export function getTimezoneInfo(): TimezoneInfo {
  try {
    return {
      timezone: getCurrentTimezone(),
      offset: getTimezoneOffset(),
      isDST: isDST()
    };
  } catch (error) {
    const err = error as Error;
    logger.error('Failed to get timezone info', { error: err.message });
    return {
      timezone: 'UTC',
      offset: '+00:00',
      isDST: false
    };
  }
}

export function convertToUTC(date: Date): Date {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
}

export function convertFromUTC(date: Date, timezone: string = getCurrentTimezone()): Date {
  try {
    return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  } catch (error) {
    const err = error as Error;
    logger.error('Failed to convert from UTC', { error: err.message, timezone });
    return date;
  }
}

export function formatDate(date: Date, timezone: string = getCurrentTimezone()): string {
  try {
    return date.toLocaleString('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (error) {
    const err = error as Error;
    logger.error('Failed to format date', { error: err.message, timezone });
    return date.toISOString();
  }
} 
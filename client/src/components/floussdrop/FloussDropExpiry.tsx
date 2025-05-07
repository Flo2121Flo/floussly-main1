import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { enUS, fr, ar, tzm } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';

interface FloussDropExpiryProps {
  onExpiryChange: (expiryDate: Date) => void;
  initialExpiry?: Date;
  disabled?: boolean;
}

const EXPIRY_OPTIONS = {
  '1h': 1 * 60 * 60 * 1000, // 1 hour
  '6h': 6 * 60 * 60 * 1000, // 6 hours
  '12h': 12 * 60 * 60 * 1000, // 12 hours
  '24h': 24 * 60 * 60 * 1000, // 24 hours
  '48h': 48 * 60 * 60 * 1000, // 48 hours
  '72h': 72 * 60 * 60 * 1000, // 72 hours
  '7d': 7 * 24 * 60 * 60 * 1000, // 7 days
  'custom': 0, // Custom duration
};

export const FloussDropExpiry: React.FC<FloussDropExpiryProps> = ({
  onExpiryChange,
  initialExpiry,
  disabled = false,
}) => {
  const { t, i18n } = useTranslation();
  const [selectedOption, setSelectedOption] = useState<string>('24h');
  const [customHours, setCustomHours] = useState<string>('24');
  const [expiryDate, setExpiryDate] = useState<Date>(initialExpiry || new Date(Date.now() + EXPIRY_OPTIONS['24h']));

  const getDateLocale = () => {
    switch (i18n.language) {
      case 'fr':
        return fr;
      case 'ar':
        return ar;
      case 'tzm':
        return tzm;
      default:
        return enUS;
    }
  };

  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
    if (value === 'custom') {
      const hours = parseInt(customHours) || 24;
      const newExpiry = new Date(Date.now() + hours * 60 * 60 * 1000);
      setExpiryDate(newExpiry);
      onExpiryChange(newExpiry);
    } else {
      const newExpiry = new Date(Date.now() + EXPIRY_OPTIONS[value as keyof typeof EXPIRY_OPTIONS]);
      setExpiryDate(newExpiry);
      onExpiryChange(newExpiry);
    }
  };

  const handleCustomHoursChange = (value: string) => {
    setCustomHours(value);
    const hours = parseInt(value) || 24;
    const newExpiry = new Date(Date.now() + hours * 60 * 60 * 1000);
    setExpiryDate(newExpiry);
    onExpiryChange(newExpiry);
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <Label>{t('floussdrop.expiry.title')}</Label>
        <Select
          value={selectedOption}
          onValueChange={handleOptionChange}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('floussdrop.expiry.select')} />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(EXPIRY_OPTIONS).map(([key, _]) => (
              <SelectItem key={key} value={key}>
                {t(`floussdrop.expiry.options.${key}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedOption === 'custom' && (
        <div className="space-y-2">
          <Label>{t('floussdrop.expiry.custom')}</Label>
          <Input
            type="number"
            min="1"
            max="720" // 30 days
            value={customHours}
            onChange={(e) => handleCustomHoursChange(e.target.value)}
            disabled={disabled}
          />
        </div>
      )}

      <div className="text-sm text-muted-foreground">
        {t('floussdrop.expiry.remaining', {
          time: formatDistanceToNow(expiryDate, {
            addSuffix: true,
            locale: getDateLocale(),
          }),
        })}
      </div>
    </Card>
  );
}; 
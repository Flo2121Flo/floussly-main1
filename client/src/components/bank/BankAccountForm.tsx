import { useState } from 'react';
import { BankAccount } from '../../types/bank';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useTranslation } from '../../lib/i18n';

interface BankAccountFormProps {
  account?: BankAccount;
  onSubmit: (account: Omit<BankAccount, 'id'>) => void;
  onCancel: () => void;
}

export default function BankAccountForm({ account, onSubmit, onCancel }: BankAccountFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Omit<BankAccount, 'id'>>({
    bankName: account?.bankName || '',
    accountNumber: account?.accountNumber || '',
    accountType: account?.accountType || 'CHECKING',
    isDefault: account?.isDefault || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bankName">{t('bank.bankName')}</Label>
            <Input
              id="bankName"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">{t('bank.accountNumber')}</Label>
            <Input
              id="accountNumber"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountType">{t('bank.accountType')}</Label>
            <Select
              value={formData.accountType}
              onValueChange={(value) => setFormData({ ...formData, accountType: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('bank.selectAccountType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CHECKING">{t('bank.checking')}</SelectItem>
                <SelectItem value="SAVINGS">{t('bank.savings')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">
              {account ? t('common.update') : t('common.add')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 
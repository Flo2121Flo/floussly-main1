import { BankAccount } from '../../types/bank';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useTranslation } from '../../lib/i18n';

interface BankAccountListProps {
  accounts: BankAccount[];
  onSelect: (account: BankAccount) => void;
  onDelete: (accountId: string) => void;
}

export default function BankAccountList({ accounts, onSelect, onDelete }: BankAccountListProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {accounts.map((account) => (
        <Card key={account.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{account.bankName}</h3>
                <p className="text-sm text-muted-foreground">
                  {account.accountNumber} • {account.accountType}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onSelect(account)}>
                  {t('common.edit')}
                </Button>
                <Button variant="destructive" onClick={() => onDelete(account.id)}>
                  {t('common.delete')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 
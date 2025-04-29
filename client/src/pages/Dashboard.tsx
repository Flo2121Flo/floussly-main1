import { useState, useMemo, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, CreditCard, Wallet, ArrowUpRight, ArrowDownRight, Settings, User } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useFeature } from "../hooks/use-feature";
import { Skeleton } from "@/components/ui/skeleton";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function QuickActionCard({
  icon,
  title,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <Button className="w-full" onClick={onClick}>
          {title}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { enabled: cryptoEnabled } = useFeature("crypto");
  const [activeTab, setActiveTab] = useState('overview');

  const recentTransactions = [
    { id: 1, type: 'send', amount: 500, date: '2024-04-28', recipient: 'John Doe' },
    { id: 2, type: 'receive', amount: 1000, date: '2024-04-27', sender: 'Jane Smith' },
    { id: 3, type: 'send', amount: 200, date: '2024-04-26', recipient: 'Mike Johnson' },
  ];

  const quickActions = useMemo(
    () => [
      {
        icon: <ArrowUpRight className="h-4 w-4 text-muted-foreground" />,
        title: t("dashboard.sendMoney"),
        onClick: () => {/* Handle send money */},
      },
      {
        icon: <ArrowDownRight className="h-4 w-4 text-muted-foreground" />,
        title: t("dashboard.requestMoney"),
        onClick: () => {/* Handle request money */},
      },
      {
        icon: <CreditCard className="h-4 w-4 text-muted-foreground" />,
        title: t("dashboard.payBills"),
        onClick: () => {/* Handle pay bills */},
      },
      {
        icon: <Wallet className="h-4 w-4 text-muted-foreground" />,
        title: t("dashboard.topUp"),
        onClick: () => {/* Handle top up */},
      },
    ],
    [t]
  );

  if (isAuthLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.welcome')}, {user?.name}</h1>
          <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <Avatar>
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <QuickActionCard key={action.title} {...action} />
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t('dashboard.overview')}</TabsTrigger>
          <TabsTrigger value="transactions">{t('dashboard.transactions')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('dashboard.analytics')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Balance Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.balance')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$5,000.00</div>
              <div className="flex items-center space-x-2 mt-2">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-green-500">+2.5% from last month</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.recentTransactions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'send' ? 'bg-red-100' : 'bg-green-100'
                      }`}>
                        {transaction.type === 'send' ? (
                          <ArrowUpRight className="h-4 w-4 text-red-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          {transaction.type === 'send' ? transaction.recipient : transaction.sender}
                        </div>
                        <div className="text-sm text-muted-foreground">{transaction.date}</div>
                      </div>
                    </div>
                    <div className={`font-medium ${
                      transaction.type === 'send' ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {transaction.type === 'send' ? '-' : '+'}${transaction.amount}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {cryptoEnabled && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("dashboard.cryptoPortfolio")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Skeleton className="h-32" />}>
                    <CryptoPortfolio />
                  </Suspense>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>{t("dashboard.cryptoMarket")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Skeleton className="h-32" />}>
                    <CryptoMarket />
                  </Suspense>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="transactions">
          {/* Transactions List */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.allTransactions')}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add transaction list component here */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          {/* Analytics Charts */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.analytics')}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add analytics charts here */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
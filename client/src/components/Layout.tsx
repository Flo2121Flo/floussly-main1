import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Home,
  Send,
  QrCode,
  Users,
  Map,
  BarChart,
  Bell,
  Settings,
  User,
  LogOut,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const isPublicRoute = ['/splash', '/language', '/login', '/register', '/otp-verification'].includes(location);

  const navigationItems = [
    { path: '/', icon: Home, label: t('navigation.home') },
    { path: '/send-money', icon: Send, label: t('navigation.send') },
    { path: '/qr-code', icon: QrCode, label: t('navigation.qr') },
    { path: '/daret', icon: Users, label: t('navigation.daret') },
    { path: '/agent-map', icon: Map, label: t('navigation.agents') },
    { path: '/finance', icon: BarChart, label: t('navigation.finance') },
  ];

  if (isPublicRoute) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <span className="hidden font-bold sm:inline-block">Floussly</span>
            </a>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  variant={location === item.path ? 'default' : 'ghost'}
                  className="h-9"
                  onClick={() => setLocation(item.path)}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="ml-2">{item.label}</span>
                </Button>
              ))}
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              {/* Search bar can be added here */}
            </div>
            <nav className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={() => setLocation('/notifications')}>
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setLocation('/settings')}>
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setLocation('/profile')}>
                <User className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
        <div className="grid h-16 grid-cols-5">
          {navigationItems.slice(0, 5).map((item) => (
            <Button
              key={item.path}
              variant={location === item.path ? 'default' : 'ghost'}
              className="h-full flex-col"
              onClick={() => setLocation(item.path)}
            >
              <item.icon className="h-4 w-4" />
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
        </div>
      </nav>
    </div>
  );
}

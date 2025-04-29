import { useMemo } from "react";
import { useFeature } from "../hooks/use-feature";
import { useTranslation } from "../lib/i18n";
import { useRouter } from "next/router";
import { Wallet, Coins, Home, CreditCard, Settings, Bell } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
}

function NavItem({ icon, label, href, isActive }: NavItemProps) {
  const router = useRouter();
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative h-9 w-9",
            isActive && "bg-accent text-accent-foreground"
          )}
          onClick={() => router.push(href)}
          aria-label={label}
          aria-current={isActive ? "page" : undefined}
        >
          {icon}
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function Navigation() {
  const { t } = useTranslation();
  const router = useRouter();
  const { enabled: cryptoEnabled, isFlagEnabled } = useFeature("crypto");
  
  const navItems = useMemo(() => [
    {
      icon: <Home className="h-5 w-5" />,
      label: t("navigation.home"),
      href: "/",
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      label: t("navigation.transactions"),
      href: "/transactions",
    },
    ...(cryptoEnabled ? [
      {
        icon: <Wallet className="h-5 w-5" />,
        label: t("navigation.cryptoWallet"),
        href: "/crypto/wallet",
        enabled: isFlagEnabled("wallet"),
      },
      {
        icon: <Coins className="h-5 w-5" />,
        label: t("navigation.cryptoExchange"),
        href: "/crypto/exchange",
        enabled: isFlagEnabled("exchange"),
      },
    ] : []),
    {
      icon: <Bell className="h-5 w-5" />,
      label: t("navigation.notifications"),
      href: "/notifications",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: t("navigation.settings"),
      href: "/settings",
    },
  ], [t, cryptoEnabled, isFlagEnabled]);

  return (
    <nav className="flex flex-col items-center gap-4 px-2 py-4">
      {navItems.map((item) => (
        <NavItem
          key={item.href}
          {...item}
          isActive={router.pathname === item.href}
        />
      ))}
    </nav>
  );
} 
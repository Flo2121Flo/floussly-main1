import { useTranslation } from "../lib/i18n";
import { 
  Bell, 
  CheckCircle, 
  ArrowDown, 
  Info, 
  Gift, 
  LucideIcon 
} from "lucide-react";

export interface Notification {
  id: string;
  type: "money_received" | "payment_reminder" | "kyc_verification" | "transaction" | "referral" | "other";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

interface NotificationItemProps {
  notification: Notification;
}

export default function NotificationItem({ notification }: NotificationItemProps) {
  const { t } = useTranslation();
  
  const { type, title, message, time, isRead } = notification;
  
  const getNotificationDetails = (): { 
    icon: LucideIcon; 
    borderColor: string; 
    bgColor: string;
    iconColor: string;
  } => {
    switch (type) {
      case "money_received":
        return {
          icon: ArrowDown,
          borderColor: "border-primary",
          bgColor: "bg-primary bg-opacity-10 dark:bg-opacity-30",
          iconColor: "text-primary"
        };
      case "payment_reminder":
        return {
          icon: Bell,
          borderColor: "border-yellow-500",
          bgColor: "bg-yellow-100 dark:bg-yellow-900",
          iconColor: "text-yellow-500 dark:text-yellow-300"
        };
      case "kyc_verification":
        return {
          icon: CheckCircle,
          borderColor: "border-green-500",
          bgColor: "bg-green-100 dark:bg-green-900",
          iconColor: "text-green-500 dark:text-green-300"
        };
      case "transaction":
        return {
          icon: Info,
          borderColor: "",
          bgColor: "bg-muted",
          iconColor: "text-muted-foreground"
        };
      case "referral":
        return {
          icon: Gift,
          borderColor: "",
          bgColor: "bg-muted",
          iconColor: "text-muted-foreground"
        };
      default:
        return {
          icon: Bell,
          borderColor: "",
          bgColor: "bg-muted",
          iconColor: "text-muted-foreground"
        };
    }
  };
  
  const { icon: Icon, borderColor, bgColor, iconColor } = getNotificationDetails();
  
  return (
    <div className={`bg-card rounded-lg p-4 mb-3 card-shadow ${borderColor ? `border-l-4 ${borderColor}` : ""}`}>
      <div className="flex">
        <div className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center mr-3 flex-shrink-0`}>
          <Icon className={iconColor} size={18} />
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground mb-1">{message}</p>
          <p className="text-xs text-muted-foreground">{time}</p>
        </div>
      </div>
    </div>
  );
}

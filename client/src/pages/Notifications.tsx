import { useLocation } from "wouter";
import { useTranslation } from "../lib/i18n";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationItem from "@/components/NotificationItem";
import { useNotifications } from "@/hooks/use-notifications";

export default function Notifications() {
  const [_, setLocation] = useLocation();
  const { t } = useTranslation();
  const { 
    todayNotifications, 
    yesterdayNotifications, 
    olderNotifications,
    markAllAsRead,
    isLoading
  } = useNotifications();

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleLoadMore = () => {
    // This would load more notifications in a real app
  };

  return (
    <div className="p-6 pt-12">
      <Button 
        variant="ghost" 
        className="mb-8 flex items-center text-muted-foreground p-0"
        onClick={() => setLocation("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("nav.back")}
      </Button>
      
      <h1 className="font-poppins font-bold text-3xl mb-6">{t("notifications.title")}</h1>
      
      {/* Today's notifications */}
      {todayNotifications.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">{t("notifications.today")}</h3>
            <Button 
              variant="link" 
              className="text-primary text-sm p-0 h-auto"
              onClick={handleMarkAllAsRead}
              disabled={isLoading}
            >
              {t("notifications.markAllRead")}
            </Button>
          </div>
          
          {todayNotifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </>
      )}
      
      {/* Yesterday's notifications */}
      {yesterdayNotifications.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-4 mt-6">
            <h3 className="font-medium">{t("notifications.yesterday")}</h3>
          </div>
          
          {yesterdayNotifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </>
      )}
      
      {/* Older notifications */}
      {olderNotifications.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-4 mt-6">
            <h3 className="font-medium">Older</h3>
          </div>
          
          {olderNotifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </>
      )}
      
      {/* Load more button */}
      {(todayNotifications.length > 0 || yesterdayNotifications.length > 0 || olderNotifications.length > 0) && (
        <Button 
          variant="outline" 
          className="w-full mt-6"
          onClick={handleLoadMore}
        >
          {t("notifications.loadMore")}
        </Button>
      )}
      
      {/* No notifications state */}
      {todayNotifications.length === 0 && yesterdayNotifications.length === 0 && olderNotifications.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">You don't have any notifications yet.</p>
        </div>
      )}
    </div>
  );
}

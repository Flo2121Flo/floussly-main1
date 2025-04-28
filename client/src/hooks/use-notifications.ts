import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Notification } from "@/components/NotificationItem";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";

export function useNotifications() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  // Mock notifications for demo
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([
    {
      id: "notif-1",
      type: "money_received",
      title: "Money Received",
      message: "You've received MAD 1,000 from Hassan",
      time: "2 hours ago",
      isRead: false
    },
    {
      id: "notif-2",
      type: "payment_reminder",
      title: "Daret Payment Reminder",
      message: "Your payment of MAD 2,000 for \"Office Colleagues\" is due today",
      time: "5 hours ago",
      isRead: false
    },
    {
      id: "notif-3",
      type: "kyc_verification",
      title: "KYC Verification",
      message: "Your identity has been successfully verified",
      time: "8 hours ago",
      isRead: false
    },
    {
      id: "notif-4",
      type: "transaction",
      title: "Transaction Completed",
      message: "Your transfer of MAD 250 to Laila was successful",
      time: "Yesterday, 14:30",
      isRead: true
    },
    {
      id: "notif-5",
      type: "referral",
      title: "Referral Bonus",
      message: "You've earned MAD 50 for referring Karim to Floussly",
      time: "Yesterday, 11:20",
      isRead: true
    }
  ]);
  
  // Disable the API query for now and just use mock data
  // const { data: notifications, isLoading, error } = useQuery<Notification[]>({
  //   queryKey: ["/api/notifications"],
  //   enabled: isAuthenticated,
  //   // If API fails, use local state
  //   onError: () => {
  //     return localNotifications;
  //   }
  // });
  
  // Use mock data always for testing
  const notifications = localNotifications;
  const isLoading = false;
  const error = null;
  
  // Update local notifications when query data changes
  useEffect(() => {
    if (notifications) {
      setLocalNotifications(notifications);
    }
  }, [notifications]);
  
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await apiRequest("PATCH", `/api/notifications/${notificationId}/read`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      // For demo, update local state
      setLocalNotifications(
        localNotifications.map(notif => ({ ...notif, isRead: true }))
      );
    }
  });
  
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", "/api/notifications/read-all", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      // For demo, update local state
      setLocalNotifications(
        localNotifications.map(notif => ({ ...notif, isRead: true }))
      );
    }
  });
  
  return {
    notifications: notifications || localNotifications,
    todayNotifications: (notifications || localNotifications)
      .filter(n => n.time.includes("hours ago") || n.time.includes("Today")),
    yesterdayNotifications: (notifications || localNotifications)
      .filter(n => n.time.includes("Yesterday")),
    olderNotifications: (notifications || localNotifications)
      .filter(n => !n.time.includes("hours ago") && !n.time.includes("Today") && !n.time.includes("Yesterday")),
    unreadCount: (notifications || localNotifications).filter(n => !n.isRead).length,
    isLoading,
    error,
    markAsRead: (notificationId: string) => markAsReadMutation.mutate(notificationId),
    markAllAsRead: () => markAllAsReadMutation.mutate()
  };
}

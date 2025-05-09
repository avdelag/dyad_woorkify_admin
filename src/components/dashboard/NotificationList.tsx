"use client";
import { Bell, Check, AlertTriangle } from "lucide-react";

export const NotificationList = () => {
  const notifications = [
    {
      id: 1,
      type: "info",
      message: "New vendor registration pending approval",
      time: "30m ago"
    },
    {
      id: 2,
      type: "warning",
      message: "Order #5678 requires attention",
      time: "2h ago"
    },
    {
      id: 3,
      type: "success",
      message: "System update completed successfully",
      time: "1d ago"
    }
  ];

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <span className="text-sm text-muted-foreground">3 new</span>
      </div>
      <div className="space-y-4">
        {notifications.map((notif) => (
          <div key={notif.id} className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${notif.type === 'warning' ? 'bg-red-100 text-red-600' : notif.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
              {notif.type === 'warning' ? <AlertTriangle className="h-5 w-5" /> : 
               notif.type === 'success' ? <Check className="h-5 w-5" /> : 
               <Bell className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <p className="font-medium">{notif.message}</p>
              <p className="text-sm text-muted-foreground">{notif.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
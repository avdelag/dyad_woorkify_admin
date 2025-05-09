"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const MessageList = () => {
  const messages = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "",
      message: "Need help with order #1234",
      time: "2h ago",
      unread: true
    },
    {
      id: 2,
      name: "Mike Peterson",
      avatar: "",
      message: "Vendor onboarding complete",
      time: "1d ago",
      unread: false
    },
    {
      id: 3,
      name: "Alex Chen",
      avatar: "",
      message: "Payment issue resolved",
      time: "2d ago",
      unread: false
    }
  ];

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Recent Messages</h3>
      <div className="space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={msg.avatar} />
              <AvatarFallback>{msg.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex justify-between">
                <h4 className={`font-medium ${msg.unread ? 'text-primary' : ''}`}>{msg.name}</h4>
                <span className="text-sm text-muted-foreground">{msg.time}</span>
              </div>
              <p className="text-sm text-muted-foreground">{msg.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
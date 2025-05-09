"use client";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Calendar,
  Package,
  Bell,
  MessageSquare,
  BarChart2,
} from "lucide-react";
import Link from "next/link";

const sidebarItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clients", href: "/dashboard/clients", icon: Users },
  { name: "Vendors", href: "/dashboard/vendors", icon: ShoppingBag },
  { name: "Bookings", href: "/dashboard/bookings", icon: Calendar },
  { name: "Orders", href: "/dashboard/orders", icon: Package },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { name: "Reports & Stats", href: "/dashboard/reports", icon: BarChart2 },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 border-r bg-background transition-all duration-300 ease-in-out",
        collapsed && "w-20"
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between border-b p-4">
          {!collapsed && <span className="font-bold">Woorkify</span>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? ">" : "<"}
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      isActive
                        ? "bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400"
                        : "text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
};
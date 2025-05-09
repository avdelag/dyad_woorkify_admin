"use client";
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, BarChart3, Settings as SettingsIcon, MessageSquare, LogOut, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/clients', label: 'Clients', icon: Users },
  { href: '/dashboard/vendors', label: 'Vendors', icon: Briefcase },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart }, // Added Orders
  { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
  { href: '/dashboard/statistics', label: 'Statistics', icon: BarChart3 },
  // Settings is in Navbar dropdown, can be here too if preferred
];

export const SidebarNav = ({ onLinkClick }: { onLinkClick?: () => void }) => {
  const location = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (onLinkClick) onLinkClick(); // Close mobile sidebar
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full">
      <nav className="flex-grow flex flex-col space-y-1.5 px-3 py-4"> {/* Slightly reduced spacing */}
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            onClick={onLinkClick}
            className={cn(
              "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium smooth-hover",
              location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
                ? "bg-brand-orange text-white shadow-md hover:bg-brand-orange/90"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
            aria-current={location.pathname === item.href ? "page" : undefined}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-3 border-t border-border/50">
        <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/20 hover:text-destructive smooth-hover justify-start"
        >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
        </Button>
      </div>
    </div>
  );
}

export const Sidebar = () => {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border/50 h-full fixed top-20 left-0 z-20"> {/* Adjusted top to be below navbar */}
      <SidebarNav />
    </aside>
  );
};
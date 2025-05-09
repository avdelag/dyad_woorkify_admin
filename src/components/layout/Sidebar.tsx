"use client";
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, BarChart3, Settings as SettingsIcon, MessageSquare } from 'lucide-react'; // Renamed Settings to SettingsIcon
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/users', label: 'View Users', icon: Users },
  { href: '/dashboard/vendors', label: 'View Vendors', icon: Briefcase },
  { href: '/dashboard/statistics', label: 'Statistics', icon: BarChart3 },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare }, // Added Messages
  { href: '/dashboard/settings', label: 'Settings', icon: SettingsIcon },
];

export const SidebarNav = ({ onLinkClick }: { onLinkClick?: () => void }) => {
  const location = useLocation();

  return (
    <nav className="flex flex-col space-y-1 px-2 py-4">
      {navItems.map((item) => (
        <Link
          key={item.label}
          to={item.href}
          onClick={onLinkClick} // Close mobile sidebar on link click
          className={cn(
            "flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
            location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
              ? "bg-brand-orange text-white shadow-md"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export const Sidebar = () => {
  return (
    <aside className="hidden md:block w-64 bg-card border-r h-full fixed top-16 left-0 z-20 pt-2">
      <SidebarNav />
    </aside>
  );
};
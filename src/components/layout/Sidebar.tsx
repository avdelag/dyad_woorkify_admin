"use client";
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have a cn utility

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/users', label: 'View Users', icon: Users },
  { href: '/dashboard/vendors', label: 'View Vendors', icon: Briefcase },
  { href: '/dashboard/statistics', label: 'Statistics', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-background border-r h-full fixed top-16 left-0 pt-4 z-40"> {/* Adjusted top to be below navbar */}
      <nav className="flex flex-col space-y-2 px-4">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              location.pathname === item.href
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};
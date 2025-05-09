"use client";
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar, SidebarNav } from './Sidebar';
import { Sheet, SheetContent } from "@/components/ui/sheet";

export const DashboardLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);
  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-muted/30 dark:bg-gray-900">
      <Navbar toggleMobileSidebar={toggleMobileSidebar} isMobileSidebarOpen={isMobileSidebarOpen} />
      <div className="flex flex-1 pt-16"> {/* pt-16 to offset navbar height */}
        <Sidebar /> {/* Desktop Sidebar */}
        
        {/* Mobile Sidebar */}
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64 bg-card">
            <div className="flex items-center justify-between p-4 border-b">
                <span className="text-xl font-bold text-brand-orange">Woorkify</span>
            </div>
            <SidebarNav onLinkClick={closeMobileSidebar} />
          </SheetContent>
        </Sheet>

        <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
"use client";
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar, SidebarNav } from './Sidebar';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { GlobalFilters } from '@/components/dashboard/GlobalFilters'; // Importar GlobalFilters

export const DashboardLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);
  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar toggleMobileSidebar={toggleMobileSidebar} isMobileSidebarOpen={isMobileSidebarOpen} />
      <div className="flex flex-1 pt-20"> {/* pt-20 para compensar la altura del navbar */}
        <Sidebar /> {/* Sidebar de escritorio */}
        
        {/* Sidebar móvil */}
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64 bg-card border-r border-border/50">
            <div className="flex items-center justify-between p-4 border-b border-border/50">
                <span className="text-xl font-bold text-brand-orange">Woorkify</span>
            </div>
            <SidebarNav onLinkClick={closeMobileSidebar} />
          </SheetContent>
        </Sheet>

        <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>{/* Espacio para el título de la página si es necesario aquí, o el PageHeader lo maneja */}</div>
              <GlobalFilters /> {/* Botón de Filtros Globales */}
            </div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
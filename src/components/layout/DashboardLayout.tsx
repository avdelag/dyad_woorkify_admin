"use client";
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      <Navbar />
      <div className="flex flex-1 pt-16"> {/* pt-16 to offset navbar height */}
        <Sidebar />
        <main className="flex-1 ml-64 p-6"> {/* ml-64 to offset sidebar width */}
          <Outlet /> {/* This is where nested route components will render */}
        </main>
      </div>
    </div>
  );
};
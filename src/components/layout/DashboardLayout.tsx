"use client";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated && pathname.startsWith("/dashboard")) {
      window.location.href = "/auth/login";
    }
  }, [isAuthenticated, pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 ml-0 md:ml-64 transition-all duration-300 ease-in-out">
          {children}
        </main>
      </div>
    </div>
  );
};
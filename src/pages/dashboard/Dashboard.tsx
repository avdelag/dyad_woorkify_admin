"use client";
import { useState } from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/dashboard/Card";
import { MessageList } from "@/components/dashboard/MessageList";
import { NotificationList } from "@/components/dashboard/NotificationList";
import { Button } from "@/components/ui/button";
import { Filter, MessageSquare, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DashboardPage() {
  const [timeFilter, setTimeFilter] = useState("week");

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Dashboard Overview" />
        <div className="flex gap-2">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filter" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card title="Total Vendors" value="28" change="+12%" />
        <Card title="Active Clients" value="156" change="+5%" />
        <Card title="Pending Orders" value="14" change="-3%" />
        <Card title="Revenue" value="$8,245" change="+8%" />
      </div>

      <div className="grid gap-4 mt-6 md:grid-cols-2">
        <MessageList />
        <NotificationList />
      </div>

      <Button className="fixed bottom-6 right-6 rounded-full w-14 h-14 p-0">
        <Plus className="h-6 w-6" />
      </Button>
    </DashboardLayout>
  );
}
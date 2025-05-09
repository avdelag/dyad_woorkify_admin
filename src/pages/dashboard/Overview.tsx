"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Briefcase, BarChart3, MessageSquare } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: React.ElementType, color: string }) => (
  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className={`h-5 w-5 ${color}`} />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-foreground">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">+20.1% from last month</p>
    </CardContent>
  </Card>
);

export default function DashboardOverview() {
  const adminName = "Admin"; // Placeholder

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Welcome back, {adminName}!</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with Woorkify today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value="1,234" icon={Users} color="text-brand-blue" />
        <StatCard title="Total Vendors" value="567" icon={Briefcase} color="text-brand-purple" />
        <StatCard title="Active Bookings" value="892" icon={BarChart3} color="text-brand-green" />
        <StatCard title="New Messages" value="42" icon={MessageSquare} color="text-brand-orange" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform updates and actions.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for activity feed */}
            <ul className="space-y-3">
              <li className="text-sm text-muted-foreground">New vendor "Crafty Corner" joined.</li>
              <li className="text-sm text-muted-foreground">User "John D." completed a booking.</li>
              <li className="text-sm text-muted-foreground">System maintenance scheduled for tonight.</li>
            </ul>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Access common admin tasks quickly.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for quick links */}
            <ul className="space-y-2">
              <li><a href="#" className="text-brand-orange hover:underline">Approve new vendors</a></li>
              <li><a href="#" className="text-brand-orange hover:underline">View pending support tickets</a></li>
              <li><a href="#" className="text-brand-orange hover:underline">Generate monthly report</a></li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Assuming shadcn/ui card

export default function DashboardOverview() {
  const adminName = "Admin User"; // Placeholder

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Welcome, {adminName}!</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Some overview statistics will go here.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Total Users: 120
            </p>
            <p className="text-sm text-muted-foreground">
              Total Vendors: 45
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Activity feed will be displayed here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
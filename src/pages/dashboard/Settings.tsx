"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardSettings() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Application Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Configuration options for the admin dashboard will be managed here.</p>
          <p className="mt-4">User roles, permissions, API keys, and other admin-level settings.</p>
        </CardContent>
      </Card>
    </div>
  );
}
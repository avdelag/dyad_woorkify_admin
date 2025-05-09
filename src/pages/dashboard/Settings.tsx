"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch'; // Asumiendo shadcn/ui switch
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { toast } from 'react-hot-toast';

export default function DashboardSettings() {
  const { theme, setTheme } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  const handleSaveChanges = () => {
    // Lógica para guardar configuraciones (simulada)
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Application Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="darkMode" className="font-medium">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Toggle between light and dark themes.</p>
            </div>
            <Switch
              id="darkMode"
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Manage how you receive notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="emailNotifications" className="font-medium">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive important updates via email.</p>
            </div>
            <Switch
              id="emailNotifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="smsNotifications" className="font-medium">SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">Get critical alerts via SMS (if configured).</p>
            </div>
            <Switch
              id="smsNotifications"
              checked={smsNotifications}
              onCheckedChange={setSmsNotifications}
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSaveChanges}>Save All Settings</Button>
      </div>
    </div>
  );
}
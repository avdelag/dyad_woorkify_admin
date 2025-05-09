"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const vendorsData = [
  { id: 'vnd_1', name: 'Global Goods Co.', contact: 'contact@globalgoods.com', status: 'Active', since: '2022-11-01' },
  { id: 'vnd_2', name: 'Local Artisans LLC', contact: 'support@localartisans.com', status: 'Pending Approval', since: '2023-05-05' },
  { id: 'vnd_3', name: 'Tech Solutions Inc.', contact: 'sales@techsolutions.com', status: 'Active', since: '2021-07-22' },
];

export default function DashboardVendors() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Vendors</h1>
      <Card>
        <CardHeader>
          <CardTitle>Vendor List</CardTitle>
          <CardDescription>A list of all registered vendors.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vendor Since</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendorsData.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">{vendor.name}</TableCell>
                  <TableCell>{vendor.contact}</TableCell>
                  <TableCell>
                    <span className={cn("px-2 py-1 text-xs rounded-full", 
                      vendor.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100' : 
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100'
                    )}>
                      {vendor.status}
                    </span>
                  </TableCell>
                  <TableCell>{vendor.since}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const usersData = [
  { id: 'usr_1', name: 'Alice Wonderland', email: 'alice@example.com', role: 'Customer', joined: '2023-01-15' },
  { id: 'usr_2', name: 'Bob The Builder', email: 'bob@example.com', role: 'Customer', joined: '2023-02-20' },
  { id: 'usr_3', name: 'Charlie Chaplin', email: 'charlie@example.com', role: 'Editor', joined: '2023-03-10' },
];

export default function DashboardUsers() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>A list of all registered users.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersData.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.joined}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
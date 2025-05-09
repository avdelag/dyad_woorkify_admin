"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable } from "@/components/dashboard/DataTable";

const clientsData = [
  { id: 1, name: "John Doe", email: "john@example.com", status: "Active", lastActive: "2 days ago" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", status: "Active", lastActive: "1 hour ago" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", status: "Inactive", lastActive: "1 month ago" },
];

const columns = [
  { header: "ID", accessor: "id" },
  { header: "Name", accessor: "name" },
  { header: "Email", accessor: "email" },
  { header: "Status", accessor: "status" },
  { header: "Last Active", accessor: "lastActive" },
];

export default function ClientsPage() {
  const handleAddClient = () => {
    console.log("Add new client");
  };

  return (
    <DashboardLayout>
      <PageHeader title="Clients" />
      <DataTable 
        columns={columns} 
        data={clientsData} 
        title="Client List"
        onAdd={handleAddClient}
      />
    </DashboardLayout>
  );
}
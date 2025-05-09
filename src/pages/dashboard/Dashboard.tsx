"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable } from "@/components/dashboard/DataTable";

const sampleData = [
  { id: 1, name: "Total Clients", value: "1,234", change: "+12%" },
  { id: 2, name: "Active Vendors", value: "567", change: "+5%" },
  { id: 3, name: "Pending Orders", value: "89", change: "-3%" },
  { id: 4, name: "Completed Bookings", value: "1,023", change: "+8%" },
];

const columns = [
  { header: "Metric", accessor: "name" },
  { header: "Value", accessor: "value" },
  { header: "Change", accessor: "change" },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <PageHeader title="Dashboard Overview" />
      <DataTable columns={columns} data={sampleData} title="Key Metrics" />
    </DashboardLayout>
  );
}
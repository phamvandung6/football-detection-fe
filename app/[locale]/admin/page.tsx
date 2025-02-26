import AdminLayout from "@/components/admin/AdminLayout";
import { Metadata } from "next";
import { generateMetadata } from "@/app/[locale]/metadata";

// Metadata cho trang admin
export const metadata: Metadata = generateMetadata({
  title: "Admin Dashboard - Football Detection",
  description: "Manage users, videos, and system settings.",
  path: "/admin",
});

export default function AdminDashboardPage() {
  return <AdminLayout />;
}

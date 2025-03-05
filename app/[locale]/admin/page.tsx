import { generateMetadata } from "@/app/[locale]/metadata";
import AdminTabs from "@/components/admin/AdminTabs";
import { Metadata } from "next";

// Metadata cho trang admin
export const metadata: Metadata = generateMetadata({
  title: "Admin Dashboard - Football Detection",
  description: "Manage users, videos, and system settings.",
  path: "/admin",
});

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Bảng điều khiển quản trị</h1>
      <AdminTabs />
    </div>
  );
}

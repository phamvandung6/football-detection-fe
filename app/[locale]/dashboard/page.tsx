import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Metadata } from "next";
import { generateMetadata } from "@/app/[locale]/metadata";

// Metadata cho trang dashboard
export const metadata: Metadata = generateMetadata({
  title: "Dashboard - Football Detection",
  description: "Manage and analyze your football videos with AI detection.",
  path: "/dashboard",
});

export default function DashboardPage() {
  return <DashboardLayout />;
}

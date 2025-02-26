"use client";

import { useTranslations } from "next-intl";
import { AdminStatsCards } from "./AdminStatsCards";
import { AdminUserManagement } from "./AdminUserManagement";
import { AdminVideoManagement } from "./AdminVideoManagement";

export default function AdminLayout() {
  const t = useTranslations();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("admin.title")}
        </h1>
      </div>

      {/* Stats Cards */}
      <AdminStatsCards />

      {/* Management Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        <AdminUserManagement />
        <AdminVideoManagement />
      </div>
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminUserManagement() {
  const t = useTranslations();

  const userStats = [
    {
      title: t("admin.userManagement.activeUsers"),
      value: "0",
    },
    {
      title: t("admin.userManagement.bannedUsers"),
      value: "0",
    },
    {
      title: t("admin.userManagement.admins"),
      value: "0",
    },
    {
      title: t("admin.userManagement.totalUsers"),
      value: "0",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{t("admin.userManagement.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {userStats.map((stat, index) => (
            <div key={index} className="rounded-lg border bg-card p-4">
              <h3 className="text-sm font-medium">{stat.title}</h3>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

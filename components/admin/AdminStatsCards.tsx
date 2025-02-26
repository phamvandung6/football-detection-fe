"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { UsersIcon, VideoIcon, ActivityIcon, FileTextIcon } from "lucide-react";

export function AdminStatsCards() {
  const t = useTranslations();

  const statsCards = [
    {
      title: t("admin.users"),
      value: `0 ${t("admin.userManagement.totalUsers").toLowerCase()}`,
      icon: <UsersIcon className="h-6 w-6" />,
    },
    {
      title: t("admin.videos"),
      value: `0 ${t("admin.videoManagement.totalVideos").toLowerCase()}`,
      icon: <VideoIcon className="h-6 w-6" />,
    },
    {
      title: t("admin.model"),
      value: t("admin.modelManagement.currentModel"),
      icon: <ActivityIcon className="h-6 w-6" />,
    },
    {
      title: t("admin.system"),
      value: t("admin.systemMonitoring.logs"),
      icon: <FileTextIcon className="h-6 w-6" />,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((card, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="inline-block rounded-lg bg-muted p-3">
                {card.icon}
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium leading-none">
                  {card.title}
                </h3>
                <p className="text-xs text-muted-foreground">{card.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

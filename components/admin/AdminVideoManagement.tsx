"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminVideoManagement() {
  const t = useTranslations();

  const videoStats = [
    {
      title: t("admin.videoManagement.processingVideos"),
      value: "0",
    },
    {
      title: t("admin.videoManagement.completedVideos"),
      value: "0",
    },
    {
      title: t("admin.videoManagement.failedVideos"),
      value: "0",
    },
    {
      title: t("admin.videoManagement.totalVideos"),
      value: "0",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{t("admin.videoManagement.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {videoStats.map((stat, index) => (
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

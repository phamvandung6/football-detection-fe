"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  const t = useTranslations();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("admin.title")}
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <div className="inline-block rounded-lg bg-muted p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium leading-none">
                  {t("admin.users")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  0 {t("admin.userManagement.totalUsers").toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <div className="inline-block rounded-lg bg-muted p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="m22 8-6 4 6 4V8Z" />
                  <rect x="2" y="6" width="14" height="12" rx="2" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium leading-none">
                  {t("admin.videos")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  0 {t("admin.videoManagement.totalVideos").toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <div className="inline-block rounded-lg bg-muted p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M10.2 5.9A9 9 0 0 0 3.8 18.4l-1.5-1.5" />
                  <path d="M21.8 7.4a9 9 0 0 1-2.2 10.9" />
                  <path d="m2.3 12 .7 2.3" />
                  <path d="M21.7 12 21 14.3" />
                  <path d="m19.8 7.4-.7-2.3-2.3-.7" />
                  <path d="m4.2 18.4 2.3.7.7 2.3" />
                  <path d="M12 2v4" />
                  <path d="M12 18v4" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium leading-none">
                  {t("admin.model")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t("admin.modelManagement.currentModel")}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <div className="inline-block rounded-lg bg-muted p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M10 3v4a1 1 0 0 0 1 1h4" />
                  <path d="M15 3H9a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7Z" />
                  <path d="M10 12h4" />
                  <path d="M10 16h4" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium leading-none">
                  {t("admin.system")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t("admin.systemMonitoring.logs")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold">
              {t("admin.userManagement.title")}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-lg border bg-card p-4">
                <h3 className="text-sm font-medium">
                  {t("admin.userManagement.activeUsers")}
                </h3>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <h3 className="text-sm font-medium">
                  {t("admin.userManagement.bannedUsers")}
                </h3>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <h3 className="text-sm font-medium">
                  {t("admin.userManagement.admins")}
                </h3>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <h3 className="text-sm font-medium">
                  {t("admin.userManagement.totalUsers")}
                </h3>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold">
              {t("admin.videoManagement.title")}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-lg border bg-card p-4">
                <h3 className="text-sm font-medium">
                  {t("admin.videoManagement.processingVideos")}
                </h3>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <h3 className="text-sm font-medium">
                  {t("admin.videoManagement.completedVideos")}
                </h3>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <h3 className="text-sm font-medium">
                  {t("admin.videoManagement.failedVideos")}
                </h3>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <h3 className="text-sm font-medium">
                  {t("admin.videoManagement.totalVideos")}
                </h3>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

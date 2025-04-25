"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthSession } from "@/lib/auth/useAuthSession";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const t = useTranslations();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthSession();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="space-y-6">
          <Skeleton className="h-9 w-1/4 mb-6" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-64 w-full rounded-lg col-span-full" />
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const isAdmin = user.roles?.includes("admin");

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">{t("dashboard.title")}</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>{t("dashboard.welcome")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {t("auth.name")}
                </p>
                <p className="font-medium">{user.name}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {t("auth.username")}
                </p>
                <p className="font-medium">{user.username}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {t("auth.email")}
                </p>
                <p className="font-medium">{user.email}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {t("dashboard.roles")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {user.roles?.map((role, index) => (
                    <Badge
                      key={index}
                      variant={role === "admin" ? "destructive" : "secondary"}
                    >
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("videos.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {t("dashboard.videoStats")}
            </p>
            <Button className="w-full" onClick={() => router.push("/videos")}>
              {t("dashboard.viewVideos")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("upload.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {t("dashboard.uploadPrompt")}
            </p>
            <Button className="w-full" onClick={() => router.push("/upload")}>
              {t("dashboard.uploadVideo")}
            </Button>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t("dashboard.adminAccess")}
              </p>
              <Button
                className="w-full"
                variant="destructive"
                onClick={() => router.push("/admin")}
              >
                {t("dashboard.adminPanel")}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

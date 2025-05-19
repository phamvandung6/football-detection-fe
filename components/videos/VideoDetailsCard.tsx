"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatBytes } from "@/lib/utils";
import { Video } from "@/types/video";
import { formatDistanceToNow } from "date-fns";
import { enUS, vi } from "date-fns/locale";
import { Calendar, Clock, Download, FileVideo, Loader2, Tag, User } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

// Helper component for displaying details (giữ lại từ page.tsx)
interface DetailItemProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
  truncate?: boolean;
}
function DetailItem({
  label,
  value,
  icon: Icon,
  truncate = false,
}: DetailItemProps) {
  return (
    <div>
      <p className="font-medium text-sm mb-0.5">{label}</p>
      <div
        className={`flex items-center text-muted-foreground text-sm ${
          truncate ? "truncate" : ""
        }`}
      >
        {Icon && <Icon className="h-4 w-4 mr-1.5 flex-shrink-0" />}
        <span className={truncate ? "truncate" : ""}>{value}</span>
      </div>
    </div>
  );
}

interface VideoDetailsCardProps {
  video: Video | null; // Nhận video object (có thể null ban đầu)
  locale: string;
  isDownloading: boolean;
  onDownloadClick: (processed: boolean) => void;
}

export function VideoDetailsCard({
  video,
  locale,
  isDownloading,
  onDownloadClick,
}: VideoDetailsCardProps) {
  const t = useTranslations();
  const dateLocale = locale === "vi" ? vi : enUS;

  if (!video) {
    // Có thể hiển thị skeleton hoặc null nếu component cha xử lý loading
    return null;
  }

  // Helper để format duration từ number (giây) sang MM:SS hoặc HH:MM:SS
  const formatDuration = (totalSeconds: number) => {
    if (isNaN(totalSeconds) || totalSeconds < 0) {
      return t("common.unknownDuration");
    }
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const paddedMinutes = String(minutes).padStart(2, "0");
    const paddedSeconds = String(seconds).padStart(2, "0");

    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${paddedMinutes}:${paddedSeconds}`;
    }
    return `${paddedMinutes}:${paddedSeconds}`;
  };

  return (
    <div className="space-y-6">
      {/* Card thông tin chi tiết */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2 mb-4">
            {t("videoDetails.detailsTitle")}
          </h2>

          <div className="text-sm space-y-3">
            <DetailItem
              label={t("videoDetails.description")}
              value={video.description || t("videoDetails.noDescription")}
            />
            <DetailItem
              label={t("videoDetails.uploader")}
              icon={User}
              value={video.username || t("common.unknownUser")}
            />
            <DetailItem
              label={t("videoDetails.uploadDate")}
              icon={Calendar}
              value={
                video.createdAt
                  ? formatDistanceToNow(new Date(video.createdAt), {
                      addSuffix: true,
                      locale: dateLocale,
                    })
                  : t("common.unknownDate")
              }
            />
            {video.duration !== undefined && video.duration > 0 && (
              <DetailItem
                label={t("videoDetails.duration")}
                icon={Clock}
                value={formatDuration(video.duration)}
              />
            )}
            {video.fileSize !== undefined && (
              <DetailItem
                label={t("videoDetails.fileSize")}
                icon={FileVideo}
                value={formatBytes(video.fileSize)}
              />
            )}
            <DetailItem
                label={t("videoDetails.videoType")}
                icon={Tag}
                value={video.videoType || t("common.unknown")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Card Download */}
      {video.isDownloadable && (video.status === "READY" || video.status === "COMPLETED") && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            <h3 className="text-md font-semibold border-b pb-2 mb-4">
              {t("video.download.title")}
            </h3>
            {video.videoType === "UPLOADED" && video.filePath && (
              <Button
                variant="outline"
                className="w-full justify-center"
                onClick={() => onDownloadClick(false)}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {t("video.download.original")}
              </Button>
            )}
            {video.videoType === "UPLOADED" && video.processedPath && (
              <Button
                variant="default"
                className="w-full justify-center"
                onClick={() => onDownloadClick(true)}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {t("video.download.processed")}
              </Button>
            )}
            {video.videoType === "YOUTUBE" && (
              <p className="text-sm text-muted-foreground text-center">
                {t("video.download.youtubeNotDownloadable")}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

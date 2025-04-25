"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatBytes } from "@/lib/utils";
import { Video } from "@/types/video";
import { formatDistanceToNow } from "date-fns";
import { enUS, vi } from "date-fns/locale";
import { Calendar, Clock, Download, FileVideo, Loader2 } from "lucide-react";
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

  return (
    <div className="space-y-6">
      {/* Card thông tin chi tiết */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2 mb-4">
            {t("videoDetails.details")}
          </h2>

          <div className="text-sm space-y-3">
            <DetailItem
              label={t("videoDetails.description")}
              value={video.description || t("videoDetails.noDescription")}
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
            {video.video_metadata?.duration && (
              <DetailItem
                label={t("videoDetails.duration")}
                icon={Clock}
                value={video.video_metadata.duration}
              />
            )}
            {video.original_filename && (
              <DetailItem
                label={t("videoDetails.originalFilename")}
                icon={FileVideo}
                value={video.original_filename}
                truncate
              />
            )}
            {video.file_size !== undefined && (
              <DetailItem
                label={t("videoDetails.fileSize")}
                value={formatBytes(video.file_size)}
              />
            )}
            {video.video_metadata?.width && video.video_metadata?.height && (
              <DetailItem
                label={t("videoDetails.resolution")}
                value={`${video.video_metadata.width} x ${video.video_metadata.height}`}
              />
            )}
            {/* Thêm các chi tiết khác nếu cần */}
          </div>
        </CardContent>
      </Card>

      {/* Card Download */}
      {(video.status === "READY" || video.originalVideoUrl) && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            <h3 className="text-md font-semibold border-b pb-2 mb-4">
              {t("video.download.title")}
            </h3>
            {/* Original Video Download Button */}
            {(video.originalVideoUrl || video.status === "READY") && (
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
            {/* Processed Video Download Button */}
            {video.status === "READY" && (
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}

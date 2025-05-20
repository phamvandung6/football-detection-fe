"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useVideoProcessing } from "@/lib/hooks/useVideoProcessing";
import { formatBytes } from "@/lib/utils";
import { Video } from "@/types/video";
import { formatDistanceToNow } from "date-fns";
import { enUS, vi } from "date-fns/locale";
import {
  Calendar,
  Clock,
  Download,
  FileVideo,
  Info,
  Loader2,
  RefreshCw,
  Tag,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

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

// Component hiển thị debug info nếu cần
function VideoProcessingDebugInfo({ videoId }: { videoId: string }) {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  // Lấy trạng thái từ store để so sánh
  const { progress, status, isProcessing, isCompleted, markVideoAsCompleted } =
    useVideoProcessing(videoId);

  const fetchDebugInfo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/proxy/videos/${videoId}/processing-status?_=${Date.now()}`,
        {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      setDebugInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDebug((prev) => !prev)}
        >
          <Info className="h-4 w-4 mr-1" />
          {showDebug ? "Ẩn thông tin debug" : "Hiển thị thông tin debug"}
        </Button>

        {showDebug && (
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchDebugInfo}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Kiểm tra API
          </Button>
        )}
      </div>

      {showDebug && (
        <div className="space-y-3">
          {/* Thông tin từ Store */}
          <div className="bg-muted/50 p-3 rounded text-xs">
            <p className="font-semibold mb-1">
              Store state (useVideoProcessing):
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                Status: <span className="font-mono">{status || "N/A"}</span>
              </div>
              <div>
                Progress: <span className="font-mono">{progress || 0}%</span>
              </div>
              <div>
                isProcessing:{" "}
                <span className="font-mono">{String(isProcessing)}</span>
              </div>
              <div>
                isCompleted:{" "}
                <span className="font-mono">{String(isCompleted)}</span>
              </div>
            </div>
          </div>

          {/* Thông tin từ API */}
          <div className="bg-muted p-3 rounded text-xs font-mono overflow-auto max-h-[200px]">
            <p className="font-semibold mb-1">API response:</p>
            {error ? (
              <div className="text-destructive">{error}</div>
            ) : debugInfo ? (
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            ) : isLoading ? (
              <div>Đang tải dữ liệu...</div>
            ) : (
              <div>
                Nhấn "Kiểm tra API" để xem dữ liệu trạng thái xử lý từ server
              </div>
            )}
          </div>

          {/* Hướng dẫn khắc phục */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3 rounded text-xs">
            <p className="font-semibold mb-1">Khắc phục vấn đề:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                Nếu thông tin Store và API không khớp, hãy thử cập nhật lại.
              </li>
              <li>
                Nếu API hiển thị "COMPLETED" nhưng Store vẫn hiển thị
                "PROCESSING", click nút dưới để đồng bộ:
              </li>
            </ul>
            <div className="mt-2">
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => {
                  // Kiểm tra nếu API trả về COMPLETED thì cập nhật store
                  if (debugInfo?.data?.status === "COMPLETED") {
                    // Sử dụng hàm markVideoAsCompleted để cập nhật store
                    markVideoAsCompleted(videoId);

                    toast.success("Đã cập nhật trạng thái video thành công", {
                      description:
                        "Trạng thái video đã được đồng bộ với server",
                    });

                    // Hiển thị phần tải xuống (optional, có thể bỏ nếu UI tự cập nhật)
                    const downloadCard = document.querySelector(
                      ".space-y-6 > div:last-child"
                    );
                    if (
                      downloadCard &&
                      downloadCard.classList.contains("hidden")
                    ) {
                      downloadCard.classList.remove("hidden");
                    }
                  } else {
                    toast.error("Không thể cập nhật trạng thái video", {
                      description: "Video chưa xử lý xong hoặc đã xảy ra lỗi",
                    });
                  }
                }}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Đồng bộ trạng thái video
              </Button>
            </div>
          </div>
        </div>
      )}
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

  // Sử dụng hook useVideoProcessing để theo dõi trạng thái
  const shouldPoll =
    video?.status === "PROCESSING" || video?.status === "PENDING";

  const {
    status: processingStatus,
    progress: processingProgress,
    isProcessing,
    isCompleted,
    addVideo,
    markVideoAsCompleted,
  } = useVideoProcessing(video?.id);

  // Thêm side effect để xử lý trạng thái đặc biệt
  useEffect(() => {
    if (!video?.id) return;

    // Trường hợp 1: Thêm video đang xử lý vào store nếu chưa có
    if (shouldPoll && !isProcessing && !isCompleted) {
      console.log(`Adding video ${video.id} to processing store`);
      addVideo(video.id, video.title);
    }
    // Trường hợp 2: Video đã hoàn thành nhưng chưa được cập nhật trong store
    else if (video.status === "COMPLETED" && !isCompleted) {
      console.log(`Video ${video.id} completed, syncing with store`);
      // Sử dụng store để cập nhật trạng thái video
      markVideoAsCompleted(video.id);

      console.log(
        `Successfully marked video ${video.id} as COMPLETED in store`
      );
    }
  }, [
    video?.id,
    video?.status,
    video?.title,
    shouldPoll,
    isProcessing,
    isCompleted,
    addVideo,
    markVideoAsCompleted,
  ]);

  // Cập nhật status của video khi có kết quả mới từ store
  const currentStatus = processingStatus || video?.status;

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
      return `${String(hours).padStart(
        2,
        "0"
      )}:${paddedMinutes}:${paddedSeconds}`;
    }
    return `${paddedMinutes}:${paddedSeconds}`;
  };

  // Helper function để hiển thị trạng thái video
  const renderVideoStatus = () => {
    switch (currentStatus) {
      case "PENDING":
        return (
          <div
            className="text-amber-500 flex items-center"
            id="video-status-indicator"
          >
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {t("videoDetails.statusPending")}
          </div>
        );
      case "PROCESSING":
        return (
          <div className="space-y-2">
            <div
              className="text-blue-500 flex items-center"
              id="video-status-indicator"
            >
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("videoDetails.statusProcessing")}
            </div>
            <Progress value={processingProgress} className="h-2 w-full" />
            <p className="text-xs text-muted-foreground text-right">
              {processingProgress}%
            </p>
          </div>
        );
      case "COMPLETED":
        return (
          <div className="text-green-500" id="video-status-indicator">
            {t("videoDetails.statusCompleted")}
          </div>
        );
      case "ERROR":
        return (
          <div className="text-red-500" id="video-status-indicator">
            {t("videoDetails.statusFailed")}
          </div>
        );
      default:
        return (
          <div className="text-muted-foreground" id="video-status-indicator">
            {t("common.unknown")}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Card thông tin chi tiết */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2 mb-4">
            {t("videos.title")}
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
              label={t("videos.type")}
              icon={Tag}
              value={video.videoType || t("common.unknown")}
            />
            {/* Hiển thị trạng thái xử lý video */}
            <div>
              <p className="font-medium text-sm mb-0.5">
                {t("videoStatus.title")}
              </p>
              {renderVideoStatus()}

              {/* Thêm component debug info cho video đang xử lý */}
              {(currentStatus === "PROCESSING" ||
                currentStatus === "PENDING") &&
                video.id && <VideoProcessingDebugInfo videoId={video.id} />}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card Download */}
      {video.isDownloadable && currentStatus === "COMPLETED" && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            <h3 className="text-md font-semibold border-b pb-2 mb-4">
              {t("videoDetails.download")}
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
                {t("videoDetails.downloadOriginal")}
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
                {t("dashboard.processedVideo")}
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

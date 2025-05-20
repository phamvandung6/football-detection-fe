"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoDetailsCard } from "@/components/videos/VideoDetailsCard";
import { VideoPlayer } from "@/components/videos/VideoPlayer";
import {
  getVideoDownloadUrl,
  getVideoStreamUrl,
  refreshVideoStreamUrl,
} from "@/lib/api/videoService";
import { useAuthSession } from "@/lib/auth/useAuthSession";
import { useVideo } from "@/lib/hooks/useVideoQueries";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface VideoPageProps {
  params: {
    locale: string;
    id: string;
  };
}

export default function VideoPage({ params }: VideoPageProps) {
  const params2 = useParams();
  const id =
    typeof params2.id === "string" ? params2.id : (params2.id as string[])[0];
  const locale =
    typeof params2.locale === "string"
      ? params2.locale
      : (params2.locale as string[])[0];
  const t = useTranslations();
  const router = useRouter();
  const { session } = useAuthSession();

  const [isDownloading, setIsDownloading] = useState(false);
  const [streamInfo, setStreamInfo] = useState<{
    url: string;
    expiresAt: string;
    title?: string;
  } | null>(null);
  const [isLoadingStream, setIsLoadingStream] = useState(false);

  const {
    data: video,
    isLoading,
    error: fetchError,
    refetch: refetchVideo,
  } = useVideo(id);

  // Fetch stream URL khi có video và trạng thái là READY hoặc COMPLETED
  useEffect(() => {
    const fetchStreamUrl = async () => {
      if (!video) return;

      // Kiểm tra cả READY và COMPLETED
      if (video.status !== "COMPLETED") return;

      try {
        setIsLoadingStream(true);
        const streamData = await getVideoStreamUrl(video.id);
        if (streamData) {
          setStreamInfo({
            url: streamData.url,
            expiresAt: streamData.expiresAt,
            title: streamData.title,
          });
        }
      } catch (error) {
        console.error("Error fetching stream URL:", error);
        toast.error(t("videoDetails.streamError"));
      } finally {
        setIsLoadingStream(false);
      }
    };

    fetchStreamUrl();
  }, [video, t]);

  // Refresh URL khi cần thiết (ví dụ: khi người dùng click nút refresh)
  const handleRefreshStreamUrl = async () => {
    if (!video) return;

    try {
      setIsLoadingStream(true);
      const refreshedData = await refreshVideoStreamUrl(video.id);
      if (refreshedData) {
        setStreamInfo((prev) => ({
          ...prev!,
          url: refreshedData.url,
          expiresAt: refreshedData.expiresAt,
        }));
        toast.success(t("videoDetails.streamRefreshed"));
      }
    } catch (error) {
      console.error("Error refreshing stream URL:", error);
      toast.error(t("videoDetails.streamRefreshError"));
    } finally {
      setIsLoadingStream(false);
    }
  };

  useEffect(() => {
    if (fetchError) {
      toast.error(fetchError.message || t("videoDetails.fetchError"));
    }
  }, [fetchError, t, router, locale]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="w-full aspect-video rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
          <div className="lg:col-span-1 space-y-4">
            <Skeleton className="h-72 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <XCircle className="h-16 w-16 text-destructive mb-4" />
            <h1 className="text-2xl font-bold mb-4">
              {t("videoDetails.notFound")}
            </h1>
            <p className="text-muted-foreground mb-6">
              {t("videoDetails.notFoundDescription")}
            </p>
            <Button onClick={() => router.push(`/${locale}/upload`)}>
              {t("common.backToUpload")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderStatusInfo = () => {
    switch (video.status) {
      case "PENDING":
        return (
          <div className="flex items-center p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-6">
            <Loader2 className="h-5 w-5 mr-3 text-yellow-600 animate-spin" />
            <span className="text-yellow-800 dark:text-yellow-300 font-medium">
              {t("videoDetails.status.pending")}
            </span>
          </div>
        );
      case "PROCESSING":
        const progress = (video as any).progress || 0;
        return (
          <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg mb-6">
            <Loader2 className="h-5 w-5 mr-3 text-blue-600 animate-spin" />
            <span className="text-blue-800 dark:text-blue-300 font-medium">
              {t("videoDetails.status.processing")}
            </span>
          </div>
        );
      case "COMPLETED":
        return (
          <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg mb-6">
            <CheckCircle className="h-5 w-5 mr-3 text-green-600" />
            <span className="text-green-800 dark:text-green-300 font-medium">
              {t("videoDetails.status.completed")}
            </span>
          </div>
        );
      case "ERROR":
        return (
          <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg mb-6">
            <XCircle className="h-5 w-5 mr-3 text-red-600" />
            <span className="text-red-800 dark:text-red-300 font-medium">
              {t("videoDetails.status.failed")}:
              <span className="ml-1 italic">
                {video.error_message || t("common.unknownError")}
              </span>
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  const handleDownload = async (processed: boolean) => {
    if (isDownloading) return;

    setIsDownloading(true);
    const toastId = toast.loading(t("video.download.downloading"));

    try {
      console.log("Đang lấy URL download...");
      const downloadUrl = await getVideoDownloadUrl(video.id, processed);
      console.log("Nhận được URL download:", downloadUrl);

      if (
        !downloadUrl ||
        typeof downloadUrl !== "string" ||
        !downloadUrl.startsWith("http")
      ) {
        throw new Error("URL tải xuống không hợp lệ");
      }

      // Mở URL trong iframe ẩn để tải xuống mà không bị chặn bởi CORS
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = downloadUrl;
      document.body.appendChild(iframe);

      // Thiết lập timeout để xóa iframe sau khi đã bắt đầu tải xuống
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 5000);

      toast.success(t("video.download.success"), { id: toastId });
    } catch (error) {
      console.error("Download error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : t("video.download.downloadError"),
        { id: toastId }
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
            <h1 className="text-2xl md:text-3xl font-bold break-words">
              {video.title || t("videoDetails.untitled")}
            </h1>
          </div>

          {renderStatusInfo()}

          <Card>
            <CardContent className="p-0 aspect-video bg-black rounded-lg overflow-hidden">
              {video.status === "COMPLETED" && streamInfo ? (
                <VideoPlayer
                  videoUrl={streamInfo.url}
                  title={video.title || "Video"}
                  onRefreshStream={
                    video.status === "COMPLETED"
                      ? handleRefreshStreamUrl
                      : undefined
                  }
                  isLoadingStream={isLoadingStream}
                />
              ) : video.status === "PROCESSING" ||
                video.status === "PENDING" ? (
                <div className="w-full aspect-video flex flex-col items-center justify-center bg-muted/50">
                  <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                  <p className="text-muted-foreground">
                    {video.status === "PENDING"
                      ? t("videoStatus.pendingDescription")
                      : t("videoStatus.processingShort")}
                  </p>
                  {video.status === "PROCESSING" &&
                    video.progress !== undefined && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("videoStatus.progress", {
                          progress: video.progress.toFixed(0),
                        })}
                      </p>
                    )}
                </div>
              ) : (
                <div className="w-full aspect-video flex flex-col items-center justify-center bg-destructive/10">
                  <XCircle className="h-12 w-12 text-destructive mb-4" />
                  <p className="text-destructive-foreground">
                    {t("videoDetails.streamNotAvailable")}
                  </p>
                  {video.status === "ERROR" && video.error_message && (
                    <p className="text-xs text-destructive-foreground/80 mt-1">
                      {video.error_message}
                    </p>
                  )}
                  {video.status === "COMPLETED" &&
                    !streamInfo &&
                    !isLoadingStream && (
                      <Button
                        onClick={handleRefreshStreamUrl}
                        variant="ghost"
                        size="sm"
                        className="mt-4"
                      >
                        {t("videoDetails.retryStream")}
                      </Button>
                    )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <VideoDetailsCard
            video={video}
            locale={locale}
            isDownloading={isDownloading}
            onDownloadClick={handleDownload}
          />
        </div>
      </div>
    </div>
  );
}

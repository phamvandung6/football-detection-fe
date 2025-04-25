"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DetectionResults } from "@/components/videos/DetectionResults";
import { VideoDetailsCard } from "@/components/videos/VideoDetailsCard";
import { VideoPlayer } from "@/components/videos/VideoPlayer";
import { getVideoDownloadUrl } from "@/lib/api/videoService";
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
  const { locale, id } = useParams();
  const t = useTranslations();
  const router = useRouter();
  const { session } = useAuthSession();

  const [isDownloading, setIsDownloading] = useState(false);

  const {
    data: video,
    isLoading,
    error: fetchError,
    refetch: refetchVideo,
  } = useVideo(id);

  const token = session.isAuthenticated ? "DUMMY_TOKEN" : null;

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
              {t("videoStatus.pendingDescription")}
            </span>
          </div>
        );
      case "PROCESSING":
        const progress = (video as any).progress || 0;
        return (
          <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg mb-6">
            <Loader2 className="h-5 w-5 mr-3 text-blue-600 animate-spin" />
            <span className="text-blue-800 dark:text-blue-300 font-medium">
              {t("videoStatus.processingDescription", { progress })}
            </span>
          </div>
        );
      case "READY":
        return (
          <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg mb-6">
            <CheckCircle className="h-5 w-5 mr-3 text-green-600" />
            <span className="text-green-800 dark:text-green-300 font-medium">
              {t("videoStatus.completedDescription")}
            </span>
          </div>
        );
      case "FAILED":
        return (
          <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg mb-6">
            <XCircle className="h-5 w-5 mr-3 text-red-600" />
            <span className="text-red-800 dark:text-red-300 font-medium">
              {t("videoStatus.failedDescription")}:
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
      const downloadUrl = getVideoDownloadUrl(video.id, processed);

      const response = await fetch(downloadUrl, { cache: "no-store" });

      if (!response.ok) {
        throw new Error(
          `Download failed: ${response.statusText || response.status}`
        );
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = processed
        ? video.processed_filename ||
          `processed_${video.original_filename || video.id}`
        : video.original_filename || video.id;
      document.body.appendChild(a);
      a.click();
      toast.success(t("video.download.downloadSuccess"), { id: toastId });
      window.URL.revokeObjectURL(url);
      a.remove();
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
            <h1 className="text-2xl md:text-3xl font-bold break-words mr-4">
              {video.title}
            </h1>
          </div>

          {renderStatusInfo()}

          <Card>
            <CardContent className="p-0 aspect-video bg-black rounded-lg overflow-hidden">
              {video.status === "READY" && video.streamUrls ? (
                <VideoPlayer
                  hlsUrl={video.streamUrls.hls}
                  dashUrl={video.streamUrls.dash}
                  thumbnailUrl={video.thumbnailUrl}
                />
              ) : video.status === "PENDING" ||
                video.status === "PROCESSING" ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                  <Loader2 className="h-12 w-12 animate-spin mb-4 text-blue-500" />
                  <p className="font-medium text-lg">
                    {t("videoStatus.processing")}
                  </p>
                  <p className="text-sm mt-1">
                    {t("videoDetails.processingInfo")}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-destructive p-8 text-center">
                  <XCircle className="h-12 w-12 mb-4" />
                  <p className="font-medium text-lg">
                    {t("videoStatus.failed")}
                  </p>
                  <p className="text-sm mt-1">
                    {video.error_message || t("common.unknownError")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {video.status === "READY" &&
            (video.detections && video.detections.length > 0 ? (
              <DetectionResults detections={video.detections} />
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  {t("videoDetails.noDetections")}
                </CardContent>
              </Card>
            ))}
        </div>

        <div className="lg:col-span-1">
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

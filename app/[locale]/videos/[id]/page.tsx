"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { VideoPlayer } from "@/components/videos/VideoPlayer";
import { DetectionResults } from "@/components/videos/DetectionResults";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  getVideoById,
  getVideoStreamUrls,
  Video,
  VideoStreamUrls,
  getVideoDownloadUrl,
  getVideoDetections,
} from "@/lib/api/videoService";
import { formatDistanceToNow } from "date-fns";
import { enUS, vi } from "date-fns/locale";
import { formatBytes } from "@/lib/utils";
import {
  Download,
  FileVideo,
  Clock,
  Calendar,
  Info,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

interface VideoPageProps {
  params: {
    locale: string;
    id: string;
  };
}

interface Detection {
  id: string;
  objectType: string;
  confidence: number;
  timestamp: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  frameNumber: number;
}

export default function VideoPage({ params }: VideoPageProps) {
  const { locale, id } = useParams();
  const t = useTranslations();
  const router = useRouter();
  const { token } = useAuth();

  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [streamUrls, setStreamUrls] = useState<VideoStreamUrls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isLoadingDetections, setIsLoadingDetections] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        const videoData = await getVideoById(id as string, token);
        setVideo(videoData);

        // Lấy URL stream video
        const urls = await getVideoStreamUrls(id as string, token);
        setStreamUrls(urls);

        // Nếu video đã xử lý xong, lấy kết quả phát hiện
        if (videoData.status === "completed") {
          setIsLoadingDetections(true);
          try {
            const detectionsData = await getVideoDetections(
              id as string,
              token
            );
            setDetections(detectionsData);
          } catch (detectionErr) {
            console.error("Error fetching detections:", detectionErr);
            toast.error(t("videoDetails.detectionsError"));
          } finally {
            setIsLoadingDetections(false);
          }
        }
      } catch (err) {
        console.error("Error fetching video:", err);
        setError(t("videoDetails.notFound"));
        toast.error(t("videoDetails.notFound"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideo();
  }, [id, token, t]);

  // Xác định locale cho date-fns
  const dateLocale = (locale as string) === "vi" ? vi : enUS;

  // Hiển thị loading state
  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8">
          <Skeleton className="w-full aspect-video rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Hiển thị lỗi
  if (error || !video) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h1 className="text-2xl font-bold mb-4">
              {t("videoDetails.notFound")}
            </h1>
            <p className="text-muted-foreground mb-6">
              {t("videoDetails.notFoundDescription")}
            </p>
            <Button onClick={() => router.push(`/${locale}/upload`)}>
              {t("common.backToVideos")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Hiển thị trạng thái video
  const renderStatusBadge = () => {
    switch (video.status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
          >
            {t("videoStatus.pending")}
          </Badge>
        );
      case "processing":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
          >
            {t("videoStatus.processing")}
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
          >
            {t("videoStatus.completed")}
          </Badge>
        );
      case "failed":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
          >
            {t("videoStatus.failed")}
          </Badge>
        );
      default:
        return null;
    }
  };

  // Xử lý tải xuống video
  const handleDownload = async (processed: boolean) => {
    if (!token) {
      toast.error(t("common.error"));
      return;
    }

    try {
      // Hiển thị thông báo đang tải xuống
      toast.loading(t("video.download.downloading"));

      // Sử dụng URL không có token
      const downloadUrl = getVideoDownloadUrl(video.id, processed);

      // Sử dụng fetch với header Authorization
      const response = await fetch(downloadUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`);
      }

      // Lấy blob từ response
      const blob = await response.blob();

      // Tạo URL cho blob
      const url = window.URL.createObjectURL(blob);

      // Tạo link tải xuống
      const a = document.createElement("a");
      a.href = url;
      a.download = processed
        ? `processed_${video.original_filename}`
        : video.original_filename;
      document.body.appendChild(a);
      a.click();

      // Dọn dẹp
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Hiển thị thông báo thành công
      toast.success(t("video.download.success"));
    } catch (error) {
      console.error("Download error:", error);
      toast.error(t("video.download.error"));
    }
  };

  // Xác định URL video để phát
  const videoToPlay =
    video.status === "completed" && streamUrls?.processed_url
      ? streamUrls.processed_url
      : streamUrls?.original_url || "";

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 gap-8">
        {/* Video Player */}
        <div className="w-full rounded-lg overflow-hidden">
          {streamUrls && (
            <VideoPlayer
              videoUrl={videoToPlay}
              title={video.title}
              poster={video.status === "pending" ? undefined : undefined}
            />
          )}
        </div>

        {/* Video Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{video.title}</h1>
              {renderStatusBadge()}
            </div>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDistanceToNow(new Date(video.created_at), {
                addSuffix: true,
                locale: dateLocale,
              })}
            </div>
          </div>

          {/* Detection Results */}
          {video.status === "completed" && (
            <div className="mt-8">
              {isLoadingDetections ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                    <p>{t("videoDetails.loadingDetections")}</p>
                  </CardContent>
                </Card>
              ) : detections.length > 0 ? (
                <DetectionResults
                  detections={detections}
                  videoId={video.id}
                  videoUrl={videoToPlay}
                />
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground">
                      {t("videoDetails.noDetections")}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Video Metadata */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                {t("videoDetails.metadata")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <FileVideo className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span className="font-medium mr-2">
                    {t("videoDetails.filename")}:
                  </span>
                  <span className="text-sm truncate">
                    {video.original_filename}
                  </span>
                </div>
                <div className="flex items-center">
                  <Info className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span className="font-medium mr-2">
                    {t("videoDetails.fileSize")}:
                  </span>
                  <span>{formatBytes(video.file_size)}</span>
                </div>
                {video.video_metadata && (
                  <>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                      <span className="font-medium mr-2">
                        {t("videoDetails.duration")}:
                      </span>
                      <span>{video.video_metadata.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <Info className="h-5 w-5 mr-2 text-muted-foreground" />
                      <span className="font-medium mr-2">
                        {t("videoDetails.resolution")}:
                      </span>
                      <span>
                        {video.video_metadata.width} x{" "}
                        {video.video_metadata.height}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Info className="h-5 w-5 mr-2 text-muted-foreground" />
                      <span className="font-medium mr-2">
                        {t("videoDetails.fps")}:
                      </span>
                      <span>{video.video_metadata.fps}</span>
                    </div>
                    <div className="flex items-center">
                      <Info className="h-5 w-5 mr-2 text-muted-foreground" />
                      <span className="font-medium mr-2">
                        {t("videoDetails.frames")}:
                      </span>
                      <span>{video.video_metadata.frame_count}</span>
                    </div>
                  </>
                )}
                {video.processing_started_at && (
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span className="font-medium mr-2">
                      {t("videoDetails.processingStarted")}:
                    </span>
                    <span>
                      {new Date(video.processing_started_at).toLocaleString()}
                    </span>
                  </div>
                )}
                {video.processing_completed_at && (
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span className="font-medium mr-2">
                      {t("videoDetails.processingCompleted")}:
                    </span>
                    <span>
                      {new Date(video.processing_completed_at).toLocaleString()}
                    </span>
                  </div>
                )}
                {video.error_message && (
                  <div className="flex items-start col-span-2">
                    <XCircle className="h-5 w-5 mr-2 text-red-500 mt-0.5" />
                    <div>
                      <span className="font-medium mr-2">
                        {t("videoDetails.errorMessage")}:
                      </span>
                      <span className="text-red-500">
                        {video.error_message}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Video Description */}
          {video.description && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-2">
                  {t("videoDetails.description")}
                </h2>
                <div className="text-sm whitespace-pre-line">
                  {video.description}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Video Actions */}
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => handleDownload(false)}
              className="flex items-center"
            >
              <Download className="mr-2 h-4 w-4" />
              {t("videoDetails.downloadOriginal")}
            </Button>

            {video.status === "completed" && video.processed_filename && (
              <Button
                onClick={() => handleDownload(true)}
                variant="outline"
                className="flex items-center"
              >
                <Download className="mr-2 h-4 w-4" />
                {t("videoDetails.downloadProcessed")}
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => router.push(`/${locale}/upload`)}
            >
              {t("common.backToVideos")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useVideoProcessing } from "@/lib/hooks/useVideoProcessing";
import { useDeleteVideo, useVideos } from "@/lib/hooks/useVideoQueries";
import { Video, VideoStatus } from "@/types/video";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { VideoCard } from "./VideoCard";

// Interface ProcessingStatusData phù hợp với VideoCard
interface ProcessingStatusData {
  displayStatus: VideoStatus;
  progress?: number;
  message?: string;
  isProcessing: boolean;
}

interface VideoListProps {
  locale: string;
}

export function VideoList({ locale }: VideoListProps) {
  const t = useTranslations();
  const {
    data: videos,
    isLoading,
    error: fetchError,
    refetch: refetchVideos,
  } = useVideos();

  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Sử dụng hook useVideoProcessing để lấy trạng thái của tất cả các video
  const { processingVideos = [], getVideoStatus } = useVideoProcessing();

  // Chuyển đổi mảng processingVideos thành record để tìm kiếm nhanh hơn
  const processingVideoMap = processingVideos.reduce((acc, video) => {
    acc[video.videoId] = video;
    return acc;
  }, {} as Record<string, (typeof processingVideos)[number]>);

  const deleteMutation = useDeleteVideo({
    onSuccess: () => {
      toast.success(t("video.delete.success"));
      setShowDeleteDialog(false);
      setVideoToDelete(null);
      refetchVideos();
    },
    onError: (error) => {
      toast.error(error.message || t("video.delete.error"));
      setShowDeleteDialog(false);
      setVideoToDelete(null);
    },
  });

  const isDeleting = deleteMutation.isPending;

  const handleDeleteClick = (video: Video) => {
    setVideoToDelete(video);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (!videoToDelete) return;
    deleteMutation.mutate(videoToDelete.id);
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setVideoToDelete(null);
  };

  useEffect(() => {
    if (fetchError) {
      toast.error(fetchError.message || t("video.list.fetchError"));
    }
  }, [fetchError, t]);

  if (isLoading && !videos) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-lg text-muted-foreground">
            {t("profile.noVideos")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((video) => {
          // Kiểm tra xem video có đang được xử lý không (từ store Zustand)
          const processingData = processingVideoMap[video.id];

          // Tạo ProcessingStatusData phù hợp với định nghĩa
          const processingStatusData: ProcessingStatusData = {
            displayStatus: processingData?.status || video.status,
            progress: processingData?.progress,
            message: processingData?.message,
            isProcessing: !!(
              processingData &&
              (processingData.status === "PROCESSING" ||
                processingData.status === "PENDING")
            ),
          };

          return (
            <VideoCard
              key={video.id}
              video={video}
              locale={locale}
              onDeleteClick={handleDeleteClick}
              isDeleting={isDeleting && videoToDelete?.id === video.id}
              processingStatusData={processingStatusData}
            />
          );
        })}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("video.delete.confirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("video.delete.confirmDescription", {
                title: videoToDelete?.title || "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleDeleteCancel}
              disabled={isDeleting}
            >
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t("common.deleting") : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

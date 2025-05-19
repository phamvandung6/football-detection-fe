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
import { useVideoProcessingManager } from "@/lib/hooks/useVideoProcessingManager";
import { useDeleteVideo, useVideos } from "@/lib/hooks/useVideoQueries";
import { Video } from "@/types/video";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { VideoCard } from "./VideoCard";

interface VideoListProps {
  locale: string;
}

export function VideoList({ locale }: VideoListProps) {
  const t = useTranslations();
  const { data: videos, isLoading, error: fetchError, refetch: refetchVideos } = useVideos();
  const { getCombinedVideoData, processingStatuses } = useVideoProcessingManager();

  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const justCompletedVideo = Object.values(processingStatuses).find(status => status.status === 'READY');
    if (justCompletedVideo) {
    }
  }, [processingStatuses, refetchVideos]);

  const deleteMutation = useDeleteVideo({
    onSuccess: () => {
      toast.success(t("video.delete.success"));
      setShowDeleteDialog(false);
      setVideoToDelete(null);
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
          const processingStatusData = getCombinedVideoData(video);
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

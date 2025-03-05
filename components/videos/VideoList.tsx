"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { getVideos, Video, deleteVideo } from "@/lib/api/videoService";
import { formatDistanceToNow } from "date-fns";
import { enUS, vi } from "date-fns/locale";
import { FileVideo, Clock, Calendar, Trash2, MoreVertical } from "lucide-react";
import ReactPlayer from "react-player/lazy";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VideoListProps {
  locale: string;
}

export function VideoList({ locale }: VideoListProps) {
  const t = useTranslations();
  const { token } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const dateLocale = locale === "vi" ? vi : enUS;

  const fetchVideos = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const data = await getVideos(token);
      setVideos(data);
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast.error(t("video.list.fetchError"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [token, t]);

  const handleDeleteClick = (video: Video) => {
    setVideoToDelete(video);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!videoToDelete || !token) return;

    try {
      setIsDeleting(true);
      await deleteVideo(videoToDelete.id, token);
      toast.success(t("video.delete.success"));

      // Cập nhật danh sách video sau khi xóa
      setVideos((prevVideos) =>
        prevVideos.filter((v) => v.id !== videoToDelete.id)
      );
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error(t("video.delete.error"));
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setVideoToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setVideoToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">{t("profile.noVideos")}</p>
        </CardContent>
      </Card>
    );
  }

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
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

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{t("video.list.title")}</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden">
            <div className="aspect-video relative bg-muted">
              {video.status === "completed" && video.processed_video_url ? (
                <ReactPlayer
                  url={video.processed_video_url}
                  width="100%"
                  height="100%"
                  light={true}
                  playIcon={<></>}
                />
              ) : video.original_video_url ? (
                <ReactPlayer
                  url={video.original_video_url}
                  width="100%"
                  height="100%"
                  light={true}
                  playIcon={<></>}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <FileVideo className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <Link
                href={`/${locale}/videos/${video.id}`}
                className="absolute inset-0 z-10"
                aria-label={`View ${video.title}`}
              />
              {/* Dropdown menu cho các hành động */}
              <div className="absolute top-2 right-2 z-20">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white rounded-full"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteClick(video);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("common.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold truncate">{video.title}</h3>
                {renderStatusBadge(video.status)}
              </div>

              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  {formatDistanceToNow(new Date(video.created_at), {
                    addSuffix: true,
                    locale: dateLocale,
                  })}
                </span>
              </div>

              {video.video_metadata && (
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{video.video_metadata.duration}</span>
                </div>
              )}

              <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                {video.description || t("video.list.noDescription")}
              </p>

              <div className="mt-4 flex gap-2">
                <Link href={`/${locale}/videos/${video.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    {t("video.list.viewDetails")}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteClick(video);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog xác nhận xóa video */}
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
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                  {t("video.delete.deleting")}
                </>
              ) : (
                t("common.delete")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

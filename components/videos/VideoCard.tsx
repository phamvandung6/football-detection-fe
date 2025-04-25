"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Video } from "@/types/video";
import { formatDistanceToNow } from "date-fns";
import { enUS, vi } from "date-fns/locale";
import { Calendar, FileVideo, MoreVertical, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface VideoCardProps {
  video: Video;
  locale: string;
  onDeleteClick: (video: Video) => void;
  isDeleting: boolean; // Nhận trạng thái đang xóa từ component cha
}

export function VideoCard({
  video,
  locale,
  onDeleteClick,
  isDeleting,
}: VideoCardProps) {
  const t = useTranslations();
  const dateLocale = locale === "vi" ? vi : enUS;

  // Render status badge (logic này có thể tái sử dụng hoặc giữ ở đây)
  const renderStatusBadge = (status: Video["status"]) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
          >
            {t("videoStatus.pending")}
          </Badge>
        );
      case "PROCESSING":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
          >
            {t("videoStatus.processing")}
          </Badge>
        );
      case "READY":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
          >
            {t("videoStatus.completed")} {/* Có thể vẫn dùng key completed */}
          </Badge>
        );
      case "FAILED":
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
    <Card key={video.id} className="overflow-hidden flex flex-col">
      {/* Phần Thumbnail/Link */}
      <div className="aspect-video relative bg-muted flex-shrink-0">
        <Link
          href={`/${locale}/videos/${video.id}`}
          className="block w-full h-full group"
          aria-label={`View ${video.title}`}
        >
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <FileVideo className="h-12 w-12 transition-transform duration-300 group-hover:scale-110" />
            </div>
          )}
        </Link>
        {/* Dropdown menu */}
        <div className="absolute top-2 right-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full opacity-80 hover:opacity-100 focus:opacity-100 transition-opacity"
                disabled={isDeleting}
                aria-label={t("common.actions")}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={(e) => {
                  e.preventDefault(); // Ngăn link kích hoạt nếu menu bên trong Link
                  e.stopPropagation();
                  onDeleteClick(video);
                }}
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? t("common.deleting") : t("common.delete")}
              </DropdownMenuItem>
              {/* Thêm các actions khác (Edit, etc.) */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Phần Content */}
      <CardContent className="p-4 flex flex-col flex-grow">
        {/* Title và Status */}
        <div className="flex items-start justify-between mb-2 gap-2">
          <Link
            href={`/${locale}/videos/${video.id}`}
            className="font-semibold text-base leading-tight line-clamp-2 break-words hover:text-primary transition-colors"
          >
            {video.title}
          </Link>
          <div className="flex-shrink-0">{renderStatusBadge(video.status)}</div>
        </div>

        {/* Date */}
        <div className="flex items-center text-xs text-muted-foreground mb-3">
          <Calendar className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
          <span>
            {video.createdAt
              ? formatDistanceToNow(new Date(video.createdAt), {
                  addSuffix: true,
                  locale: dateLocale,
                })
              : t("common.unknownDate")}
          </span>
        </div>

        {/* Description */}
        {video.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 flex-grow">
            {video.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

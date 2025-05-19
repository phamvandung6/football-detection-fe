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
import { Progress } from "@/components/ui/progress";
import { Video, VideoStatus } from "@/types/video";
import { formatDistanceToNow } from "date-fns";
import { enUS, vi } from "date-fns/locale";
import { AlertTriangle, Calendar, CheckCircle, FileVideo, Loader2, MoreVertical, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface ProcessingStatusData {
  displayStatus: VideoStatus;
  progress?: number;
  message?: string;
  isProcessing: boolean;
}

interface VideoCardProps {
  video: Video;
  locale: string;
  onDeleteClick: (video: Video) => void;
  isDeleting: boolean;
  processingStatusData: ProcessingStatusData;
}

export function VideoCard({
  video,
  locale,
  onDeleteClick,
  isDeleting,
  processingStatusData,
}: VideoCardProps) {
  const t = useTranslations();
  const dateLocale = locale === "vi" ? vi : enUS;

  const { displayStatus, progress, isProcessing } = processingStatusData;

  const renderStatusBadge = (status: VideoStatus, currentProgress?: number) => {
    let badgeText = "";
    let badgeVariant: "outline" | "secondary" | "destructive" | "default" = "outline";
    let className = "";
    let icon = null;

    switch (status) {
      case "PENDING":
        badgeText = t("videoStatus.pending");
        className = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
        icon = <AlertTriangle className="mr-1 h-3.5 w-3.5" />;
        break;
      case "PROCESSING":
        badgeText = t("videoStatus.processing");
        if (typeof currentProgress === 'number') {
          badgeText += ` (${currentProgress}%)`;
        }
        className = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
        icon = <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />;
        break;
      case "READY":
        badgeText = t("videoStatus.completed");
        className = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
        icon = <CheckCircle className="mr-1 h-3.5 w-3.5" />;
        break;
      case "FAILED":
        badgeText = t("videoStatus.failed");
        className = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
        badgeVariant = "destructive";
        icon = <AlertTriangle className="mr-1 h-3.5 w-3.5" />;
        break;
      default:
        return null;
    }
    return (
      <Badge variant={badgeVariant} className={className}>
        {icon}
        {badgeText}
      </Badge>
    );
  };

  return (
    <Card key={video.id} className="overflow-hidden flex flex-col relative">
      {isProcessing && displayStatus === "PROCESSING" && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 p-4">
          <Loader2 className="h-10 w-10 text-white animate-spin mb-3" />
          <p className="text-white text-sm font-medium mb-2">
            {t("videoStatus.processingDetailed", { progress: progress ?? 0 })}
          </p>
          {typeof progress === 'number' && (
            <Progress value={progress} className="w-3/4 h-2 bg-white/30 [&>div]:bg-white" />
          )}
        </div>
      )}

      <div className={`aspect-video relative bg-muted flex-shrink-0 ${isProcessing && displayStatus === "PROCESSING" ? 'filter blur-sm' : ''}`}>
        <Link
          href={`/${locale}/videos/${video.id}`}
          className="block w-full h-full group"
          aria-label={`View ${video.title}`}
          onClick={(e) => {
            if (isProcessing && displayStatus === "PROCESSING") {
              e.preventDefault();
            }
          }}
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
        <div className="absolute top-2 right-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full opacity-80 hover:opacity-100 focus:opacity-100 transition-opacity"
                disabled={isDeleting || (isProcessing && displayStatus === "PROCESSING")}
                aria-label={t("common.actions")}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDeleteClick(video);
                }}
                disabled={isDeleting || (isProcessing && displayStatus === "PROCESSING")}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? t("common.deleting") : t("common.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardContent className="p-4 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-2 gap-2">
          <Link
            href={`/${locale}/videos/${video.id}`}
            className={`font-semibold text-base leading-tight line-clamp-2 break-words  transition-colors ${
              isProcessing && displayStatus === "PROCESSING"
                ? "text-muted-foreground pointer-events-none"
                : "hover:text-primary"
            }`}
            onClick={(e) => {
                if (isProcessing && displayStatus === "PROCESSING") {
                  e.preventDefault();
                }
            }}
          >
            {video.title}
          </Link>
          <div className="flex-shrink-0">
            {renderStatusBadge(displayStatus, progress)}
          </div>
        </div>

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

        {video.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 flex-grow">
            {video.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

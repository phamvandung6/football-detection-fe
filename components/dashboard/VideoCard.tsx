"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type VideoStatus = "processing" | "completed" | "failed";

export type VideoData = {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  uploadDate: string;
  status: VideoStatus;
  detectedObjects: number;
  size: string;
};

type VideoCardProps = {
  video: VideoData;
  onClick?: (id: string) => void;
};

export default function VideoCard({ video, onClick }: VideoCardProps) {
  const t = useTranslations();

  const getStatusColor = (status: VideoStatus) => {
    switch (status) {
      case "processing":
        return "text-blue-500 bg-blue-500/10";
      case "completed":
        return "text-green-500 bg-green-500/10";
      case "failed":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const getStatusIcon = (status: VideoStatus) => {
    switch (status) {
      case "processing":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 animate-spin"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        );
      case "completed":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        );
      case "failed":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="m18 6-12 12" />
            <path d="m6 6 12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Card className="overflow-hidden hover-card">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="object-cover w-full h-full transition-transform hover:scale-105"
          />
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {video.duration}
          </div>
          <div
            className={`absolute top-2 left-2 ${getStatusColor(
              video.status
            )} text-xs px-2 py-1 rounded-full flex items-center gap-1`}
          >
            {getStatusIcon(video.status)}
            {t(`dashboard.status.${video.status}`)}
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3
                className="font-semibold line-clamp-1 hover:underline cursor-pointer"
                onClick={() => onClick?.(video.id)}
              >
                {video.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {t("dashboard.uploadedOn", { date: video.uploadDate })}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onClick?.(video.id)}>
                  {t("dashboard.viewDetails")}
                </DropdownMenuItem>
                <DropdownMenuItem>{t("dashboard.download")}</DropdownMenuItem>
                <DropdownMenuItem>{t("dashboard.share")}</DropdownMenuItem>
                <DropdownMenuItem className="text-red-500">
                  {t("dashboard.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3 text-muted-foreground"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span>
                {video.detectedObjects} {t("dashboard.objects")}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3 text-muted-foreground"
              >
                <path d="M21 5c0-1.1-.9-2-2-2H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V5z" />
                <path d="M19 5v14H5V5h14z" />
              </svg>
              <span>{video.size}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onClick?.(video.id)}
          >
            {t("dashboard.viewDetails")}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

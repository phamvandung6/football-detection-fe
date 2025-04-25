"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useState } from "react";
import VideoCard, { VideoData } from "./VideoCard";
import { Separator } from "@/components/ui/separator";

type VideoListProps = {
  variants?: any;
};

export default function VideoList({ variants }: VideoListProps) {
  const t = useTranslations();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // Mock data for videos
  const videos: VideoData[] = [
    {
      id: "1",
      title: "Football Match Highlights - Team A vs Team B",
      thumbnail:
        "https://placehold.co/600x400/3b82f6/ffffff?text=Match+Highlights",
      duration: "12:34",
      uploadDate: "2023-10-15",
      status: "completed",
      detectedObjects: 245,
      size: "1.2 GB",
    },
    {
      id: "2",
      title: "Training Session - Passing Drills",
      thumbnail:
        "https://placehold.co/600x400/10b981/ffffff?text=Training+Session",
      duration: "45:12",
      uploadDate: "2023-10-12",
      status: "completed",
      detectedObjects: 189,
      size: "2.4 GB",
    },
    {
      id: "3",
      title: "Player Analysis - Forward Movement",
      thumbnail:
        "https://placehold.co/600x400/6366f1/ffffff?text=Player+Analysis",
      duration: "28:45",
      uploadDate: "2023-10-10",
      status: "processing",
      detectedObjects: 76,
      size: "1.8 GB",
    },
    {
      id: "4",
      title: "Tactical Review - Defensive Formation",
      thumbnail:
        "https://placehold.co/600x400/f59e0b/ffffff?text=Tactical+Review",
      duration: "33:21",
      uploadDate: "2023-10-08",
      status: "failed",
      detectedObjects: 0,
      size: "1.5 GB",
    },
    {
      id: "5",
      title: "Goal Compilation - Season Highlights",
      thumbnail:
        "https://placehold.co/600x400/ef4444/ffffff?text=Goal+Compilation",
      duration: "15:30",
      uploadDate: "2023-10-05",
      status: "completed",
      detectedObjects: 320,
      size: "950 MB",
    },
    {
      id: "6",
      title: "Team Strategy Meeting - Pre-Game Analysis",
      thumbnail:
        "https://placehold.co/600x400/8b5cf6/ffffff?text=Strategy+Meeting",
      duration: "52:18",
      uploadDate: "2023-10-02",
      status: "processing",
      detectedObjects: 42,
      size: "2.1 GB",
    },
  ];

  const handleVideoClick = (id: string) => {
    setSelectedVideo(id);
    // In a real app, you would navigate to the video details page
    console.log(`Navigating to video details for ID: ${id}`);
  };

  return (
    <motion.div variants={variants}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t("dashboard.recentVideos")}</h2>
      </div>
      <Separator className="mb-6" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} onClick={handleVideoClick} />
        ))}
      </div>
      {videos.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-muted mb-4">
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
              className="h-8 w-8 text-muted-foreground"
            >
              <path d="m22 8-6 4 6 4V8Z" />
              <rect x="2" y="6" width="14" height="12" rx="2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium">{t("dashboard.noVideos")}</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            {t("dashboard.uploadFirst")}
          </p>
        </div>
      )}
    </motion.div>
  );
}

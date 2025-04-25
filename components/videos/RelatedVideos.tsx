"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

interface VideoInfo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  uploadDate: string;
}

interface RelatedVideosProps {
  videos: VideoInfo[];
  currentVideoId: string;
  locale: string;
  isLoading?: boolean;
}

export function RelatedVideos({
  videos,
  currentVideoId,
  locale,
  isLoading = false,
}: RelatedVideosProps) {
  const t = useTranslations();

  // Filter out current video
  const filteredVideos = videos.filter((video) => video.id !== currentVideoId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("videoDetails.relatedVideos")}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex gap-3">
                <Skeleton className="h-20 w-36 rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredVideos.length > 0 ? (
          <div className="space-y-4">
            {filteredVideos.slice(0, 5).map((video) => (
              <RelatedVideoItem key={video.id} video={video} locale={locale} />
            ))}
            <div className="text-center pt-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/${locale}/dashboard`}>
                  {t("videoDetails.viewAllVideos")}
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>{t("videoDetails.noRelatedVideos")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface RelatedVideoItemProps {
  video: VideoInfo;
  locale: string;
}

function RelatedVideoItem({ video, locale }: RelatedVideoItemProps) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} className="flex gap-3 group">
      <Link
        href={`/${locale}/videos/${video.id}`}
        className="relative h-20 w-36 rounded-md overflow-hidden flex-shrink-0"
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          className="object-cover w-full h-full transition-transform group-hover:scale-105"
        />
        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
          {video.duration}
        </div>
      </Link>
      <div className="flex flex-col">
        <Link
          href={`/${locale}/videos/${video.id}`}
          className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors"
        >
          {video.title}
        </Link>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(video.uploadDate).toLocaleDateString()}
        </p>
      </div>
    </motion.div>
  );
}

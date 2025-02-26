"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { VideoHeader } from "./VideoHeader";
import { VideoActions } from "./VideoActions";
import { VideoUploader } from "./VideoUploader";
import { VideoDescription } from "./VideoDescription";
import { VideoTags } from "./VideoTags";

interface VideoDetailsProps {
  video: {
    id: string;
    title: string;
    description: string;
    uploadDate: string;
    views: number;
    likes: number;
    status: "processing" | "completed" | "failed";
    tags: string[];
    user: {
      id: string;
      name: string;
      avatar?: string;
    };
  };
  locale: string;
}

/**
 * VideoDetails component displays all information about a video
 * It uses smaller, focused components for different parts of the UI
 */
export function VideoDetails({ video, locale }: VideoDetailsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <VideoHeader
              title={video.title}
              uploadDate={video.uploadDate}
              views={video.views}
              status={video.status}
            />

            <VideoActions
              videoId={video.id}
              likes={video.likes}
              locale={locale}
            />
          </div>

          <Separator />

          <VideoUploader user={video.user} />

          <VideoDescription description={video.description} />

          <VideoTags tags={video.tags} />
        </div>
      </CardContent>
    </Card>
  );
}

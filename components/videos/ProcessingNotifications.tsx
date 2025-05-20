"use client";

// import { VideoProcessingStatus, getVideoProcessingStatus } from "@/lib/api/videoService"; // Không dùng trực tiếp
import { useVideoProcessing } from "@/lib/hooks/useVideoProcessing";
import { VideoStatus } from "@/types/video";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FloatingProcessingIndicator } from "./FloatingProcessingIndicator";

interface ProcessingNotificationsProps {
  locale: string;
}

// Interface cho status của video đang được theo dõi
interface VideoProcessingInfo {
  videoId: string;
  progress: number;
  status: VideoStatus;
  message: string;
  title?: string;
}

// Interface cho statusMap lưu trạng thái xử lý của các video
interface VideoStatusMap {
  [videoId: string]: VideoProcessingInfo;
}

export function ProcessingNotifications({
  locale,
}: ProcessingNotificationsProps) {
  const t = useTranslations();
  const [isVisible, setIsVisible] = useState(true);

  // Sử dụng hook useVideoProcessing để lấy videos đang xử lý
  const { processingVideos = [], removeVideo } = useVideoProcessing();

  // Nếu không có processing videos hoặc đã ẩn, không hiển thị gì
  if (!isVisible || processingVideos.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3 items-end">
      {processingVideos.map((video) => (
        <FloatingProcessingIndicator
          key={video.videoId}
          videoId={video.videoId}
          status={{
            videoId: video.videoId,
            status: video.status,
            progress: video.progress,
            message: video.message || "",
          }}
          locale={locale}
          onDismiss={() => removeVideo(video.videoId)}
        />
      ))}
    </div>
  );
}

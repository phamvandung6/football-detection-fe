"use client";

// import { VideoProcessingStatus, getVideoProcessingStatus } from "@/lib/api/videoService"; // Không dùng trực tiếp
import { useVideoProcessingManager } from "@/lib/hooks/useVideoProcessingManager"; // Import hook
import { useTranslations } from "next-intl";
// import { useEffect, useState } from "react"; // useState có thể vẫn cần cho isVisible
import { useState } from "react";
import { FloatingProcessingIndicator } from "./FloatingProcessingIndicator";

interface ProcessingNotificationsProps {
  locale: string;
}

// Các hàm quản lý sessionStorage (get/add/remove/clear ProcessingVideos) đã được chuyển vào hook useVideoProcessingManager
// Chúng không cần thiết ở đây nữa.

export function ProcessingNotifications({ locale }: ProcessingNotificationsProps) {
  const t = useTranslations(); // Vẫn có thể cần cho các bản dịch trong tương lai
  const { processingStatuses, removeTrackedVideo, trackedVideoIdsCount } = useVideoProcessingManager();
  const [isVisible, setIsVisible] = useState(true); // Giữ lại nếu muốn có chức năng ẩn/hiện toàn bộ cụm thông báo

  // Loại bỏ useEffect polling cũ và quản lý state processingVideos cục bộ

  if (!isVisible || trackedVideoIdsCount === 0) {
    return null;
          }

  const activeProcessingVideos = Object.entries(processingStatuses)
    .filter(([_, status]) => status.status === "PROCESSING" || status.status === "PENDING")
    .sort(([videoIdA], [videoIdB]) => videoIdA.localeCompare(videoIdB)); // Sắp xếp để thứ tự ổn định

  if (activeProcessingVideos.length === 0) {
      return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3 items-end">
      {activeProcessingVideos.map(([videoId, status]) => (
        <FloatingProcessingIndicator
          key={videoId}
          videoId={videoId}
          status={status}
          locale={locale}
          onDismiss={() => removeTrackedVideo(videoId)} // Hook sẽ tự động xóa khỏi sessionStorage
        />
      ))}
      {/* Có thể thêm nút để ẩn/hiện tất cả nếu muốn */}
      {/* {activeProcessingVideos.length > 1 && (
        <Button size="sm" variant="ghost" onClick={() => setIsVisible(false)} className="mt-2">
          {t("notifications.dismissAll")}
        </Button>
      )} */}
    </div>
  );
} 
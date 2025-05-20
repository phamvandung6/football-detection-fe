"use client";

import { VideoStatus } from "@/types/video";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

interface VideoProcessingStatus {
  progress: number;
  videoId: string;
  status: VideoStatus;
  message: string;
}

interface FloatingProcessingIndicatorProps {
  videoId: string;
  status: VideoProcessingStatus;
  locale: string;
  onDismiss?: () => void;
}

export function FloatingProcessingIndicator({
  videoId,
  status,
  locale,
  onDismiss,
}: FloatingProcessingIndicatorProps) {
  const t = useTranslations();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  // Hiệu ứng pulse khi tiến độ thay đổi
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    setPulse(true);
    const timer = setTimeout(() => setPulse(false), 500);
    return () => clearTimeout(timer);
  }, [status.progress]);

  // Hiệu ứng khi component mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const getStatusColor = () => {
    switch (status.status) {
      case "PENDING":
        return "bg-yellow-500";
      case "PROCESSING":
        return "bg-blue-500";
      case "COMPLETED":
        return "bg-green-500";
      case "ERROR":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusTextColor = () => {
    switch (status.status) {
      case "PENDING":
        return "text-yellow-500";
      case "PROCESSING":
        return "text-blue-500";
      case "COMPLETED":
        return "text-green-500";
      case "ERROR":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case "PENDING":
        return <AlertCircle className="h-4 w-4" />;
      case "PROCESSING":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4" />;
      case "ERROR":
        return <X className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const handleViewVideo = () => {
    router.push(`/${locale}/videos/${videoId}`);
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex flex-col items-end transition-opacity duration-300 ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`bg-card border shadow-lg rounded-lg overflow-hidden transition-all duration-300 ease-in-out ${
          expanded ? "w-80" : "w-auto"
        }`}
      >
        {/* Header - luôn hiển thị */}
        <div
          className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/70 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-2">
            <div
              className={`${getStatusColor()} text-white p-1 rounded-full flex items-center justify-center`}
            >
              {getStatusIcon()}
            </div>
            <span className="font-medium text-sm">
              {status.status === "PROCESSING"
                ? t("videoStatus.processingWithProgress", {
                    progress: status.progress,
                  })
                : status.status === "PENDING"
                ? t("videoStatus.pending")
                : status.status === "COMPLETED"
                ? t("videoStatus.completed")
                : t("videoStatus.failed")}
            </span>
          </div>

          <div className="flex items-center gap-2 ml-4">
            {status.status === "PROCESSING" && (
              <span
                className={`text-xs font-semibold ${
                  pulse ? getStatusTextColor() : "text-muted-foreground"
                } transition-colors`}
              >
                {status.progress}%
              </span>
            )}
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </div>
        </div>

        {/* Nội dung chi tiết - chỉ hiển thị khi expanded */}
        {expanded && (
          <div className="p-4 border-t">
            {/* Thanh tiến độ */}
            {status.status === "PROCESSING" && (
              <div className="mb-4">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getStatusColor()} transition-all duration-300 ease-in-out ${
                      pulse ? "pulse-animation" : ""
                    }`}
                    style={{ width: `${status.progress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-muted-foreground">0%</span>
                  <span
                    className={`text-xs font-medium ${getStatusTextColor()}`}
                  >
                    {status.progress}%
                  </span>
                  <span className="text-xs text-muted-foreground">100%</span>
                </div>
              </div>
            )}

            {/* Thông báo */}
            <p className="text-sm text-muted-foreground mb-4">
              {status.message ||
                t(`videoStatus.${status.status.toLowerCase()}Message`)}
            </p>

            {/* Các nút hành động */}
            <div className="flex justify-end gap-2">
              {status.status === "COMPLETED" && (
                <Button size="sm" onClick={handleViewVideo}>
                  {t("common.viewVideo")}
                </Button>
              )}

              <Button size="sm" variant="outline" onClick={onDismiss}>
                {t("common.dismiss")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Thêm CSS cho hiệu ứng pulse
if (typeof document !== "undefined") {
  const styleId = "floating-processor-styles";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.6; }
      100% { opacity: 1; }
    }
    .pulse-animation {
      animation: pulse 1s ease-in-out;
    }
    `;
    document.head.appendChild(style);
  }
}

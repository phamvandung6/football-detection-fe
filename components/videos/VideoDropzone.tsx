"use client";

import { Button } from "@/components/ui/button";
import { FileVideo, Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player/lazy";

interface VideoDropzoneProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void; // Callback khi file được chọn hoặc xóa
  disabled?: boolean;
  errorMessage?: string; // Lỗi cụ thể cho dropzone
}

export function VideoDropzone({
  selectedFile,
  onFileSelect,
  disabled = false,
  errorMessage,
}: VideoDropzoneProps) {
  const t = useTranslations();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Tạo/hủy URL xem trước
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Kiểm tra loại file
      if (!file.type.includes("mp4") && !file.type.includes("video/mp4")) {
        onFileSelect(null);
        // Hiển thị lỗi
        const customEvent = new CustomEvent("video-validation-error", {
          detail: { message: t("video.upload.onlyMP4Allowed") },
        });
        window.dispatchEvent(customEvent);
        return;
      }

      try {
        // Kiểm tra thời lượng video
        const duration = await getVideoDuration(file);
        // Giới hạn 30 phút (1800 giây)
        if (duration > 1800) {
          onFileSelect(null);
          // Hiển thị lỗi
          const customEvent = new CustomEvent("video-validation-error", {
            detail: {
              message: t("video.upload.maxDurationExceeded", { minutes: 30 }),
            },
          });
          window.dispatchEvent(customEvent);
          return;
        }

        // Nếu mọi thứ OK, chấp nhận file
        onFileSelect(file);
      } catch (error) {
        console.error("Error checking video duration:", error);
        // Vẫn chấp nhận file nếu không kiểm tra được thời lượng
        onFileSelect(file);
      }
    } else {
      onFileSelect(null);
    }
  };

  // Hàm lấy thời lượng video
  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };

      video.onerror = (e) => {
        reject(e);
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      // Kiểm tra định dạng file
      if (!file.type.includes("mp4") && !file.type.includes("video/mp4")) {
        // Hiển thị lỗi
        const customEvent = new CustomEvent("video-validation-error", {
          detail: { message: t("video.upload.onlyMP4Allowed") },
        });
        window.dispatchEvent(customEvent);
        return;
      }

      try {
        // Kiểm tra thời lượng video
        const duration = await getVideoDuration(file);
        // Giới hạn 30 phút (1800 giây)
        if (duration > 1800) {
          // Hiển thị lỗi
          const customEvent = new CustomEvent("video-validation-error", {
            detail: {
              message: t("video.upload.maxDurationExceeded", { minutes: 30 }),
            },
          });
          window.dispatchEvent(customEvent);
          return;
        }

        // Nếu mọi thứ OK, chấp nhận file
        onFileSelect(file);
      } catch (error) {
        console.error("Error checking video duration:", error);
        // Vẫn chấp nhận file nếu không kiểm tra được thời lượng
        onFileSelect(file);
      }
    } else {
      onFileSelect(null);
    }
  };

  const clearSelection = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {!selectedFile ? (
        // --- Dropzone Area --- //
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer 
                      hover:bg-muted/50 transition-all duration-200 
                      ${
                        isDragging
                          ? "border-primary bg-primary/10"
                          : "border-input"
                      } 
                      ${errorMessage ? "border-destructive" : ""} 
                      ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          onDragOver={disabled ? undefined : handleDragOver}
          onDragLeave={disabled ? undefined : handleDragLeave}
          onDrop={disabled ? undefined : handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          aria-disabled={disabled}
        >
          <div className="space-y-3 flex flex-col items-center justify-center min-h-[150px]">
            <Upload
              className={`h-10 w-10 ${
                isDragging ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <div>
              <p className={`font-medium ${isDragging ? "text-primary" : ""}`}>
                {t("video.upload.dragDrop")}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("video.upload.requirements")}
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled}
          />
        </div>
      ) : (
        // --- Preview Area --- //
        <div className="space-y-3">
          <div className="relative aspect-video overflow-hidden rounded-md border bg-muted">
            {previewUrl && (
              <ReactPlayer
                url={previewUrl}
                controls
                width="100%"
                height="100%"
                playing={false} // Không tự phát
                light={false} // Không dùng thumbnail của player
              />
            )}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full p-1 shadow-md"
              onClick={clearSelection}
              disabled={disabled}
              aria-label={t("common.clearSelection")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between text-sm bg-muted p-2 rounded-md border">
            <p className="truncate font-medium flex items-center gap-2">
              <FileVideo className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{selectedFile.name}</span>
            </p>
            <p className="text-muted-foreground whitespace-nowrap pl-2">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
      )}
      {/* Hiển thị lỗi */}
      {errorMessage && (
        <p className="text-xs text-destructive mt-1">{errorMessage}</p>
      )}
    </div>
  );
}

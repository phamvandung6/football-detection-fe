"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useVideoProcessing } from "@/lib/hooks/useVideoProcessing";
import { useUploadVideo } from "@/lib/hooks/useVideoQueries";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { VideoDropzone } from "./VideoDropzone";

interface VideoUploadFormProps {
  locale: string;
  onVideoUploaded?: () => void;
}

export function VideoUploadForm({
  locale,
  onVideoUploaded,
}: VideoUploadFormProps) {
  const t = useTranslations();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sử dụng hook useVideoProcessing
  const { addVideo } = useVideoProcessing();

  const uploadMutation = useUploadVideo({
    onSuccess: (data) => {
      console.log("[VideoUploadForm] onSuccess data:", data);
      if (data && data.videoId) {
        console.log("[VideoUploadForm] Video ID found:", data.videoId);

        // Thêm video vào store thông qua hook useVideoProcessing
        addVideo(data.videoId, title);

        toast.info(t("video.upload.processingStarted"), {
          duration: 5000,
        });

        if (onVideoUploaded) {
          setTimeout(() => {
            onVideoUploaded();
          }, 1500);
        }
      } else {
        console.warn(
          "[VideoUploadForm] No videoId in onSuccess data or data is null. Data:",
          data
        );
        if (data && data.message) {
          toast.success(data.message || t("video.upload.uploadSuccess"));
        } else {
          toast.success(t("video.upload.uploadSuccess"));
        }
      }

      if (data && data.videoId) {
        // Reset form sau khi upload thành công
        setTitle("");
        setDescription("");
        setSelectedFile(null);
        setUploadProgress(0);
      }
    },
    onError: (error) => {
      console.error("[VideoUploadForm] onError:", error);
      toast.error(error.message || t("video.upload.uploadError"));
      setUploadProgress(0);
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
  });

  const isUploading = uploadMutation.isPending;

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    if (errors.file) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.file;
        return newErrors;
      });
    }
  };

  // Lắng nghe sự kiện validation lỗi
  useEffect(() => {
    const handleVideoValidationError = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.message) {
        toast.error(customEvent.detail.message);
        setErrors((prev) => ({ ...prev, file: customEvent.detail.message }));
      }
    };

    window.addEventListener(
      "video-validation-error",
      handleVideoValidationError
    );

    return () => {
      window.removeEventListener(
        "video-validation-error",
        handleVideoValidationError
      );
    };
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = t("video.upload.titleRequired");
    if (!selectedFile) newErrors.file = t("video.upload.noFileSelected");

    // Kiểm tra định dạng file
    if (
      selectedFile &&
      !selectedFile.type.includes("mp4") &&
      !selectedFile.type.includes("video/mp4")
    ) {
      newErrors.file = t("video.upload.onlyMP4Allowed");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !selectedFile) {
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", selectedFile as File);
    formData.append("isDownloadable", "true");

    uploadMutation.mutate(formData);
  };

  return (
    <>
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>{t("upload.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">{t("videoDetails.title")}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isUploading}
                aria-invalid={!!errors.title}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                {t("videoDetails.description")}
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isUploading}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("video.upload.file")}</Label>
              <VideoDropzone
                selectedFile={selectedFile}
                onFileSelect={handleFileSelect}
                disabled={isUploading}
                errorMessage={errors.file}
              />
            </div>

            {isUploading && (
              <div className="space-y-2">
                <Label>{t("video.upload.progress")}</Label>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  {uploadProgress}% {t("common.completed")}
                </p>
              </div>
            )}

            <Button type="submit" disabled={isUploading || !selectedFile}>
              {isUploading
                ? t("video.upload.uploading")
                : t("video.upload.upload")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/AuthContext";
import { uploadVideo } from "@/lib/api/videoService";
import ReactPlayer from "react-player";
import { FileVideo, Upload, X } from "lucide-react";

interface VideoUploadFormProps {
  locale: string;
}

export function VideoUploadForm({ locale }: VideoUploadFormProps) {
  const t = useTranslations();
  const router = useRouter();
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Tạo URL xem trước khi chọn file
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    // Cleanup function
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra định dạng file
    if (!file.type.includes("video/")) {
      setErrors((prev) => ({
        ...prev,
        file: t("video.upload.invalidFormat"),
      }));
      return;
    }

    // Kiểm tra kích thước file (tối đa 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        file: t("video.upload.tooLarge"),
      }));
      return;
    }

    setSelectedFile(file);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.file;
      return newErrors;
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    // Kiểm tra định dạng file
    if (!file.type.includes("video/")) {
      setErrors((prev) => ({
        ...prev,
        file: t("video.upload.invalidFormat"),
      }));
      return;
    }

    // Kiểm tra kích thước file (tối đa 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        file: t("video.upload.tooLarge"),
      }));
      return;
    }

    setSelectedFile(file);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.file;
      return newErrors;
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = t("video.upload.titleRequired");
    }

    if (!selectedFile) {
      newErrors.file = t("video.upload.noFileSelected");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !token) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("file", selectedFile as File);

      const video = await uploadVideo(formData, token, (progress) => {
        setUploadProgress(progress);
      });

      toast.success(t("video.upload.uploadSuccess"));

      // Chuyển hướng đến trang chi tiết video
      router.push(`/${locale}/videos/${video.id}`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : t("video.upload.uploadError")
      );
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
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
            <Label htmlFor="description">{t("videoDetails.description")}</Label>
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
            {!selectedFile ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors ${
                errors.file ? "border-destructive" : "border-input"
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{t("video.upload.dragDrop")}</p>
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
                disabled={isUploading}
              />
            </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10 bg-background/80 rounded-full"
                    onClick={clearSelectedFile}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  {previewUrl ? (
                    <div className="rounded-lg overflow-hidden">
                      <ReactPlayer
                        url={previewUrl}
                        width="100%"
                        height="auto"
                        controls
                        light={false}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-40 bg-muted rounded-lg">
                      <FileVideo className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {t("video.upload.changeFile")}
                  </Button>
                </div>
              </div>
            )}
            {errors.file && (
              <p className="text-xs text-destructive">{errors.file}</p>
            )}
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {t("video.upload.uploading")}
                </span>
                <span className="text-sm">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isUploading}>
            {isUploading ? (
              <>
                <span className="mr-2">{t("video.upload.uploading")}</span>
                <span className="animate-spin">
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
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                </span>
              </>
            ) : (
              t("video.upload.submit")
            )}
            </Button>
        </form>
      </CardContent>
    </Card>
  );
}

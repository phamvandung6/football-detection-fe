"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { uploadVideoFile } from "@/lib/api/videoService";

type UploadCardProps = {
  variants?: any;
};

export default function UploadCard({ variants }: UploadCardProps) {
  const t = useTranslations();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);

    if (file) {
      toast.info(`Selected file: ${file.name}`);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error(t("video.upload.noFileSelected"));
      return;
    }

    try {
      setIsUploading(true);

      // Create FormData
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Call server action
      const result = await uploadVideoFile(formData);

      if (result.success) {
        toast.success(result.message);
        // Reset form
        formRef.current?.reset();
        setSelectedFile(null);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(t("video.upload.error"));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      className="w-full max-w-3xl relative overflow-hidden"
      variants={variants}
    >
      <Card className="glass border border-primary/10 shadow-lg">
        <CardContent className="p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/5 to-transparent rounded-tr-full"></div>

          <div className="text-center relative z-10 space-y-6">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 border border-primary/20">
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
                className="h-8 w-8 text-primary"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold">{t("upload.title")}</h2>
            <p className="text-muted-foreground">
              {t("video.upload.dragDrop")}
            </p>

            <form ref={formRef} onSubmit={handleSubmit}>
              <div
                className={`border-2 border-dashed ${
                  selectedFile
                    ? "border-primary/50 bg-primary/10"
                    : "border-primary/20 bg-primary/5"
                } rounded-lg p-12 hover:bg-primary/10 transition-colors cursor-pointer`}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                {selectedFile ? (
                  <div className="flex flex-col items-center">
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
                      className="mx-auto h-12 w-12 text-primary mb-4"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                      <path d="m10 13-2 2 2 2" />
                      <path d="m14 17 2-2-2-2" />
                    </svg>
                    <p className="font-medium text-primary">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <>
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
                      className="mx-auto h-12 w-12 text-muted-foreground mb-4"
                    >
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
                      <path d="m15 7 4-4" />
                      <path d="M8 12h6" />
                      <path d="m9 9 3 3-3 3" />
                    </svg>
                    <p className="text-sm text-muted-foreground">
                      {t("video.upload.requirements")}
                    </p>
                  </>
                )}
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept="video/*"
                  onChange={handleFileChange}
                />
              </div>

              <motion.div
                className="mt-6"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  type="submit"
                  className="w-full rounded-full shadow-md hover:shadow-lg"
                  size="lg"
                  disabled={isUploading || !selectedFile}
                >
                  {isUploading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {t("video.upload.uploading")}
                    </>
                  ) : (
                    t("dashboard.uploadNow")
                  )}
                </Button>
              </motion.div>
            </form>

            <div className="flex justify-center mt-4">
              <Link href="./dashboard">
                <Button variant="link" className="text-muted-foreground">
                  {t("dashboard.viewUploads")}
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

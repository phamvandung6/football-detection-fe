"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ShareDialog } from "./ShareDialog";
import { useAuth } from "@/lib/auth/AuthContext";
import { usePermissions } from "@/lib/auth/usePermissions";
import { toast } from "sonner";

interface VideoActionsProps {
  videoId: string;
  userId: string;
  likes: number;
  locale: string;
  onDelete?: () => void;
}

export function VideoActions({
  videoId,
  userId,
  likes,
  locale,
  onDelete,
}: VideoActionsProps) {
  const t = useTranslations();
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();
  const { canDelete } = usePermissions();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLike = () => {
    if (!isAuthenticated) {
      toast.error(t("common.authRequired"));
      router.push(`/${locale}/auth/login`);
      return;
    }

    if (isLiked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleDownload = () => {
    if (!isAuthenticated) {
      toast.error(t("common.authRequired"));
      router.push(`/${locale}/auth/login`);
      return;
    }

    // Implement download functionality
    const downloadUrl = `/api/videos/${videoId}/download`;
    window.open(downloadUrl, "_blank");
  };

  const handleDelete = async () => {
    if (!isAuthenticated) {
      toast.error(t("common.authRequired"));
      router.push(`/${locale}/auth/login`);
      return;
    }

    if (!canDelete(userId)) {
      toast.error(t("common.notAuthorized"));
      return;
    }

    if (confirm(t("videoDetails.confirmDelete"))) {
      setIsDeleting(true);
      try {
        // Implement delete functionality
        // const response = await deleteVideo(videoId, token);
        toast.success(t("videoDetails.deleteSuccess"));
        if (onDelete) onDelete();
      } catch (error) {
        console.error("Error deleting video:", error);
        toast.error(t("videoDetails.deleteError"));
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={handleLike}
      >
        {isLiked ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4 text-red-500"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        ) : (
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
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        )}
        <span>{likeCount}</span>
      </Button>

      <ShareDialog
        videoId={videoId}
        trigger={
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
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
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            <span>{t("videoDetails.share")}</span>
          </Button>
        }
      />

      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={handleDownload}
      >
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
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <span>{t("videoDetails.download")}</span>
      </Button>

      {isAuthenticated && canDelete(userId) && (
        <Button
          variant="destructive"
          size="sm"
          className="flex items-center gap-1"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
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
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          )}
          <span>{t("videoDetails.delete")}</span>
        </Button>
      )}
    </div>
  );
}

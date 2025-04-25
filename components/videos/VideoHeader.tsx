"use client";

import { useTranslations } from "next-intl";

interface VideoHeaderProps {
  title: string;
  uploadDate: string;
  views: number;
  status: "processing" | "completed" | "failed";
}

export function VideoHeader({
  title,
  uploadDate,
  views,
  status,
}: VideoHeaderProps) {
  const t = useTranslations();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "text-blue-500 bg-blue-500/10";
      case "completed":
        return "text-green-500 bg-green-500/10";
      case "failed":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing":
        return (
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
            className="h-4 w-4 animate-spin"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        );
      case "completed":
        return (
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
            <path d="M20 6 9 17l-5-5" />
          </svg>
        );
      case "failed":
        return (
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
            <path d="m18 6-12 12" />
            <path d="m6 6 12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
        <span>
          {new Date(uploadDate).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
        <span>•</span>
        <span>
          {views.toLocaleString()} {t("videoDetails.views")}
        </span>
        <span>•</span>
        <div
          className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${getStatusColor(
            status
          )}`}
        >
          {getStatusIcon(status)}
          {t(`videoDetails.status.${status}`)}
        </div>
      </div>
    </div>
  );
}

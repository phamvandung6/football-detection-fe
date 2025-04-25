"use client";

import { useTranslations } from "next-intl";

interface VideoDescriptionProps {
  description: string;
}

export function VideoDescription({ description }: VideoDescriptionProps) {
  const t = useTranslations();

  return (
    <div className="bg-muted/50 rounded-lg p-4">
      <h3 className="font-medium mb-2">{t("videoDetails.description")}</h3>
      <p className="text-sm text-muted-foreground whitespace-pre-line">
        {description || t("videoDetails.noDescription")}
      </p>
    </div>
  );
} 
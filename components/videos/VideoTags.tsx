"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

interface VideoTagsProps {
  tags: string[];
}

export function VideoTags({ tags }: VideoTagsProps) {
  const t = useTranslations();

  return (
    <div>
      <h3 className="font-medium mb-2">{t("videoDetails.tags")}</h3>
      <div className="flex flex-wrap gap-2">
        {tags.length > 0 ? (
          tags.map((tag, index) => (
            <Badge key={index} variant="secondary">
              {tag}
            </Badge>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("videoDetails.noTags")}
          </p>
        )}
      </div>
    </div>
  );
}

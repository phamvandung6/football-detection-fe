"use client";

import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface VideoUploaderProps {
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export function VideoUploader({ user }: VideoUploaderProps) {
  const t = useTranslations();

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <h3 className="text-sm font-medium">{user.name}</h3>
        <p className="text-xs text-muted-foreground">
          {t("videoDetails.uploader")}
        </p>
      </div>
    </div>
  );
}

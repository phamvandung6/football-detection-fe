"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoList } from "@/components/videos/VideoList";
import { VideoUploadForm } from "@/components/videos/VideoUploadForm";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useState } from "react";

interface UploadPageProps {
  params: {
    locale: string;
  };
}

export default function UploadPage({ params }: UploadPageProps) {
  const { locale } = useParams();
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState("upload");

  // Hàm để chuyển tab
  const switchToTab = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        {t("upload.title")}
      </h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="upload">{t("upload.newVideo")}</TabsTrigger>
          <TabsTrigger value="videos">{t("upload.myVideos")}</TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
          <VideoUploadForm locale={locale as string} onVideoUploaded={() => switchToTab("videos")} />
        </TabsContent>
        <TabsContent value="videos">
          <VideoList locale={locale as string} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

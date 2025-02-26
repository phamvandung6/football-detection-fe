import { Metadata } from "next";
import { generateMetadata } from "@/app/[locale]/metadata";
import { VideoPlayer } from "@/components/videos/VideoPlayer";
import { VideoDetails } from "@/components/videos/VideoDetails";
import { DetectionResults } from "@/components/videos/DetectionResults";
import { RelatedVideos } from "@/components/videos/RelatedVideos";

interface VideoPageProps {
  params: {
    id: string;
    locale: string;
  };
}

export async function generateVideoMetadata({
  params,
}: VideoPageProps): Promise<Metadata> {
  // Trong thực tế, bạn sẽ fetch dữ liệu video từ API
  const videoTitle = "Football Match Highlights";
  return generateMetadata({
    title: `${videoTitle} - Football Detection`,
    description: "Xem phân tích chi tiết về trận đấu bóng đá với công nghệ AI",
    path: `/videos/${params.id}`,
    locale: params.locale,
  });
}

export default async function VideoPage({ params }: VideoPageProps) {
  // Trong thực tế, bạn sẽ fetch dữ liệu video từ API
  const videoData = {
    id: params.id,
    title: "Football Match Highlights",
    description:
      "This is a detailed analysis of the football match between Team A and Team B. The video shows key moments, player movements, and tactical analysis.\n\nThe detection model has identified players, ball, and referee positions throughout the match.",
    uploadDate: "2023-11-15T10:30:00Z",
    views: 1250,
    likes: 87,
    status: "completed" as const,
    tags: ["football", "analysis", "AI detection", "highlights"],
    videoUrl: "https://example.com/videos/sample.mp4",
    thumbnailUrl: "/images/video-thumbnail.jpg",
    user: {
      id: "user123",
      name: "Sports Analyzer",
      avatar: "/images/user-avatar.jpg",
    },
  };

  // Dữ liệu phát hiện mẫu
  const detectionData = [
    {
      id: "1",
      timestamp: "2023-11-15T10:30:15Z",
      objectType: "player",
      confidence: 0.95,
      boundingBox: { x: 120, y: 80, width: 50, height: 100 },
      frameNumber: 450,
    },
    {
      id: "2",
      timestamp: "2023-11-15T10:30:22Z",
      objectType: "ball",
      confidence: 0.88,
      boundingBox: { x: 350, y: 200, width: 20, height: 20 },
      frameNumber: 660,
    },
    {
      id: "3",
      timestamp: "2023-11-15T10:30:35Z",
      objectType: "referee",
      confidence: 0.92,
      boundingBox: { x: 400, y: 150, width: 45, height: 90 },
      frameNumber: 1050,
    },
    {
      id: "4",
      timestamp: "2023-11-15T10:30:48Z",
      objectType: "player",
      confidence: 0.97,
      boundingBox: { x: 200, y: 120, width: 50, height: 100 },
      frameNumber: 1440,
    },
    {
      id: "5",
      timestamp: "2023-11-15T10:31:02Z",
      objectType: "ball",
      confidence: 0.91,
      boundingBox: { x: 280, y: 180, width: 20, height: 20 },
      frameNumber: 1860,
    },
    {
      id: "6",
      timestamp: "2023-11-15T10:31:15Z",
      objectType: "player",
      confidence: 0.94,
      boundingBox: { x: 320, y: 90, width: 50, height: 100 },
      frameNumber: 2250,
    },
    {
      id: "7",
      timestamp: "2023-11-15T10:31:28Z",
      objectType: "goal",
      confidence: 0.89,
      boundingBox: { x: 500, y: 150, width: 100, height: 80 },
      frameNumber: 2640,
    },
    {
      id: "8",
      timestamp: "2023-11-15T10:31:35Z",
      objectType: "player",
      confidence: 0.96,
      boundingBox: { x: 150, y: 110, width: 50, height: 100 },
      frameNumber: 2850,
    },
  ];

  // Dữ liệu video liên quan mẫu
  const relatedVideos = [
    {
      id: "vid1",
      title: "Team A vs Team C Highlights",
      uploadDate: "2023-11-10T14:20:00Z",
      duration: "5:25",
      thumbnail: "/images/related-1.jpg",
      views: 980,
    },
    {
      id: "vid2",
      title: "Football Tactics Analysis",
      uploadDate: "2023-11-05T09:15:00Z",
      duration: "10:12",
      thumbnail: "/images/related-2.jpg",
      views: 1450,
    },
    {
      id: "vid3",
      title: "Player Performance Review",
      uploadDate: "2023-10-28T16:40:00Z",
      duration: "7:08",
      thumbnail: "/images/related-3.jpg",
      views: 2100,
    },
    {
      id: "vid4",
      title: "Season Highlights Compilation",
      uploadDate: "2023-10-15T11:30:00Z",
      duration: "14:05",
      thumbnail: "/images/related-4.jpg",
      views: 3250,
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <VideoPlayer
            videoUrl={videoData.videoUrl}
            poster={videoData.thumbnailUrl}
            title={videoData.title}
          />

          <VideoDetails video={videoData} locale={params.locale} />

          <DetectionResults detections={detectionData} videoId={params.id} />
        </div>

        <div className="space-y-6">
          <RelatedVideos
            videos={relatedVideos}
            currentVideoId={params.id}
            locale={params.locale}
            isLoading={false}
          />
        </div>
      </div>
    </div>
  );
}

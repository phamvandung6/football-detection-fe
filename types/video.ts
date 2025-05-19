// types/video.ts

// Định nghĩa cấu trúc cho URL stream
export interface VideoStreamUrls {
  hls?: string;
  dash?: string;
}

// Định nghĩa cấu trúc cho metadata của video
export interface VideoMetadata {
  fps?: number;
  width?: number;
  height?: number;
  duration?: string; // Ví dụ: "00:05:30"
  frame_count?: number;
}

// Định nghĩa trạng thái video
export type VideoStatus =
  | "PENDING"
  | "PROCESSING"
  | "READY"
  | "COMPLETED"
  | "FAILED";

// Định nghĩa loại video
export type VideoType = "UPLOADED" | "YOUTUBE";

// Định nghĩa cấu trúc chính cho Video
export interface Video {
  id: string;
  userId: string;
  username: string;
  title: string;
  description: string;
  videoType: VideoType;
  filePath: string;
  fileSize: number;
  duration: number;
  thumbnailPath: string;
  processedPath: string | null;
  youtubeUrl: string | null;
  youtubeVideoId: string | null;
  isDownloadable: boolean;
  status: VideoStatus;
  progress: number;
  createdAt: string;
  updatedAt: string;

  streamUrls?: VideoStreamUrls;
  video_metadata?: VideoMetadata;
  error_message?: string;
}

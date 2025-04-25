// types/video.ts

// Định nghĩa cấu trúc cho bounding box trong detection
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Định nghĩa cấu trúc cho kết quả phát hiện
export interface Detection {
  id: string; // Hoặc number tùy thuộc vào backend
  objectType: string;
  confidence: number;
  timestamp: string; // Hoặc number/Date tùy thuộc vào backend
  boundingBox: BoundingBox;
  frameNumber: number;
}

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
export type VideoStatus = "PENDING" | "PROCESSING" | "READY" | "FAILED";

// Định nghĩa cấu trúc chính cho Video
export interface Video {
  id: string;
  title: string;
  description: string;
  status: VideoStatus;
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string

  // Các trường tùy chọn từ quá trình xử lý/upload
  userId?: string; // ID của người upload
  original_filename?: string;
  processed_filename?: string;
  file_size?: number; // bytes
  thumbnailUrl?: string;
  originalVideoUrl?: string; // URL video gốc (nếu có)
  processedVideoUrl?: string; // URL video đã xử lý (nếu có)
  streamUrls?: VideoStreamUrls;
  video_metadata?: VideoMetadata;
  detections?: Detection[];
  error_message?: string;
  processing_started_at?: string; // ISO 8601 string
  processing_completed_at?: string; // ISO 8601 string
  progress?: number; // Tiến trình xử lý (0-100)
}

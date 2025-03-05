"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  Video,
  getVideos,
  getVideoById,
  uploadVideo,
  deleteVideo,
} from "@/lib/api/videoService";

// Định nghĩa kiểu dữ liệu cho VideoContext
interface VideoContextType {
  videos: Video[];
  isLoading: boolean;
  error: string | null;
  currentVideo: Video | null;
  uploadProgress: number;
  fetchVideos: () => Promise<void>;
  fetchVideoById: (id: string) => Promise<Video | null>;
  uploadNewVideo: (formData: FormData) => Promise<Video | null>;
  removeVideo: (id: string) => Promise<boolean>;
  refreshVideoStatus: (id: string) => Promise<void>;
}

// Tạo context với giá trị mặc định
const VideoContext = createContext<VideoContextType | undefined>(undefined);

// Provider component
export function VideoProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Lấy danh sách video khi người dùng đã xác thực
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchVideos();
    }
  }, [isAuthenticated, token]);

  // Hàm lấy danh sách video
  const fetchVideos = async (): Promise<void> => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getVideos(token);
      setVideos(data);
    } catch (error) {
      console.error("Error fetching videos:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch videos"
      );
      toast.error("Không thể tải danh sách video");
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm lấy chi tiết video theo ID
  const fetchVideoById = async (id: string): Promise<Video | null> => {
    if (!token) return null;

    setIsLoading(true);
    setError(null);

    try {
      const video = await getVideoById(id, token);
      setCurrentVideo(video);
      return video;
    } catch (error) {
      console.error("Error fetching video:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch video"
      );
      toast.error("Không thể tải thông tin video");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm tải lên video mới
  const uploadNewVideo = async (formData: FormData): Promise<Video | null> => {
    if (!token) return null;

    setIsLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const video = await uploadVideo(formData, token, (progress) => {
        setUploadProgress(progress);
      });

      // Cập nhật danh sách video
      setVideos((prevVideos) => [video, ...prevVideos]);
      toast.success("Tải lên video thành công");
      return video;
    } catch (error) {
      console.error("Error uploading video:", error);
      setError(
        error instanceof Error ? error.message : "Failed to upload video"
      );
      toast.error("Không thể tải lên video");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm xóa video
  const removeVideo = async (id: string): Promise<boolean> => {
    if (!token) return false;

    setIsLoading(true);
    setError(null);

    try {
      await deleteVideo(id, token);

      // Cập nhật danh sách video
      setVideos((prevVideos) => prevVideos.filter((video) => video.id !== id));

      // Nếu đang xem video bị xóa, reset currentVideo
      if (currentVideo && currentVideo.id === id) {
        setCurrentVideo(null);
      }

      toast.success("Xóa video thành công");
      return true;
    } catch (error) {
      console.error("Error deleting video:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete video"
      );
      toast.error("Không thể xóa video");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm làm mới trạng thái video
  const refreshVideoStatus = async (id: string): Promise<void> => {
    if (!token) return;

    try {
      const updatedVideo = await getVideoById(id, token);

      // Cập nhật trong danh sách videos
      setVideos((prevVideos) =>
        prevVideos.map((video) => (video.id === id ? updatedVideo : video))
      );

      // Cập nhật currentVideo nếu đang xem video này
      if (currentVideo && currentVideo.id === id) {
        setCurrentVideo(updatedVideo);
      }
    } catch (error) {
      console.error("Error refreshing video status:", error);
    }
  };

  // Giá trị context
  const contextValue: VideoContextType = {
    videos,
    isLoading,
    error,
    currentVideo,
    uploadProgress,
    fetchVideos,
    fetchVideoById,
    uploadNewVideo,
    removeVideo,
    refreshVideoStatus,
  };

  return (
    <VideoContext.Provider value={contextValue}>
      {children}
    </VideoContext.Provider>
  );
}

// Hook để sử dụng VideoContext
export function useVideos() {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error("useVideos must be used within a VideoProvider");
  }
  return context;
}

"use client";

import {
  deleteVideo,
  getVideoById,
  getVideos,
  uploadVideoFile,
} from "@/lib/api/videoService";
import { Video } from "@/types/video";
import {
  InvalidateQueryFilters,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

// --- Hook để lấy danh sách video --- //
export const useVideos = () => {
  return useQuery<Video[], Error>({
    queryKey: ["videos"], // Key cho danh sách video
    queryFn: getVideos, // Hàm fetch dữ liệu
    staleTime: 5 * 60 * 1000, // 5 phút
  });
};

// --- Hook để lấy chi tiết video --- //
export const useVideo = (videoId: string | null | undefined) => {
  return useQuery<Video | null, Error>({
    queryKey: ["video", videoId], // Key bao gồm cả videoId
    queryFn: () => (videoId ? getVideoById(videoId) : Promise.resolve(null)),
    enabled: !!videoId, // Chỉ chạy query khi videoId có giá trị
    staleTime: 10 * 60 * 1000, // 10 phút cho chi tiết video
  });
};

// --- Hook Mutation để Upload Video --- //
interface UploadVideoOptions {
  onSuccess?: (data: {
    success: boolean;
    message: string;
    videoId?: string;
  }) => void;
  onError?: (error: Error) => void;
  onUploadProgress?: (progress: number) => void;
}

export const useUploadVideo = ({
  onSuccess,
  onError,
  onUploadProgress,
}: UploadVideoOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; message: string; videoId?: string }, // Kiểu trả về từ mutationFn
    Error, // Kiểu lỗi
    FormData // Kiểu biến đầu vào cho mutationFn
  >({
    mutationFn: (formData: FormData) =>
      uploadVideoFile(formData, onUploadProgress),
    onSuccess: (data) => {
      // Invalidate cache của danh sách video để cập nhật UI
      queryClient.invalidateQueries(["videos"] as InvalidateQueryFilters);
      if (onSuccess) onSuccess(data);
    },
    onError: (error) => {
      console.error("Upload video mutation failed:", error);
      if (onError) onError(error);
    },
  });
};

// --- Hook Mutation để Xóa Video --- //
interface DeleteVideoOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useDeleteVideo = ({
  onSuccess,
  onError,
}: DeleteVideoOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, string>({
    mutationFn: (videoId: string) => deleteVideo(videoId),
    onSuccess: (success, videoId) => {
      if (success) {
        // Invalidate cache của danh sách video
        queryClient.invalidateQueries(["videos"] as InvalidateQueryFilters);
        // Invalidate cache của video chi tiết
        queryClient.invalidateQueries([
          "video",
          videoId,
        ] as InvalidateQueryFilters);
        if (onSuccess) onSuccess();
      }
    },
    onError: (error) => {
      console.error("Delete video mutation failed:", error);
      if (onError) onError(error);
    },
  });
};

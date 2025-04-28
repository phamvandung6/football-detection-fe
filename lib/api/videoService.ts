import { Video } from "@/types/video"; // Import type Video từ types/
import { apiClient } from "./apiClient";

// Định nghĩa kiểu dữ liệu cho API response
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// Định nghĩa kiểu dữ liệu phân trang
interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// Giữ lại các interface để tránh lỗi
export interface VideoMetadata {
  fps: number;
  width: number;
  height: number;
  duration: string;
  frame_count: number;
}

// Interface cho URL streaming
export interface VideoStreamUrls {
  original_url: string;
  processed_url: string | null;
  status: string;
  dimensions: {
    width: number;
    height: number;
  };
}

// Interface cho đối tượng phát hiện
export interface Detection {
  id: string;
  objectType: string;
  confidence: number;
  timestamp: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  frameNumber: number;
}

/**
 * Fetch danh sách videos
 */
export const getVideos = async (): Promise<Video[]> => {
  try {
    const { data } = await apiClient.get<PageResponse<Video> | Video[]>(
      "/videos"
    );

    // Kiểm tra nếu data là cấu trúc phân trang (có content)
    if (data && typeof data === "object" && "content" in data) {
      // Trích xuất mảng videos từ content
      const pageResponse = data as PageResponse<Video>;
      console.log(
        "[Video Service] Returned paginated data with",
        pageResponse.content.length,
        "videos"
      );
      return pageResponse.content || [];
    }

    // Nếu data đã là mảng video
    if (Array.isArray(data)) {
      console.log(
        "[Video Service] Returned array data with",
        data.length,
        "videos"
      );
      return data;
    }

    // Fallback nếu data không phải là mảng và không có content
    console.warn("[Video Service] Unexpected data format:", data);
    return [];
  } catch (error) {
    console.error("[Video Service] Error fetching videos:", error);
    throw new Error("Failed to fetch videos");
  }
};

/**
 * Fetch chi tiết video bằng ID
 */
export const getVideoById = async (id: string): Promise<Video | null> => {
  try {
    const { data } = await apiClient.get<Video>(`/videos/${id}`);
    return data || null;
  } catch (error) {
    console.error(`[Video Service] Error fetching video ${id}:`, error);
    return null;
  }
};

/**
 * Upload video mới
 */
export const uploadVideoFile = async (
  formData: FormData,
  onUploadProgress?: (progress: number) => void
): Promise<{ success: boolean; message: string; videoId?: string }> => {
  try {
    const { data } = await apiClient.post<{
      success: boolean;
      message: string;
      id?: string;
    }>("/videos/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onUploadProgress(percentCompleted);
        }
      },
    });

    return {
      success: data.success || false,
      message: data.message || "Upload successful",
      videoId: data.id,
    };
  } catch (error: any) {
    console.error("[Video Service] Error uploading video:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to upload video",
    };
  }
};

/**
 * Xóa video bằng ID
 */
export const deleteVideo = async (id: string): Promise<boolean> => {
  try {
    await apiClient.delete(`/videos/${id}`);
    return true;
  } catch (error) {
    console.error(`[Video Service] Error deleting video ${id}:`, error);
    return false;
  }
};

/**
 * Lấy URL streaming video
 */
export async function getVideoStreamUrls(id: string): Promise<VideoStreamUrls> {
  try {
    // Sử dụng Promise.all để gọi song song các API cần thiết
    const [originalUrlResponse, processedUrlResponse, videoResponse] =
      await Promise.all([
        apiClient
          .get<string>(`/videos/${id}/presigned-url?expirationInMinutes=15`)
          .catch(() => null),
        apiClient
          .get<string>(`/videos/${id}/processed-url?expirationInMinutes=15`)
          .catch(() => null),
        apiClient.get<Video>(`/videos/${id}`),
      ]);

    const video = videoResponse.data;

    // Tạo đối tượng VideoStreamUrls từ dữ liệu
    return {
      original_url: originalUrlResponse?.data || "",
      processed_url: processedUrlResponse?.data || null,
      status: video.status,
      dimensions: {
        width: video.video_metadata?.width || 1280, // Fallback nếu không có metadata
        height: video.video_metadata?.height || 720,
      },
    };
  } catch (error) {
    console.error(
      `[Video Service] Error getting stream URLs for video ${id}:`,
      error
    );
    throw new Error("Không thể lấy URL stream video");
  }
}

/**
 * Lấy kết quả phát hiện đối tượng
 */
export async function getVideoDetections(id: string): Promise<Detection[]> {
  try {
    const { data } = await apiClient.get<Detection[]>(
      `/videos/${id}/detections`
    );
    return data || [];
  } catch (error) {
    console.error(
      `[Video Service] Error fetching detections for video ${id}:`,
      error
    );
    return [];
  }
}

/**
 * Lấy URL download video
 */
export async function getVideoDownloadUrl(
  id: string,
  processed: boolean = false
): Promise<string> {
  try {
    const endpoint = processed
      ? `/videos/${id}/download/processed`
      : `/videos/${id}/download`;

    const { data } = await apiClient.get<string>(endpoint);
    return data;
  } catch (error) {
    console.error(
      `[Video Service] Error getting download URL for video ${id}:`,
      error
    );
    throw new Error("Không thể lấy URL download video");
  }
}

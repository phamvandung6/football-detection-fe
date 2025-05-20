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

// Interface cho trạng thái xử lý video
export interface VideoProcessingStatus {
  progress: number;
  videoId: string;
  message: string;
  status: 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED';
  updatedAt?: string;
}

// Interface cho URL stream video
export interface VideoStreamInfo {
  url: string;
  expiresAt: string;
  title: string;
  videoType: string;
}

// Cập nhật VideoUploadResponseData để khớp với response đầy đủ từ backend
// Đây là cấu trúc của object được trả về trực tiếp bởi API upload (không có wrapper ApiResponse)
interface VideoUploadResponse {
    id: string;
    userId: string;
    username: string;
    title: string;
    description: string;
    videoType: "UPLOADED" | "YOUTUBE"; 
    filePath: string;
    fileSize: number;
    duration: number | null;
    thumbnailPath: string | null;
    processedPath: string | null;
    youtubeUrl: string | null;
    youtubeVideoId: string | null;
    isDownloadable: boolean;
    status: 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED'; 
    progress: number;
    createdAt: string | null; 
    updatedAt: string | null; 
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
    // Giả định apiClient.post trả về một object response (ví dụ: AxiosResponse)
    // và dữ liệu thực tế từ API nằm trong response.data
    const response = await apiClient.post<VideoUploadResponse>("/videos", formData, {
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
    
    // Dữ liệu thực tế từ server nằm trong response.data
    const responseData = response.data; 

    console.log("[videoService] Upload API response (actual data object from response.data):", responseData);

    if (responseData && responseData.id) {
      return {
        success: true, 
        message: "Video uploaded successfully", // Hoặc responseData.message nếu API upload có trả về
        videoId: responseData.id,
      };
    } else {
      console.error("[videoService] Upload response missing video ID or invalid structure:", responseData);
      return {
        success: false,
        message: "Upload failed: No video ID in response or invalid structure",
        videoId: undefined,
      };
    }

  } catch (error: any) {
    console.error("[videoService] Error uploading video:", error);
    const apiErrorMessage = error.response?.data?.message || error.response?.data?.error || (typeof error.response?.data === 'string' ? error.response.data : undefined);
    const finalMessage = apiErrorMessage || error.message || "Failed to upload video";
    return {
      success: false, 
      message: finalMessage,
      videoId: undefined
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
 * Lấy trạng thái xử lý video
 */
export const getVideoProcessingStatus = async (videoIdInput: string): Promise<VideoProcessingStatus | null> => {
  try {
    // API trả về cấu trúc ApiResponse<VideoProcessingStatusContent>
    // Trong đó VideoProcessingStatusContent có thể thiếu videoId hoặc có status là "COMPLETED"
    interface VideoProcessingStatusContentFromApi {
        progress: number;
        status: string; // Nhận string từ API (có thể là "COMPLETED")
        message: string;
        videoId?: string; // API có thể không trả về videoId trong một số trường hợp (vd: COMPLETED)
        updatedAt?: string; // API có thể không trả về updatedAt
    }

    const response = await apiClient.get<ApiResponse<VideoProcessingStatusContentFromApi>>(`/videos/${videoIdInput}/processing-status`);
    const apiResponse = response.data; // Đây là object { success, message, data: statusContent, timestamp }

    console.log(`[Video Service] Raw ApiResponse for getVideoProcessingStatus for ${videoIdInput}:`, apiResponse);

    if (apiResponse && apiResponse.success && apiResponse.data) {
      const statusContent = apiResponse.data;
      
      // Tạo object VideoProcessingStatus hoàn chỉnh
      const processedStatus: VideoProcessingStatus = {
        progress: statusContent.progress,
        message: statusContent.message,
        // Map "COMPLETED" từ backend thành "READY" cho frontend
        // và đảm bảo status là một trong các giá trị của union type
        status: statusContent.status === 'COMPLETED' ? 'READY' : 
                (statusContent.status === 'PENDING' || statusContent.status === 'PROCESSING' || statusContent.status === 'FAILED' || statusContent.status === 'READY') 
                ? statusContent.status as VideoProcessingStatus['status'] 
                : 'FAILED', // Fallback nếu status từ API không hợp lệ
        videoId: statusContent.videoId || videoIdInput, // Ưu tiên videoId từ API, nếu không có thì dùng videoIdInput
        updatedAt: statusContent.updatedAt || apiResponse.timestamp, // Ưu tiên updatedAt từ API, nếu không có thì dùng timestamp của response
      };

      console.log(`[Video Service] Processed status data for ${videoIdInput}:`, processedStatus);
      
      // Kiểm tra lại các trường bắt buộc sau khi xử lý
      if (processedStatus.videoId && processedStatus.status) {
          return processedStatus;
      } else {
          console.warn(`[Video Service] getVideoProcessingStatus for ${videoIdInput} - processedStatus is missing required fields:`, processedStatus);
          return null;
      }
    } else {
      console.warn(`[Video Service] getVideoProcessingStatus for ${videoIdInput} - API call not successful or no data field:`, apiResponse);
      return null;
    }
  } catch (error: any) {
    console.error(`[Video Service] Error fetching processing status for video ${videoIdInput}:`, error);
    if (error.response) {
      console.error(`[Video Service] API Error details for ${videoIdInput} (processing status):`, error.response.data);
    }
    return null;
  }
};

/**
 * Lấy URL stream video
 */
export const getVideoStreamUrl = async (id: string): Promise<VideoStreamInfo | null> => {
  try {
    const response = await apiClient.get<VideoStreamInfo>(`/videos/${id}/stream`);
    return response.data;
  } catch (error) {
    console.error(`[Video Service] Error fetching stream URL for video ${id}:`, error);
    return null;
  }
};

/**
 * Refresh URL stream video khi hết hạn
 */
export const refreshVideoStreamUrl = async (id: string): Promise<{ url: string, expiresAt: string } | null> => {
  try {
    const { data } = await apiClient.get<{ url: string, expiresAt: string }>(`/videos/${id}/stream/refresh`);
    return data;
  } catch (error) {
    console.error(`[Video Service] Error refreshing stream URL for video ${id}:`, error);
    return null;
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
  processed: boolean = false,
  expirationMinutes: number = 30
): Promise<string> {
  try {
    const endpoint = processed
      ? `/videos/${id}/download/processed?expirationMinutes=${expirationMinutes}`
      : `/videos/${id}/download/original?expirationMinutes=${expirationMinutes}`;

    console.log(`[Video Service] Đang gọi API: ${endpoint}`);
    
    // Log để debug nhưng không ảnh hưởng đến luồng chính
    setTimeout(() => {
      try {
        console.log(`[Video Service Debug] API Client configs:`, {
          baseURL: apiClient.defaults?.baseURL,
          timeout: apiClient.defaults?.timeout,
          headers: apiClient.defaults?.headers
        });
      } catch (e) {
        // Bỏ qua lỗi trong debug log
      }
    }, 0);
    
    // Bắt đầu gọi API
    console.log(`[Video Service] Bắt đầu request`);
    const response = await apiClient.get<string>(endpoint);
    console.log(`[Video Service] Nhận được response:`, response);
    
    // Kiểm tra nếu response có dữ liệu URL
    if (response.data && typeof response.data === 'string') {
      console.log(`[Video Service] URL download hợp lệ:`, response.data);
      return response.data;
    }
    
    // Trường hợp không phải là string nhưng có thể là object
    if (response.data && typeof response.data === 'object') {
      console.log(`[Video Service] Response không phải là URL trực tiếp, đang kiểm tra object:`, response.data);
      
      // Kiểm tra nếu response.data có trường url
      const dataObj = response.data as any;
      if (dataObj.url && typeof dataObj.url === 'string') {
        console.log(`[Video Service] Tìm thấy URL trong response.data.url:`, dataObj.url);
        return dataObj.url;
      }
      
      // Kiểm tra nếu response.data có trường data (có thể là nested ApiResponse)
      if (dataObj.data && typeof dataObj.data === 'string') {
        console.log(`[Video Service] Tìm thấy URL trong response.data.data:`, dataObj.data);
        return dataObj.data;
      }
    }
    
    console.error(`[Video Service] Không tìm thấy URL download trong response:`, response.data);
    throw new Error("Không thể lấy URL download video: URL không hợp lệ");

  } catch (error: any) {
    console.error(
      `[Video Service] Lỗi khi lấy URL download cho video ${id}:`,
      error
    );
    
    // Log thêm chi tiết lỗi
    if (error.response) {
      console.error(`[Video Service] Chi tiết lỗi API cho ${id}:`, {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error(`[Video Service] Request đã gửi nhưng không nhận được response:`, error.request);
    }
    
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      "Không thể lấy URL download video"
    );
  }
}
